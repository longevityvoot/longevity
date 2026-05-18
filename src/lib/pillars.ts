// Canonical pillar list. Order = display order in UI grid.
export const PILLARS = [
  { key: "nutrition",  label: "โภชนาการ", color: "pillar-nutrition" },
  { key: "sleep",      label: "การนอน",   color: "pillar-sleep" },
  { key: "activity",   label: "กิจกรรม",  color: "pillar-activity" },
  { key: "stress",     label: "ความเครียด", color: "pillar-stress" },
  { key: "social",     label: "สังคม",    color: "pillar-social" },
  { key: "substances", label: "สารต่างๆ", color: "pillar-substances" },
] as const;

export type PillarKey = (typeof PILLARS)[number]["key"];
