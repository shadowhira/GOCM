import type { ClassAppearanceSettingsResponse, ClassMemberCosmeticSlotsResponse, CosmeticConfig } from '@/types/class'

export const fallbackColors = {
  accent: 'hsl(var(--primary))',
  border: 'hsl(var(--border))',
  background: 'hsl(var(--muted))',
  text: 'hsl(var(--foreground))',
}

const readColorValue = (config: CosmeticConfig | null | undefined, property: string, fallback: string) => {
  const rawValue = config ? (config as Record<string, unknown>)[property] : undefined
  const candidate = typeof rawValue === 'string' ? rawValue.trim() : ''
  return candidate.length > 0 ? candidate : fallback
}

export const readAccentColor = (config: CosmeticConfig | null | undefined, fallback = fallbackColors.accent) =>
  readColorValue(config, 'accentColor', fallback)

export const readBorderColor = (config: CosmeticConfig | null | undefined, fallback = fallbackColors.border) =>
  readColorValue(config, 'borderColor', fallback)

export const readBackgroundColor = (
  config: CosmeticConfig | null | undefined,
  fallback = fallbackColors.background
) => readColorValue(config, 'backgroundColor', fallback)

export const readTextColor = (
  config: CosmeticConfig | null | undefined,
  fallback = fallbackColors.text
) => readColorValue(config, 'textColor', fallback)

/**
 * Read theme-aware background color from config.
 * Returns light theme color when isDark=false, dark theme color when isDark=true.
 */
export const readThemeBackgroundColor = (
  config: CosmeticConfig | null | undefined,
  isDark: boolean,
  fallback = fallbackColors.background
) => {
  if (!isDark) {
    // Light theme: use lightBackgroundColor if available
    const lightBg = readColorValue(config, 'lightBackgroundColor', '')
    if (lightBg) return lightBg
  }
  // Dark theme or fallback to default backgroundColor
  return readColorValue(config, 'backgroundColor', fallback)
}

/**
 * Read theme-aware text color from config.
 * Returns light theme color when isDark=false, dark theme color when isDark=true.
 */
export const readThemeTextColor = (
  config: CosmeticConfig | null | undefined,
  isDark: boolean,
  fallback = fallbackColors.text
) => {
  if (!isDark) {
    // Light theme: use lightTextColor if available
    const lightText = readColorValue(config, 'lightTextColor', '')
    if (lightText) return lightText
  }
  // Dark theme or fallback to default textColor
  return readColorValue(config, 'textColor', fallback)
}

export const resolveAppearanceFlag = <T extends keyof ClassAppearanceSettingsResponse>(
  appearance: ClassAppearanceSettingsResponse | undefined,
  key: T,
  fallback = true
): boolean => {
  const value = appearance?.[key]
  return typeof value === 'boolean' ? value : fallback
}

export const getInitials = (value?: string | null) => {
  if (!value) {
    return '??'
  }

  const words = value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)

  if (words.length === 0) {
    return value.slice(0, 2).toUpperCase()
  }

  return words
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export const hasAnyCosmetics = (cosmetics?: ClassMemberCosmeticSlotsResponse | null) =>
  Boolean(
    cosmetics?.avatarFrame ||
      cosmetics?.chatFrame ||
      cosmetics?.badge
  )
