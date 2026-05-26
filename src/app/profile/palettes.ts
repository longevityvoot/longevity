export type Palette = {
  bg: string; paper: string; ink: string; inkSoft: string; inkFaint: string;
  rule: string; ruleStrong: string;
  accent: string; accentSoft: string;
  secondary: string; secondarySoft: string;
  block: string; blockInk: string;
  block2: string; block2Ink: string;
};

export const PALETTES: Record<string, Palette> = {
  grove: {
    bg: "#EFE9DC", paper: "#FAF5E8", ink: "#1B2218", inkSoft: "#4C5A48", inkFaint: "#8B9583",
    rule: "rgba(27,34,24,0.10)", ruleStrong: "rgba(27,34,24,0.22)",
    accent: "#3F6E4A", accentSoft: "#C9D8C4",
    secondary: "#D97534", secondarySoft: "#F5D9C2",
    block: "#3F6E4A", blockInk: "#FAF5E8",
    block2: "#E8A86B", block2Ink: "#1B2218",
  },
  bloom: {
    bg: "#F4E9DE", paper: "#FBF1E6", ink: "#2A1722", inkSoft: "#6B4A5C", inkFaint: "#B0938F",
    rule: "rgba(42,23,34,0.10)", ruleStrong: "rgba(42,23,34,0.22)",
    accent: "#C2455F", accentSoft: "#F0CFD3",
    secondary: "#7A6FB8", secondarySoft: "#DAD3EB",
    block: "#C2455F", blockInk: "#FBF1E6",
    block2: "#F4C95D", block2Ink: "#2A1722",
  },
  dusk: {
    bg: "#E2E4EC", paper: "#F0F1F6", ink: "#0F1828", inkSoft: "#3E4A66", inkFaint: "#8B95AB",
    rule: "rgba(15,24,40,0.10)", ruleStrong: "rgba(15,24,40,0.22)",
    accent: "#264E8A", accentSoft: "#C9D4E8",
    secondary: "#E8945E", secondarySoft: "#F6DBC4",
    block: "#264E8A", blockInk: "#F0F1F6",
    block2: "#F2C36B", block2Ink: "#0F1828",
  },
  ember: {
    bg: "#181513", paper: "#221E1A", ink: "#F5EFE3", inkSoft: "#BCB1A0", inkFaint: "#75695B",
    rule: "rgba(245,239,227,0.10)", ruleStrong: "rgba(245,239,227,0.22)",
    accent: "#E89A4E", accentSoft: "#3B2F23",
    secondary: "#7DC1A9", secondarySoft: "#26352F",
    block: "#E89A4E", blockInk: "#181513",
    block2: "#7DC1A9", block2Ink: "#181513",
  },
};

export function applyPalette(p: Palette) {
  const r = document.documentElement.style;
  const vars: Record<string, string> = {
    "--bg": p.bg, "--paper": p.paper, "--ink": p.ink,
    "--ink-soft": p.inkSoft, "--ink-faint": p.inkFaint,
    "--rule": p.rule, "--rule-strong": p.ruleStrong,
    "--accent": p.accent, "--accent-soft": p.accentSoft,
    "--secondary": p.secondary, "--secondary-soft": p.secondarySoft,
    "--block": p.block, "--block-ink": p.blockInk,
    "--block2": p.block2, "--block2-ink": p.block2Ink,
  };
  for (const [k, v] of Object.entries(vars)) r.setProperty(k, v);
}
