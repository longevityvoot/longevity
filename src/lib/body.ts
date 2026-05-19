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
