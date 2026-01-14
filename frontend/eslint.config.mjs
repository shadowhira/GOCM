import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import designSystemPlugin from "./eslint-plugin-design-system/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  // Design System Rules
  {
    plugins: {
      "design-system": designSystemPlugin,
    },
    rules: {
      // Design system compliance rules
      "design-system/no-hardcoded-colors": "error",
      "design-system/use-design-tokens": "warn",

      // Additional rules for better code quality
      "react/jsx-props-no-spreading": "off", // Allow spreading props in components
      "import/prefer-default-export": "off", // Allow named exports

      "react/no-unescaped-entities": "off",
      "jsonc/no-comments": "off",

      // Tailwind-specific rules
      "tailwindcss/no-custom-classname": "off", // Allow custom classes from design system
    },
  },
];

export default eslintConfig;
