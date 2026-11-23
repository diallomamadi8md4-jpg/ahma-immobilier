import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        editorial: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        ink: {
          50: "#f6f8f8",
          100: "#eceff0",
          200: "#d6dcdc",
          300: "#b0bcbe",
          400: "#859598",
          500: "#66777a",
          600: "#516063",
          700: "#434e50",
          800: "#3a4345",
          900: "#0f1f1c",
          950: "#0a1513",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,31,28,0.04), 0 8px 24px rgba(15,31,28,0.06)",
        "soft-lg": "0 4px 12px rgba(15,31,28,0.05), 0 24px 48px rgba(15,31,28,0.08)",
        glow: "0 0 0 1px rgba(16,185,129,0.15), 0 8px 30px rgba(16,185,129,0.18)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #047857 0%, #022c22 100%)",
        "gold-gradient": "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-fast": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out both",
        "fade-in-fast": "fade-in-fast 0.25s ease-out both",
        "scale-in": "scale-in 0.3s ease-out both",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
