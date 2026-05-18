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

export async function getRecentVitals(userId: string, type: "bp" | "glucose", limit = 5) {
  return prisma.vitalReading.findMany({
    where: { userId, type },
    orderBy: { measuredAt: "desc" },
    take: limit,
  });
}
