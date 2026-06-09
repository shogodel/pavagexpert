import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        stone: {
          50: "#faf8f6",
          100: "#f0ece6",
          200: "#ded6cc",
          300: "#c4b8a8",
          400: "#a6947e",
          500: "#8b7a65",
          600: "#756551",
          700: "#5f5241",
          800: "#4e4437",
          900: "#42392f",
        },
        terracotta: {
          DEFAULT: "#c1694f",
          dark: "#9e543e",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
