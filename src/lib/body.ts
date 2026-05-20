import { prisma } from "@/lib/prisma";

export async function getLatestWeight(userId: string) {
  return prisma.bodyMeasurement.findFirst({
    where: { userId, type: "weight" },
    orderBy: { measuredAt: "desc" },
  });
}

export async function getLatestWaist(userId: string) {
  return prisma.bodyMeasurement.findFirst({
    where: { userId, type: "waist" },
    orderBy: { measuredAt: "desc" },
  });
}

export async function getWeightHistory(userId: string, days = 60) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  return prisma.bodyMeasurement.findMany({
    where: { userId, type: "weight", measuredAt: { gte: since } },
    orderBy: { measuredAt: "asc" },
  });
}

// Look up a weight roughly N days ago — picks the latest sample at or
// before the cutoff so the delta isn't sensitive to a missing weigh-in
// on the exact day.
export async function getWeightAround(userId: string, daysAgo: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysAgo);
  return prisma.bodyMeasurement.findFirst({
    where: { userId, type: "weight", measuredAt: { lte: cutoff } },
    orderBy: { measuredAt: "desc" },
  });
}

export async function getRecentVitals(userId: string, type: "bp" | "glucose", limit = 5) {
  return prisma.vitalReading.findMany({
    where: { userId, type },
    orderBy: { measuredAt: "desc" },
    take: limit,
  });
}

export async function getLatestBodyFatPct(userId: string) {
  return prisma.bodyMeasurement.findFirst({
    where: { userId, type: "bodyFat" },
    orderBy: { measuredAt: "desc" },
  });
}

export async function getLatestMuscleMass(userId: string) {
  return prisma.bodyMeasurement.findFirst({
    where: { userId, type: "muscleMass" },
    orderBy: { measuredAt: "desc" },
  });
}

// Ideal weight range. WHO Asia-Pacific BMI cutoff (also Thai MOPH /
// Thai Diabetes Association guideline): BMI 18.5–22.9 is normal —
// >=23 is overweight, >=25 obese. This is tighter than the global
// WHO band (25/30) because Asian populations show metabolic risk at
// lower BMI thresholds.
export function idealWeightRange(heightCm: number | null): { low: number; high: number } | null {
  if (!heightCm || heightCm <= 0) return null;
  const m = heightCm / 100;
  return {
    low: +(18.5 * m * m).toFixed(1),
    high: +(22.9 * m * m).toFixed(1),
  };
}

// Healthy body-fat % band. Tuned to the Omron HBF series reference
// adopted by most Thai-market smart scales:
//   Male:   10–19.9% normal (≥20 slightly high, ≥25 high)
//   Female: 20–29.9% normal (≥30 slightly high, ≥35 high)
// Unisex fallback widens to 10–28%.
export function healthyBodyFatRange(gender: string | null): { low: number; high: number } {
  if (gender === "male") return { low: 10, high: 19.9 };
  if (gender === "female") return { low: 20, high: 29.9 };
  return { low: 10, high: 28 };
}

// Skeletal-muscle % healthy band — widened upper edge to cover InBody's
// "normal" classification which includes athletic builds (the 33.3 floor
// stays, the 39.3 ceiling extends to ~45 to keep gym-active users from
// being flagged as "high"). Above the ceiling is still "good" (athletic),
// just past the reference band; UI treats high-muscle as a positive flag.
//   Male:   33.3–45% normal+athletic
//   Female: 24.3–37% normal+athletic
export function healthyMuscleMassRange(gender: string | null): { low: number; high: number } {
  if (gender === "male") return { low: 33.3, high: 45 };
  if (gender === "female") return { low: 24.3, high: 37 };
  return { low: 28, high: 42 };
}

export function rangeFlag(
  value: number,
  low: number,
  high: number,
): "low" | "normal" | "high" {
  if (value < low) return "low";
  if (value > high) return "high";
  return "normal";
}

// Lean body mass derived from latest weight + latest body fat %.
// Falls back to null if either is missing or the body-fat reading is older
// than 30 days (stale composition shouldn't override Mifflin-St Jeor).
export async function getLatestLBM(userId: string): Promise<number | null> {
  const [weight, fat] = await Promise.all([
    getLatestWeight(userId),
    getLatestBodyFatPct(userId),
  ]);
  if (!weight || !fat) return null;
  const ageMs = Date.now() - fat.measuredAt.getTime();
  const thirtyDays = 30 * 86400000;
  if (ageMs > thirtyDays) return null;
  if (fat.value <= 0 || fat.value >= 100) return null;
  return +(weight.value * (1 - fat.value / 100)).toFixed(2);
}
