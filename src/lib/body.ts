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
