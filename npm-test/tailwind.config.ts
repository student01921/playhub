import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F7F4EC",
          deep: "#EFE8DB",
          light: "#FCFAF5",
        },
        forest: {
          DEFAULT: "#233D32",
          deep: "#172A22",
          soft: "#315344",
          mist: "#DDE5D9",
        },
        sage: {
          DEFAULT: "#A5B69A",
          light: "#C9D3C0",
          deep: "#7F9574",
        },
        terracotta: {
          DEFAULT: "#C97959",
          deep: "#A85D40",
          light: "#E5AE96",
        },
        amber: {
          DEFAULT: "#E4B85E",
          light: "#F1D79C",
          deep: "#B88A32",
        },
        ink: {
          DEFAULT: "#282A27",
          soft: "#555A52",
          faint: "#7B8077",
        },
        line: "rgba(35, 61, 50, 0.14)",
      },
      fontFamily: {
        display: ["Fraunces Variable", "Georgia", "serif"],
        sans: ["Manrope Variable", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
        panel: "26px",
        arch: "10rem 10rem 1.5rem 1.5rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(39, 48, 38, 0.04), 0 12px 30px -18px rgba(39, 48, 38, 0.28)",
        lifted:
          "0 2px 4px rgba(39, 48, 38, 0.06), 0 26px 60px -28px rgba(28, 43, 34, 0.36)",
        pressed: "inset 0 2px 5px rgba(23, 42, 34, 0.18)",
        glass:
          "inset 0 1px 0 rgba(255,255,255,0.7), 0 20px 50px -26px rgba(23, 42, 34, 0.4)",
        "glass-dark":
          "inset 0 1px 0 rgba(255,255,255,0.16), 0 24px 60px -26px rgba(0,0,0,0.5)",
      },
      opacity: {
        6: "0.06",
        8: "0.08",
        12: "0.12",
        14: "0.14",
        16: "0.16",
        35: "0.35",
        55: "0.55",
        58: "0.58",
        65: "0.65",
        68: "0.68",
        72: "0.72",
        82: "0.82",
        85: "0.85",
        86: "0.86",
        92: "0.92",
      },
      letterSpacing: {
        label: "0.16em",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      maxWidth: {
        shell: "78rem",
        prose: "42rem",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "soft-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "soft-pulse": "soft-pulse 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
