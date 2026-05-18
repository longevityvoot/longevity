import { prisma } from "@/lib/prisma";

export type ActionItem = { text: string; completed?: boolean };

export type SessionDTO = {
  id: string;
  type: string;
  scheduledAt: Date | null;
  durationMin: number | null;
  summary: string | null;
  actionItems: ActionItem[];
  status: string;
  createdAt: Date;
};

export function parseActionItems(raw: unknown): ActionItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (x): x is ActionItem =>
      x !== null &&
      typeof x === "object" &&
      typeof (x as { text?: unknown }).text === "string",
  );
}

export async function listSessionsForClient(clientId: string): Promise<SessionDTO[]> {
  const rows = await prisma.session.findMany({
    where: { clientId },
    orderBy: [{ scheduledAt: "desc" }, { createdAt: "desc" }],
    take: 20,
  });
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    scheduledAt: r.scheduledAt,
    durationMin: r.durationMin,
    summary: r.summary,
    actionItems: parseActionItems(r.actionItems),
    status: r.status,
    createdAt: r.createdAt,
  }));
}

export async function getUpcomingSessionForClient(clientId: string) {
  return prisma.session.findFirst({
    where: {
      clientId,
      status: "upcoming",
      scheduledAt: { gte: new Date() },
    },
    orderBy: { scheduledAt: "asc" },
  });
}
