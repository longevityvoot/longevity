import { prisma } from "@/lib/prisma";
import { todayLocalDate } from "@/lib/dates";

export const MED_SLOTS = ["เช้า", "กลางวัน", "เย็น", "ก่อนนอน"] as const;
export type MedSlot = (typeof MED_SLOTS)[number];

export const SOURCE_LABEL: Record<string, string> = {
  doctor: "แพทย์",
  pharmacist: "ร้านยา",
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

// 7-day taken/missed vector ending today. Each entry is true if any slot
// on that day has a positive log, false if logged but missed, null if
// the day has no log yet. Powers the small 7-bar adherence pattern.
export function adherenceVector7d(
  logs: Array<{ date: Date; taken: boolean }>,
  today: Date,
): Array<{ date: Date; taken: boolean | null }> {
  const map = new Map<string, boolean>();
  for (const l of logs) {
    const key = isoDay(l.date);
    if (l.taken) map.set(key, true);
    else if (!map.has(key)) map.set(key, false);
  }
  const out: Array<{ date: Date; taken: boolean | null }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = isoDay(d);
    const taken = map.has(key) ? (map.get(key) as boolean) : null;
    out.push({ date: d, taken });
  }
  return out;
}

function isoDay(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}
