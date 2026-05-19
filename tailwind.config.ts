import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  safelist: [
    {
      pattern: /^(text|bg|border)-pillar-(nutrition|sleep|activity|stress|social|substances)(-wash)?$/,
    },
  ],
  theme: {
    extend: {
      colors: {
        // Matte primary+secondary palette mapped to the color wheel.
        // wash = ~85% lightness for soft surface fills.
        "pillar-nutrition":  { DEFAULT: "#C9A848", wash: "#F2EBCB" }, // yellow
        "pillar-sleep":      { DEFAULT: "#4A6FA5", wash: "#D6DEEC" }, // blue
        "pillar-activity":   { DEFAULT: "#C45151", wash: "#F3DCDC" }, // red
        "pillar-stress":     { DEFAULT: "#D38442", wash: "#F4E0CE" }, // orange
        "pillar-social":     { DEFAULT: "#5E8B4D", wash: "#DDE7D5" }, // green
        "pillar-substances": { DEFAULT: "#7D5C95", wash: "#E2D7E6" }, // purple
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
