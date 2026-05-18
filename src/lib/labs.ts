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

// Bulk previous values keyed by result name for a single client. Used to
// compute delta-vs-previous on the panel detail view without N round-trips.
export async function getPreviousValuesMap(
  userId: string,
  beforePanelDate: Date,
): Promise<Map<string, { value: number; date: Date }>> {
  const rows = await prisma.labResult.findMany({
    where: {
      panel: { userId, status: "published", date: { lt: beforePanelDate } },
    },
    include: { panel: { select: { date: true } } },
    orderBy: { panel: { date: "desc" } },
  });
  const out = new Map<string, { value: number; date: Date }>();
  for (const r of rows) {
    if (!out.has(r.name)) out.set(r.name, { value: r.value, date: r.panel.date });
  }
  return out;
}
