import type { Config } from "tailwindcss";
import { designTokens } from "./src/lib/design-tokens";

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: designTokens.colors,
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.fontSize,
      fontWeight: designTokens.typography.fontWeight,
      spacing: designTokens.spacing,
      borderRadius: designTokens.borderRadius,
      boxShadow: designTokens.boxShadow,
      screens: designTokens.screens,
      animation: designTokens.animation,
      transitionDuration: designTokens.transitionDuration,
    },
  },
  plugins: [],
} satisfies Config;
