export type LabCategory =
  | "lipids"
  | "glucose"
  | "liver"
  | "kidney"
  | "inflammation"
  | "vitamins"
  | "other";

export type LabFlag = "low" | "normal" | "high" | "critical";

export type LabSpec = {
  key: string;
  name: string;
  category: LabCategory;
  unit: string;
  low: number; // 0 if open-ended below
  high: number; // 999+ if open-ended above (no upper)
  critical?: { low?: number; high?: number };
};

// Reference ranges for adults. Per-client overrides via ClientProfile come
// in Phase 2 of the lab feature — for now these are the defaults.
export const LAB_RANGES: Record<string, LabSpec> = {
  "total-cholesterol": { key: "total-cholesterol", name: "Total Cholesterol", category: "lipids", unit: "mg/dL", low: 0, high: 200 },
  "ldl":               { key: "ldl",               name: "LDL-C",             category: "lipids", unit: "mg/dL", low: 0, high: 130 },
  "hdl":               { key: "hdl",               name: "HDL-C",             category: "lipids", unit: "mg/dL", low: 40, high: 999 },
  "triglycerides":     { key: "triglycerides",     name: "Triglycerides",     category: "lipids", unit: "mg/dL", low: 0, high: 150 },

  "fasting-glucose":   { key: "fasting-glucose",   name: "Fasting Glucose",   category: "glucose", unit: "mg/dL", low: 70, high: 100, critical: { high: 300 } },
  "hba1c":             { key: "hba1c",             name: "HbA1c",             category: "glucose", unit: "%",     low: 4.0, high: 5.7 },

  "ast":               { key: "ast",               name: "AST",               category: "liver", unit: "U/L", low: 10, high: 40 },
  "alt":               { key: "alt",               name: "ALT",               category: "liver", unit: "U/L", low: 7,  high: 56 },
  "alp":               { key: "alp",               name: "ALP",               category: "liver", unit: "U/L", low: 44, high: 147 },

  "creatinine":        { key: "creatinine",        name: "Creatinine",        category: "kidney", unit: "mg/dL", low: 0.7, high: 1.3 },
  "egfr":              { key: "egfr",              name: "eGFR",              category: "kidney", unit: "ml/min", low: 90, high: 999 },
  "bun":               { key: "bun",               name: "BUN",               category: "kidney", unit: "mg/dL", low: 6, high: 20 },

  "hs-crp":            { key: "hs-crp",            name: "hs-CRP",            category: "inflammation", unit: "mg/L", low: 0, high: 1.0 },
  "esr":               { key: "esr",               name: "ESR",               category: "inflammation", unit: "mm/hr", low: 0, high: 20 },

  "vitamin-d":         { key: "vitamin-d",         name: "Vitamin D (25-OH)", category: "vitamins", unit: "ng/mL", low: 30, high: 100 },
  "vitamin-b12":       { key: "vitamin-b12",       name: "Vitamin B12",       category: "vitamins", unit: "pg/mL", low: 200, high: 900 },
  "ferritin":          { key: "ferritin",          name: "Ferritin",          category: "vitamins", unit: "ng/mL", low: 30, high: 400 },
};

export function computeLabFlag(spec: LabSpec, value: number): LabFlag {
  if (spec.critical?.high != null && value >= spec.critical.high) return "critical";
  if (spec.critical?.low != null && value <= spec.critical.low) return "critical";
  if (spec.low > 0 && value < spec.low) return "low";
  if (spec.high < 999 && value > spec.high) return "high";
  return "normal";
}

export const LAB_TEMPLATES: Array<{ key: string; label: string; tests: string[] }> = [
  {
    key: "lipid",
    label: "Lipid panel",
    tests: ["total-cholesterol", "ldl", "hdl", "triglycerides"],
  },
  {
    key: "liver",
    label: "Liver function",
    tests: ["ast", "alt", "alp"],
  },
  {
    key: "kidney",
    label: "Kidney function",
    tests: ["creatinine", "egfr", "bun"],
  },
  {
    key: "glucose",
    label: "Glucose + HbA1c",
    tests: ["fasting-glucose", "hba1c"],
  },
  {
    key: "vitamins",
    label: "Vitamins / Iron",
    tests: ["vitamin-d", "vitamin-b12", "ferritin"],
  },
  {
    key: "inflammation",
    label: "Inflammation",
    tests: ["hs-crp", "esr"],
  },
];

export function formatRange(spec: LabSpec): string {
  const hasLow = spec.low > 0;
  const hasHigh = spec.high < 999;
  if (hasLow && hasHigh) return `${spec.low} - ${spec.high} ${spec.unit}`;
  if (hasHigh) return `≤ ${spec.high} ${spec.unit}`;
  if (hasLow) return `≥ ${spec.low} ${spec.unit}`;
  return spec.unit;
}

export function formatRangeRaw(
  low: number | null,
  high: number | null,
  unit: string,
): string {
  const hasLow = low != null && low > 0;
  const hasHigh = high != null && high < 999;
  if (hasLow && hasHigh) return `${low} - ${high} ${unit}`;
  if (hasHigh) return `≤ ${high} ${unit}`;
  if (hasLow) return `≥ ${low} ${unit}`;
  return unit;
}

export const CATEGORY_LABEL: Record<LabCategory, string> = {
  lipids: "ไขมัน",
  glucose: "น้ำตาล",
  liver: "ตับ",
  kidney: "ไต",
  inflammation: "อักเสบ",
  vitamins: "วิตามิน",
  other: "อื่นๆ",
};
