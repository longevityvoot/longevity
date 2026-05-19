import type { DailyCheckIn } from "@prisma/client";
import type { PillarKey } from "@/lib/pillars";

export type PillarScores = Record<PillarKey, number>;

// Optional context layered on top of the daily reflection to compute
// richer pillar scores. Nutrition uses kcal+target+quality. Social uses
// the peak rating from the last 7 days because social engagement is a
// weekly pattern, not a daily one.
export type ScoringContext = {
  nutrition?: {
    kcalToday: number;
    dailyTarget: number | null;
    qualityScore?: number | null; // 0-100, null when no meal was rated
  };
  social?: {
    weeklyPeakRating: number | null; // 0-100, best social engagement in last 7 days
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
  const nutrition = scoreNutrition(ctx?.nutrition);
  const social    = scoreSocial(c, ctx?.social);
  const substances = scoreSubstances(c);

  return {
    nutrition,
    sleep,
    activity,
    stress,
    social,
    substances,
  };
}

// Social pillar — single-choice mapping per day, but pillar score uses
// the WEEKLY PEAK across the last 7 days. Social engagement is a weekly
// pattern: someone whose family dinner on Sunday is real social health,
// even if the rest of the week is solo. Holt-Lunstad 2010 + Harvard
// 75-year study both measure chronic isolation, not daily fluctuation.
export function socialRatingForDay(c: DailyCheckIn): number | null {
  switch (c.socialKind) {
    case "none":      return 25;
    case "text":      return 45;
    case "call":      return 60;
    case "in-person": return 80;
    case "group":     return 90;
    default:
      return c.socialActivities?.trim() ? 70 : null;
  }
}

function scoreSocial(c: DailyCheckIn, sctx: ScoringContext["social"]): number {
  if (sctx && sctx.weeklyPeakRating != null) {
    return sctx.weeklyPeakRating;
  }
  return socialRatingForDay(c) ?? 25;
}

// Substances pillar — only count items with strong evidence of harm:
//   alcohol  -10/drink
//   smoking/vape  -30 if yes
//   sugary drinks  -8/cup (น้ำอัดลม, น้ำหวาน, น้ำผลไม้, ชานม, กาแฟใส่น้ำตาล/นม)
// Caffeine is no longer scored — 1-4 cups/day of black coffee has net
// positive evidence (reduced all-cause mortality, CVD, T2DM). The field
// is kept for future sleep-timing correlation.
function scoreSubstances(c: DailyCheckIn): number {
  let s = 100;
  s -= (c.alcoholUnits ?? 0) * 10;
  s -= (c.sugaryDrinkCount ?? 0) * 8;
  if (c.smokedToday) s -= 30;
  return clamp(s);
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
//   no meals                  → 50 (neutral — user didn't log)
function scoreNutrition(nctx: ScoringContext["nutrition"]): number {
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
  return 50;
}

function kcalClosenessScore(kcal: number, target: number | null): number | null {
  if (!target || target <= 0) return null;
  const off = Math.abs(kcal / target - 1);
  if (off <= 0.1) return 85;
  if (off <= 0.2) return 75;
  if (off <= 0.3) return 65;
  return 55;
}

// Evidence-weighted contribution of each pillar to the overall Longevity
// Score. Drawn from cardiovascular + metabolic + mortality literature:
//   - Sleep / activity / nutrition: largest modifiable life-expectancy drivers
//   - Stress / social: comparable to lifestyle factors (Holt-Lunstad 2010)
//   - Substances: lower weight because it's near-max for non-smokers /
//     non-drinkers and would otherwise inflate the overall score
export const PILLAR_WEIGHTS: Record<PillarKey, number> = {
  sleep:      1.2,
  activity:   1.2,
  nutrition:  1.2,
  stress:     1.0,
  social:     1.0,
  substances: 0.4,
};

export function overallScore(scores: PillarScores | null): number | null {
  if (!scores) return null;
  let num = 0;
  let den = 0;
  for (const [key, val] of Object.entries(scores) as Array<[PillarKey, number]>) {
    const w = PILLAR_WEIGHTS[key] ?? 1;
    num += val * w;
    den += w;
  }
  if (den === 0) return null;
  return Math.round(num / den);
}

function clamp(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

// Highest social rating in the 7-day window ending on `asOf` (inclusive).
// Returns null if no check-in in the window had a rateable socialKind /
// socialActivities. Callers can fall back to "isolated" (25) at use-site.
export function weeklySocialPeak(
  checkIns: Array<Pick<DailyCheckIn, "date" | "socialKind" | "socialActivities">>,
  asOf: Date,
): number | null {
  const start = new Date(asOf);
  start.setDate(start.getDate() - 6);
  let peak: number | null = null;
  for (const c of checkIns) {
    if (c.date < start || c.date > asOf) continue;
    const r = socialRatingForDay(c as DailyCheckIn);
    if (r == null) continue;
    if (peak == null || r > peak) peak = r;
  }
  return peak;
}
