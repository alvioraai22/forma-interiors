import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        linen: "#F5F0E8",
        parchment: "#EDE6D6",
        stone: "#E8E0D0",
        terracotta: "#C4714A",
        "terracotta-light": "#D4845E",
        "terracotta-dark": "#A55A38",
        espresso: "#2C1810",
        bark: "#8B7355",
        ivory: "#FFFEF9",
        sage: "#7A8C6E",
        "warm-white": "#FFFEF9",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      animation: {
        "reveal-left": "revealLeft 1s cubic-bezier(0.16,1,0.3,1) forwards",
        "fade-up": "fadeUp 0.8s ease forwards",
        "fade-in": "fadeIn 1s ease forwards",
        breathe: "breathe 4s ease-in-out infinite",
      },
      keyframes: {
        revealLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(25px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        breathe: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.03)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
