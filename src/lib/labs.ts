import { prisma } from "@/lib/prisma";

export async function listPanelsForUser(userId: string) {
  return prisma.labPanel.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: { results: true },
  });
}

export async function getPanel(panelId: string) {
  return prisma.labPanel.findUnique({
    where: { id: panelId },
    include: { results: { orderBy: { name: "asc" } }, user: true },
  });
}

export async function getLatestPublishedPanel(userId: string) {
  return prisma.labPanel.findFirst({
    where: { userId, status: "published" },
    orderBy: { date: "desc" },
    include: { results: true },
  });
}

export async function getResultHistory(userId: string, name: string) {
  return prisma.labResult.findMany({
    where: { name, panel: { userId } },
    orderBy: { panel: { date: "asc" } },
    include: { panel: { select: { date: true, id: true } } },
  });
}
