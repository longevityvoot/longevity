import type { DailyCheckIn } from "@prisma/client";
import type { PillarKey } from "@/lib/pillars";

export type PillarScores = Record<PillarKey, number>;

// Optional context layered on top of the daily check-in to compute richer
// pillar scores. Currently only nutrition uses it — kcal logged today vs
// daily target maps to a closeness score, blended with bell-curve quality
// self-ratings if the user filled them in.
export type ScoringContext = {
  nutrition?: {
    kcalToday: number;
    dailyTarget: number | null;
    qualityScore?: number | null; // 0-100, null when no meal was rated
  };
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

// Nutrition pillar score logic. Two signals blended 50/50 when both
// available; falls back gracefully when one is missing.
//
//   kcal closeness (0-100): kcalToday vs dailyTarget
//   quality       (0-100): user's bell-curve self-rating across macro axes
//
// Final precedence:
//   meals + target + ratings  → 0.5 * closeness + 0.5 * quality
//   meals + target            → closeness only
//   meals + ratings           → quality only (no target available)
//   meals only                → presence reward 70
//   no meals                  → fall back to nutritionNotes (70 or 50)
function scoreNutrition(
  c: DailyCheckIn,
  nctx: ScoringContext["nutrition"],
): number {
  if (nctx && nctx.kcalToday > 0) {
    const closeness = kcalClosenessScore(nctx.kcalToday, nctx.dailyTarget);
    const quality = nctx.qualityScore ?? null;
    if (closeness != null && quality != null) {
      return Math.round(0.5 * closeness + 0.5 * quality);
    }
    if (closeness != null) return closeness;
    if (quality != null) return quality;
    return 70;
  }
  return c.nutritionNotes?.trim() ? 70 : 50;
}

function kcalClosenessScore(kcal: number, target: number | null): number | null {
  if (!target || target <= 0) return null;
  const off = Math.abs(kcal / target - 1);
  if (off <= 0.1) return 85;
  if (off <= 0.2) return 75;
  if (off <= 0.3) return 65;
  return 55;
}

export function overallScore(scores: PillarScores | null): number | null {
  if (!scores) return null;
  const values = Object.values(scores);
  return Math.round(values.reduce((s, v) => s + v, 0) / values.length);
}

function clamp(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)));
}
