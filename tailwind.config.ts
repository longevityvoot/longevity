import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "pillar-nutrition":  { DEFAULT: "#00C9A7", wash: "#E0F8F2" },
        "pillar-sleep":      { DEFAULT: "#2E5BFF", wash: "#DFE6FF" },
        "pillar-activity":   { DEFAULT: "#FF6B6B", wash: "#FFE3E3" },
        "pillar-stress":     { DEFAULT: "#FFA940", wash: "#FFF1DC" },
        "pillar-social":     { DEFAULT: "#52C41A", wash: "#E5F7D9" },
        "pillar-substances": { DEFAULT: "#722ED1", wash: "#ECE0F8" },
        ink: {
          DEFAULT: "#14142B",
          2: "#2D2D55",
          3: "#5A5A7A",
          4: "#8A8AA3",
          5: "#C4C4D4",
        },
        border: { DEFAULT: "#ECECF2", strong: "#DEDEE7" },
        canvas: "#F6F7FB",
        surface: { DEFAULT: "#FFFFFF", soft: "#FAFAFD" },
        success: "#14B870",
        warning: "#FFA940",
        danger:  "#FF4D4F",
      },
      fontFamily: {
        thai: ['"Noto Sans Thai"', '"IBM Plex Sans Thai"', "system-ui", "sans-serif"],
        sans: ["Inter", '"Noto Sans Thai"', "system-ui", "sans-serif"],
        num:  ["Inter", '"IBM Plex Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "12px",
        lg: "16px",
        xl: "24px",
        pill: "999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(20,20,43,0.04), 0 1px 1px rgba(20,20,43,0.03)",
        DEFAULT: "0 4px 12px rgba(20,20,43,0.05), 0 1px 3px rgba(20,20,43,0.04)",
        lg: "0 12px 32px rgba(20,20,43,0.08), 0 2px 6px rgba(20,20,43,0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
