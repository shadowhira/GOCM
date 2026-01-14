export const LOCALES_CONFIG = {
  locales: ["en", "vi"] as const,
  defaultLocale: "en" as const,
  localePrefix: "always" as const,
} as const;

export type SupportedLocale = (typeof LOCALES_CONFIG.locales)[number];

// Export các giá trị để sử dụng
export const { locales, defaultLocale, localePrefix } = LOCALES_CONFIG;

export function isValidLocale(locale: string): locale is SupportedLocale {
  return locales.includes(locale as SupportedLocale);
}

// Export để tương thích với next-intl
export { locales as default };
