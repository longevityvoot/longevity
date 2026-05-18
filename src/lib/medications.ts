import { prisma } from "@/lib/prisma";
import { todayLocalDate } from "@/lib/dates";

export const MED_SLOTS = ["เช้า", "กลางวัน", "เย็น", "ก่อนนอน"] as const;
export type MedSlot = (typeof MED_SLOTS)[number];

export const SOURCE_LABEL: Record<string, string> = {
  doctor: "แพทย์",
  pharmacist: "เภสัชกร",
  coach: "designer",
  self: "ตัวเอง",
};

export const SOURCE_TONE: Record<string, string> = {
  doctor: "bg-pillar-sleep-wash text-pillar-sleep",
  pharmacist: "bg-pillar-nutrition-wash text-pillar-nutrition",
  coach: "bg-pillar-stress-wash text-pillar-stress",
  self: "bg-canvas text-ink-3 border border-border",
};

export const TYPE_LABEL: Record<string, string> = {
  rx: "ยาตามใบสั่งแพทย์",
  supplement: "อาหารเสริม",
  prn: "ยาเมื่อจำเป็น",
};

export async function listMedications(userId: string) {
  return prisma.medication.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { startedDate: "desc" }],
    include: {
      logs: {
        where: {
          date: {
            gte: (() => {
              const d = new Date();
              d.setDate(d.getDate() - 7);
              return d;
            })(),
          },
        },
      },
    },
  });
}

export async function getTodaySchedule(userId: string) {
  const today = todayLocalDate();
  const meds = await prisma.medication.findMany({
    where: { userId, status: "active" },
    include: {
      logs: { where: { date: today } },
    },
  });
  // Group by slot
  const slots: Record<string, Array<{
    med: (typeof meds)[number];
    taken: boolean;
    logId: string | null;
  }>> = {};
  for (const slot of MED_SLOTS) slots[slot] = [];
  for (const m of meds) {
    for (const slot of m.schedule) {
      const log = m.logs.find((l) => l.slot === slot);
      (slots[slot] ??= []).push({
        med: m,
        taken: log?.taken ?? false,
        logId: log?.id ?? null,
      });
    }
  }
  return slots;
}

export function adherence7d(logs: Array<{ taken: boolean }>): number {
  if (logs.length === 0) return 0;
  const taken = logs.filter((l) => l.taken).length;
  return Math.round((taken / logs.length) * 100);
}
