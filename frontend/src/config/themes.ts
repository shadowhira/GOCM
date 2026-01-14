export const THEMES_CONFIG = {
  themes: ["light", "dark"] as const,
  defaultTheme: "light" as const,
} as const;

export type SupportedTheme = (typeof THEMES_CONFIG.themes)[number];

// Export các giá trị để sử dụng
export const { themes, defaultTheme } = THEMES_CONFIG;

export function isValidTheme(theme: string): theme is SupportedTheme {
  return themes.includes(theme as SupportedTheme);
}

// Mapping theme name to CSS file path
export const THEME_FILES: Record<SupportedTheme, string> = {
  light: "/themes/ocean-light.css",
  dark: "/themes/ocean-dark.css",
};

// Export để tương thích
export { themes as default };
