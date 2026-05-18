export type VitalFlag = "normal" | "low" | "high" | "critical";

export type GlucoseContext = "fasting" | "post-meal" | "random" | "bedtime";
export type BpContext = "morning" | "evening" | "post-stress";

export function computeBpFlag(sys: number, dia: number): VitalFlag {
  if (sys >= 180 || dia >= 120) return "critical";
  if (sys >= 140 || dia >= 90) return "high";
  if (sys < 90 || dia < 60) return "low";
  return "normal";
}

export function computeGlucoseFlag(v: number, context: GlucoseContext): VitalFlag {
  if (v >= 300) return "critical";
  if (context === "fasting") {
    if (v >= 126) return "high";
    if (v < 70) return "low";
  } else if (context === "post-meal") {
    if (v >= 200) return "high";
    if (v < 70) return "low";
  } else {
    if (v >= 200) return "high";
    if (v < 60) return "low";
  }
  return "normal";
}

export const VALID_RANGES = {
  weight: { min: 30, max: 200, unit: "kg" },
  waist: { min: 50, max: 150, unit: "cm" },
  bp_sys: { min: 70, max: 220 },
  bp_dia: { min: 40, max: 140 },
  glucose: { min: 40, max: 500, unit: "mg/dL" },
} as const;

export function flagTone(flag: VitalFlag | null | undefined) {
  if (flag === "critical") return "danger";
  if (flag === "high" || flag === "low") return "warning";
  return "ok";
}
