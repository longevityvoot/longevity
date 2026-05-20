import type { DailyCheckIn, WeeklyReflection } from "@prisma/client";
import type { PillarKey } from "@/lib/pillars";

export type PillarScores = Record<PillarKey, number>;

// Optional context layered on top of the daily reflection to compute
// richer pillar scores.
//   nutrition: kcal + target + quality (from meal log)
//   social:    current week's socialKind (from WeeklyReflection)
//   substances: current week's behavior totals (from WeeklyReflection)
export type ScoringContext = {
  nutrition?: {
    kcalToday: number;
    dailyTarget: number | null;
    qualityScore?: number | null;
  };
  social?: {
    weeklyKind: string | null;
  };
  substances?: {
    alcoholUnits: number | null;
    sugaryDrinkCount: number | null;
    smokeDays: number | null;
  };
};

// Phase 2 scoring: heuristic from today's daily reflection plus weekly
// reflection context. Wearable + lab + body data fold in via later phases.
// All scores 0-100. Missing inputs fall back to 50 (neutral).
export function scoreFromCheckIn(
  c: DailyCheckIn | null,
  ctx?: ScoringContext,
): PillarScores | null {
  if (!c) return null;

  const sleep = clamp((c.sleepQuality ?? 5) * 10);
  // Stress pillar = mental wellbeing — average inverted-stress with mood.
  const moodScore = (c.moodLevel ?? 5) * 10;
  const stressScore = (11 - (c.stressLevel ?? 5)) * 10;
  const stress = clamp((stressScore + moodScore) / 2);
  const activity = clamp((c.energyLevel ?? 5) * 10);
  const nutrition = scoreNutrition(ctx?.nutrition);
  const social = scoreSocial(ctx?.social);
  const substances = scoreSubstances(ctx?.substances);

  return { nutrition, sleep, activity, stress, social, substances };
}

// Social pillar — single-choice peak engagement for the week.
// Mapped per Harvard 75-year study + Holt-Lunstad 2010 mortality
// meta-analysis. Defaults to 25 (isolated) when no weekly reflection.
export function socialKindRating(kind: string | null | undefined): number | null {
  switch (kind) {
    case "none":      return 25;
    case "text":      return 45;
    case "call":      return 60;
    case "in-person": return 80;
    case "group":     return 90;
    default:          return null;
  }
}

function scoreSocial(sctx: ScoringContext["social"]): number {
  return socialKindRating(sctx?.weeklyKind ?? null) ?? 25;
}

// Substances pillar — penalize weekly behavior totals:
//   alcohol      -3/unit/week (CDC moderate cutoff 14/wk → score 58)
//   sugary       -5/cup/week  (5/wk warning, 10/wk → 50)
//   smokeDays    -5/day       (smoke every day → -35; any day → ≥-5)
// Caffeine no longer scored (black coffee 1-4/day has net positive evidence).
function scoreSubstances(sctx: ScoringContext["substances"]): number {
  if (!sctx) return 100;
  let s = 100;
  s -= (sctx.alcoholUnits ?? 0) * 3;
  s -= (sctx.sugaryDrinkCount ?? 0) * 5;
  s -= (sctx.smokeDays ?? 0) * 5;
  return clamp(s);
}

// Nutrition pillar — kcal closeness + meal quality blended 50/50.
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
// Score. Sleep / activity / nutrition are the largest modifiable
// life-expectancy drivers; stress / social are comparable; substances
// is down-weighted because it's near-max for non-smokers/non-drinkers
// and would otherwise inflate the overall score.
// Banded color for an overall (or pillar) score, going from green at the
// top to red at the bottom. Stops pick from the existing matte palette:
//   ≥80  green   (pillar-social)
//   ≥65  gold    (pillar-nutrition)
//   ≥50  orange  (pillar-stress)
//   <50  red     (pillar-activity)
//   null → neutral grey (ink-4)
export function scoreColor(value: number | null | undefined): string {
  if (value == null) return "#8A8AA3";
  if (value >= 80) return "#5E8B4D";
  if (value >= 65) return "#C9A848";
  if (value >= 50) return "#D38442";
  return "#C45151";
}

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

// Substances context derived from a WeeklyReflection row. Pass into
// ScoringContext.substances. Returns nulls when no entry exists for
// the week — score will default to 100 (best — assume user has nothing
// to report rather than penalize).
export function substancesCtxFromWeekly(
  w: WeeklyReflection | null,
): ScoringContext["substances"] {
  return {
    alcoholUnits: w?.alcoholUnits ?? null,
    sugaryDrinkCount: w?.sugaryDrinkCount ?? null,
    smokeDays: w?.smokeDays ?? null,
  };
}

export function socialCtxFromWeekly(
  w: WeeklyReflection | null,
): ScoringContext["social"] {
  return { weeklyKind: w?.socialKind ?? null };
}
