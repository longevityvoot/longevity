import { prisma } from "@/lib/prisma";
import { todayLocalDate } from "@/lib/dates";

export const MEAL_TYPES = [
  { key: "breakfast", label: "เช้า" },
  { key: "lunch",     label: "กลางวัน" },
  { key: "dinner",    label: "เย็น" },
  { key: "snack",     label: "ของว่าง" },
] as const;

export type MealType = (typeof MEAL_TYPES)[number]["key"];

export async function getMealsForDay(userId: string, date?: Date) {
  const day = date ?? todayLocalDate();
  return prisma.meal.findMany({
    where: { userId, date: day },
    orderBy: { createdAt: "asc" },
  });
}

export async function getDailyKcalHistory(userId: string, days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const rows = await prisma.meal.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: "asc" },
    select: { date: true, kcal: true },
  });
  const byDay = new Map<string, number>();
  for (const r of rows) {
    const k = r.date.toISOString().slice(0, 10);
    byDay.set(k, (byDay.get(k) ?? 0) + (r.kcal ?? 0));
  }
  return byDay;
}

// Per-day kcal + quality map for the trailing window. Each entry is
// { kcal, qualityScore } where qualityScore is null when no meal was
// rated that day.
export async function getDailyNutritionHistory(userId: string, days = 14) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const rows = await prisma.meal.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: "asc" },
    select: {
      date: true,
      kcal: true,
      proteinRating: true,
      vegRating: true,
      carbRating: true,
      fatRating: true,
    },
  });
  const byDay = new Map<string, { kcal: number; rated: MealRatings[] }>();
  for (const r of rows) {
    const k = r.date.toISOString().slice(0, 10);
    const cur = byDay.get(k) ?? { kcal: 0, rated: [] };
    cur.kcal += r.kcal ?? 0;
    cur.rated.push({
      proteinRating: r.proteinRating,
      vegRating: r.vegRating,
      carbRating: r.carbRating,
      fatRating: r.fatRating,
    });
    byDay.set(k, cur);
  }
  const result = new Map<string, { kcal: number; qualityScore: number | null }>();
  for (const [k, v] of byDay) {
    result.set(k, { kcal: v.kcal, qualityScore: dailyMealQuality(v.rated) });
  }
  return result;
}

// BMR estimate. When lean body mass (LBM) is known we use Katch-McArdle —
// more accurate for individuals because it accounts for body composition.
// Otherwise we fall back to Mifflin-St Jeor which uses total weight only.
//
// Katch-McArdle:    370 + 21.6 * LBM (kg)
// Mifflin-St Jeor male:   10 * kg + 6.25 * cm - 5 * age + 5
// Mifflin-St Jeor female: 10 * kg + 6.25 * cm - 5 * age - 161
export function estimateBMR({
  gender,
  weightKg,
  heightCm,
  ageYears,
  lbmKg,
}: {
  gender: string;
  weightKg: number;
  heightCm: number;
  ageYears: number;
  lbmKg?: number | null;
}): number {
  if (lbmKg != null && lbmKg > 0) {
    return Math.round(370 + 21.6 * lbmKg);
  }
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  return Math.round(gender === "male" ? base + 5 : base - 161);
}

export function bmrMethod(lbmKg: number | null | undefined): "katch-mcardle" | "mifflin-st-jeor" {
  return lbmKg != null && lbmKg > 0 ? "katch-mcardle" : "mifflin-st-jeor";
}

// Sedentary multiplier: BMR * 1.4 — light activity. Coach can tune later.
export function estimateDailyTarget(bmr: number, activityFactor = 1.4): number {
  return Math.round(bmr * activityFactor);
}

export function totalKcal(meals: Array<{ kcal: number | null }>): number {
  return meals.reduce((sum, m) => sum + (m.kcal ?? 0), 0);
}

export type MealRatings = {
  proteinRating: number | null;
  vegRating: number | null;
  carbRating: number | null;
  fatRating: number | null;
};

// Bell-curve rating → quality score per axis.
//   0  พอดี        → 100
//   ±1 ขาด/เกินนิด →  60
//   ±2 ขาด/เกินมาก →  25
function qualityFromRating(r: number | null): number | null {
  if (r == null) return null;
  if (r === 0) return 100;
  if (Math.abs(r) === 1) return 60;
  return 25;
}

// Average quality across all rated axes of all meals in a day.
// Returns null when no meal was rated on any axis (so scoring can fall
// back to kcal-only).
export function dailyMealQuality(meals: MealRatings[]): number | null {
  const samples: number[] = [];
  for (const m of meals) {
    for (const r of [m.proteinRating, m.vegRating, m.carbRating, m.fatRating]) {
      const q = qualityFromRating(r);
      if (q != null) samples.push(q);
    }
  }
  if (samples.length === 0) return null;
  return Math.round(samples.reduce((s, v) => s + v, 0) / samples.length);
}

// Average quality per axis across a day's meals — used for the daily
// breakdown card on the nutrition page so the user sees which axis lagged.
export function dailyQualityByAxis(meals: MealRatings[]): {
  protein: number | null;
  veg: number | null;
  carb: number | null;
  fat: number | null;
} {
  const acc: Record<string, number[]> = { protein: [], veg: [], carb: [], fat: [] };
  for (const m of meals) {
    const map: Array<[keyof MealRatings, string]> = [
      ["proteinRating", "protein"],
      ["vegRating",     "veg"],
      ["carbRating",    "carb"],
      ["fatRating",     "fat"],
    ];
    for (const [key, label] of map) {
      const q = qualityFromRating(m[key]);
      if (q != null) acc[label].push(q);
    }
  }
  const avg = (arr: number[]) =>
    arr.length === 0 ? null : Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
  return {
    protein: avg(acc.protein),
    veg:     avg(acc.veg),
    carb:    avg(acc.carb),
    fat:     avg(acc.fat),
  };
}
