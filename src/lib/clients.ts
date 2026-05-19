import { prisma } from "@/lib/prisma";
import { scoreFromCheckIn, overallScore, type PillarScores } from "@/lib/scoring";
import { todayLocalDate } from "@/lib/dates";

export type ClientRowDTO = {
  id: string;
  name: string;
  email: string;
  hasCheckedInToday: boolean;
  lastCheckInAt: Date | null;
  scores: PillarScores | null;
  overall: number | null;
  alerts: string[];
};

// List active clients with computed today-scores. Coach + admin see everyone;
// in Phase 4 we don't filter by assignedCoachId yet because there's only one
// designer using the system — refine when multi-coach lands.
//
// Filter by ClientProfile presence rather than role so a COACH/ADMIN who
// dogfoods through the client side (own LINE account onboards) also shows up
// in the designer console list.
export async function listClients(): Promise<ClientRowDTO[]> {
  const today = todayLocalDate();
  const clients = await prisma.user.findMany({
    where: { clientProfile: { isNot: null } },
    select: {
      id: true,
      name: true,
      email: true,
      dailyCheckIns: {
        orderBy: { date: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  return clients.map((c) => {
    const latest = c.dailyCheckIns[0] ?? null;
    const scores = scoreFromCheckIn(latest);
    const overall = overallScore(scores);
    const hasToday =
      !!latest && latest.date.getTime() === today.getTime();

    const alerts: string[] = [];
    if (!hasToday) alerts.push("ยังไม่ check-in วันนี้");
    if (overall != null && overall < 50) alerts.push("คะแนนรวมต่ำ");
    if (scores && scores.sleep < 40) alerts.push("นอนไม่ดี");
    if (scores && scores.stress < 40) alerts.push("เครียดสูง");

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      hasCheckedInToday: hasToday,
      lastCheckInAt: latest?.date ?? null,
      scores,
      overall,
      alerts,
    };
  });
}

export type ClientDetailDTO = {
  id: string;
  name: string;
  email: string;
  profile: {
    dateOfBirth: Date;
    gender: string;
    heightCm: number;
    weightKg: number;
    longevityGoal: string | null;
    interestTags: string[];
    wearableType: string | null;
    medicalHistory: string | null;
    allergies: string | null;
  } | null;
  recentCheckIns: Array<{
    date: Date;
    scores: PillarScores | null;
    overall: number | null;
    notes: string | null;
  }>;
  todayScores: PillarScores | null;
  todayOverall: number | null;
};

export async function getClientDetail(id: string): Promise<ClientDetailDTO | null> {
  const today = todayLocalDate();
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      clientProfile: true,
      dailyCheckIns: { orderBy: { date: "desc" }, take: 14 },
    },
  });
  if (!user || !user.clientProfile) return null;

  const recentCheckIns = user.dailyCheckIns.map((ci) => {
    const scores = scoreFromCheckIn(ci);
    return {
      date: ci.date,
      scores,
      overall: overallScore(scores),
      notes: ci.notes,
    };
  });

  const todayCI = user.dailyCheckIns.find(
    (ci) => ci.date.getTime() === today.getTime(),
  ) ?? null;
  const todayScores = scoreFromCheckIn(todayCI);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.clientProfile
      ? {
          dateOfBirth: user.clientProfile.dateOfBirth,
          gender: user.clientProfile.gender,
          heightCm: user.clientProfile.heightCm,
          weightKg: user.clientProfile.weightKg,
          longevityGoal: user.clientProfile.longevityGoal,
          interestTags: user.clientProfile.interestTags,
          wearableType: user.clientProfile.wearableType,
          medicalHistory: user.clientProfile.medicalHistory,
          allergies: user.clientProfile.allergies,
        }
      : null,
    recentCheckIns,
    todayScores,
    todayOverall: overallScore(todayScores),
  };
}

export function ageFromDOB(dob: Date): number {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
  return age;
}

// LINE Login doesn't grant email scope, so we synthesize `line-<sub>@line.local`
// to satisfy NextAuth's email requirement. Don't surface those to users.
export function isSyntheticLineEmail(email: string | null | undefined): boolean {
  return !!email && email.startsWith("line-") && email.endsWith("@line.local");
}
