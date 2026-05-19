// Canonical pillar list. Order = display order in UI grid and ring order
// (outermost to innermost) in the multi-donut.
//
// Colors switched to a matte primary+secondary palette (color-wheel
// roles in the comment after each entry). Hex values target a muted
// painterly feel rather than the previous neon brights.
export const PILLARS = [
  { key: "nutrition",  label: "โภชนาการ",   color: "pillar-nutrition",  hex: "#C9A848" }, // yellow
  { key: "sleep",      label: "การนอน",     color: "pillar-sleep",      hex: "#4A6FA5" }, // blue
  { key: "activity",   label: "กิจกรรม",    color: "pillar-activity",   hex: "#C45151" }, // red
  { key: "stress",     label: "ความเครียด", color: "pillar-stress",     hex: "#D38442" }, // orange
  { key: "social",     label: "สังคม",      color: "pillar-social",     hex: "#5E8B4D" }, // green
  { key: "substances", label: "สารต่างๆ",   color: "pillar-substances", hex: "#7D5C95" }, // purple
] as const;

export type PillarKey = (typeof PILLARS)[number]["key"];

// Pillar keys arranged on the color wheel starting at 12 o'clock and going
// clockwise. Used by the flower hero so petals read like a real wheel.
export const COLOR_WHEEL_ORDER: PillarKey[] = [
  "activity",   // red
  "stress",     // orange
  "nutrition",  // yellow
  "social",     // green
  "sleep",      // blue
  "substances", // purple
];
