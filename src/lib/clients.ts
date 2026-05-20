import { prisma } from "@/lib/prisma";
import {
  scoreFromCheckIn,
  overallScore,
  substancesCtxFromWeekly,
  socialCtxFromWeekly,
  type PillarScores,
} from "@/lib/scoring";
import { todayLocalDate, mondayOf, dateKey } from "@/lib/dates";
import {
  estimateBMR,
  estimateDailyTarget,
  estimateDailyGoal,
  getDailyNutritionHistory,
  getMealsForDay,
  totalKcal,
  dailyMealQuality,
} from "@/lib/meals";
import { getLatestLBM } from "@/lib/body";

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
  const thisWeekStart = mondayOf(today);
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
      weeklyReflections: {
        where: { weekStart: thisWeekStart },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  });

  return clients.map((c) => {
    const latest = c.dailyCheckIns[0] ?? null;
    const weekly = c.weeklyReflections[0] ?? null;
    const scores = scoreFromCheckIn(latest, {
      social: socialCtxFromWeekly(weekly),
      substances: substancesCtxFromWeekly(weekly),
    });
    const overall = overallScore(scores);
    const hasToday =
      !!latest && latest.date.getTime() === today.getTime();

    const alerts: string[] = [];
    if (!hasToday) alerts.push("ยังไม่ประเมินวันนี้");
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

  const earliest = user.dailyCheckIns[user.dailyCheckIns.length - 1]?.date ?? today;
  const earliestWeek = mondayOf(earliest);
  const [todayMeals, nutritionHistory, latestLbm, weeklies] = await Promise.all([
    getMealsForDay(id, today),
    getDailyNutritionHistory(id, 14),
    getLatestLBM(id),
    prisma.weeklyReflection.findMany({
      where: { userId: id, weekStart: { gte: earliestWeek } },
      orderBy: { weekStart: "desc" },
    }),
  ]);
  const bmr = estimateBMR({
    gender: user.clientProfile.gender,
    weightKg: user.clientProfile.weightKg,
    heightCm: user.clientProfile.heightCm,
    ageYears: ageFromDOB(user.clientProfile.dateOfBirth),
    lbmKg: latestLbm,
  });
  const dailyTarget = estimateDailyGoal(estimateDailyTarget(bmr));
  const weeklyByKey = new Map(weeklies.map((w) => [dateKey(w.weekStart), w]));
  const weeklyFor = (d: Date) => weeklyByKey.get(dateKey(mondayOf(d))) ?? null;

  const recentCheckIns = user.dailyCheckIns.map((ci) => {
    const day = nutritionHistory.get(dateKey(ci.date));
    const w = weeklyFor(ci.date);
    const scores = scoreFromCheckIn(ci, {
      nutrition: {
        kcalToday: day?.kcal ?? 0,
        dailyTarget,
        qualityScore: day?.qualityScore ?? null,
      },
      social: socialCtxFromWeekly(w),
      substances: substancesCtxFromWeekly(w),
    });
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
  const todayWeekly = weeklyFor(today);
  const todayScores = scoreFromCheckIn(todayCI, {
    nutrition: {
      kcalToday: totalKcal(todayMeals),
      dailyTarget,
      qualityScore: dailyMealQuality(todayMeals),
    },
    social: socialCtxFromWeekly(todayWeekly),
    substances: substancesCtxFromWeekly(todayWeekly),
  });

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
