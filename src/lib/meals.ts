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
