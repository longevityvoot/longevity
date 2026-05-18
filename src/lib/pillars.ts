// Canonical pillar list. Order = display order in UI grid and ring order
// (outermost to innermost) in the multi-donut.
export const PILLARS = [
  { key: "nutrition",  label: "โภชนาการ",   color: "pillar-nutrition",  hex: "#00C9A7" },
  { key: "sleep",      label: "การนอน",     color: "pillar-sleep",      hex: "#2E5BFF" },
  { key: "activity",   label: "กิจกรรม",    color: "pillar-activity",   hex: "#FF6B6B" },
  { key: "stress",     label: "ความเครียด", color: "pillar-stress",     hex: "#FFA940" },
  { key: "social",     label: "สังคม",      color: "pillar-social",     hex: "#52C41A" },
  { key: "substances", label: "สารต่างๆ",   color: "pillar-substances", hex: "#722ED1" },
] as const;

export type PillarKey = (typeof PILLARS)[number]["key"];
