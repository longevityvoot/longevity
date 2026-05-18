import type { DailyCheckIn } from "@prisma/client";
import type { PillarKey } from "@/lib/pillars";

export type PillarScores = Record<PillarKey, number>;

// Phase 2 scoring: heuristic from today's check-in alone.
// Wearable + lab + body data fold in via later phases.
//
// All scores 0-100. Missing inputs fall back to 50 (neutral).
export function scoreFromCheckIn(c: DailyCheckIn | null): PillarScores | null {
  if (!c) return null;

  const sleep   = clamp((c.sleepQuality ?? 5) * 10);
  // Stress pillar = mental wellbeing — average inverted-stress with mood.
  // High mood (good) and low stress (good) both push the score up.
  const moodScore = (c.moodLevel ?? 5) * 10;
  const stressScore = (11 - (c.stressLevel ?? 5)) * 10;
  const stress  = clamp((stressScore + moodScore) / 2);
  const activity = clamp((c.energyLevel ?? 5) * 10);
  const nutrition = c.nutritionNotes?.trim() ? 70 : 50;
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

export function overallScore(scores: PillarScores | null): number | null {
  if (!scores) return null;
  const values = Object.values(scores);
  return Math.round(values.reduce((s, v) => s + v, 0) / values.length);
}

function clamp(v: number) {
  return Math.max(0, Math.min(100, Math.round(v)));
}
