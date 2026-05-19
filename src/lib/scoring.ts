import type { DailyCheckIn } from "@prisma/client";
import type { PillarKey } from "@/lib/pillars";

export type PillarScores = Record<PillarKey, number>;

// Optional context layered on top of the daily check-in to compute richer
// pillar scores. Currently only nutrition uses it — kcal logged today vs
// daily target maps to a closeness score.
export type ScoringContext = {
  nutrition?: { kcalToday: number; dailyTarget: number | null };
};

// Phase 2 scoring: heuristic from today's check-in plus optional context.
// Wearable + lab + body data fold in via later phases.
//
// All scores 0-100. Missing inputs fall back to 50 (neutral).
export function scoreFromCheckIn(
  c: DailyCheckIn | null,
  ctx?: ScoringContext,
): PillarScores | null {
  if (!c) return null;

  const sleep   = clamp((c.sleepQuality ?? 5) * 10);
  // Stress pillar = mental wellbeing — average inverted-stress with mood.
  // High mood (good) and low stress (good) both push the score up.
  const moodScore = (c.moodLevel ?? 5) * 10;
  const stressScore = (11 - (c.stressLevel ?? 5)) * 10;
  const stress  = clamp((stressScore + moodScore) / 2);
  const activity = clamp((c.energyLevel ?? 5) * 10);
  const nutrition = scoreNutrition(c, ctx?.nutrition);
  const social    = c.socialActivities?.trim() ? 70 : 50;

  let substances = 100;
  substances -= (c.alcoholUnits ?? 0) * 10;
  substances -= (c.caffeineCount ?? 0) * 3;
  if (c.smokedToday) substances -= 30;

  return {
    nutrition,
    sleep,
    activity,
    stress,
    social,
    substances: clamp(substances),
  };
}

// Nutrition pillar score logic:
//   - meal data + target known → closeness-to-target score
//   - meal data without target → presence reward (70)
//   - no meal data → fall back to nutritionNotes presence (70 or 50)
function scoreNutrition(
  c: DailyCheckIn,
  nctx: ScoringContext["nutrition"],
): number {
  if (nctx && nctx.kcalToday > 0) {
    if (nctx.dailyTarget && nctx.dailyTarget > 0) {
      const ratio = nctx.kcalToday / nctx.dailyTarget;
      const off = Math.abs(ratio - 1);
      if (off <= 0.1) return 85;
      if (off <= 0.2) return 75;
      if (off <= 0.3) return 65;
      return 55;
    }
    return 70;
  }
  return c.nutritionNotes?.trim() ? 70 : 50;
}

export function overallScore(scores: PillarScores | null): number | null {
  if (!scores) return null;
  const values = Object.values(scores);
  return Math.round(values.reduce((s, v) => s + v, 0) / values.length);
}

function clamp(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)));
}
