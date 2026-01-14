import type { CosmeticConfig } from '@/types/class'
import { ShopItemTier, ShopItemVisualType } from '@/types/shopItem'

export type CosmeticPresetConfig = CosmeticConfig & {
  accentColor: string
  borderColor: string
  backgroundColor: string
  textColor: string
  // Light theme variants (optional - for preview/edit UI)
  lightBackgroundColor?: string
  lightTextColor?: string
}

export interface ShopItemColorPreset {
  id: string
  labelKey: string
  descriptionKey: string
  swatches: string[]
  config: CosmeticPresetConfig
  tier?: ShopItemTier // Optional tier association for auto-fill
}

const avatarFramePresets: ShopItemColorPreset[] = [
  // Basic - Blue tones
  {
    id: 'avatar-cyber-ice',
    labelKey: 'shop_item_preset_avatar_cyber_label',
    descriptionKey: 'shop_item_preset_avatar_cyber_description',
    swatches: ['#06B6D4', '#0EA5E9', '#0C4A6E'],
    tier: ShopItemTier.Basic,
    config: {
      accentColor: '#22D3EE',
      borderColor: '#0284C7',
      // Dark theme
      backgroundColor: '#0C4A6E',
      textColor: '#E0F2FE',
      // Light theme
      lightBackgroundColor: '#E0F2FE',
      lightTextColor: '#0C4A6E',
    },
  },
  // Advanced - Orange/Yellow tones
  {
    id: 'avatar-sunlit-halo',
    labelKey: 'shop_item_preset_avatar_sunlit_label',
    descriptionKey: 'shop_item_preset_avatar_sunlit_description',
    swatches: ['#EAB308', '#F97316', '#78350F'],
    tier: ShopItemTier.Advanced,
    config: {
      accentColor: '#FACC15',
      borderColor: '#D97706',
      // Dark theme
      backgroundColor: '#78350F',
      textColor: '#FEF3C7',
      // Light theme
      lightBackgroundColor: '#FEF3C7',
      lightTextColor: '#78350F',
    },
  },
  // Elite - Purple tones
  {
    id: 'avatar-aurora-glow',
    labelKey: 'shop_item_preset_avatar_aurora_label',
    descriptionKey: 'shop_item_preset_avatar_aurora_description',
    swatches: ['#A855F7', '#7C3AED', '#4C1D95'],
    tier: ShopItemTier.Elite,
    config: {
      accentColor: '#C084FC',
      borderColor: '#7C3AED',
      // Dark theme
      backgroundColor: '#4C1D95',
      textColor: '#F3E8FF',
      // Light theme
      lightBackgroundColor: '#F3E8FF',
      lightTextColor: '#4C1D95',
    },
  },
  // Legendary - Red tones
  {
    id: 'avatar-crimson-flame',
    labelKey: 'shop_item_preset_avatar_crimson_label',
    descriptionKey: 'shop_item_preset_avatar_crimson_description',
    swatches: ['#EF4444', '#DC2626', '#7F1D1D'],
    tier: ShopItemTier.Legendary,
    config: {
      accentColor: '#F87171',
      borderColor: '#DC2626',
      // Dark theme
      backgroundColor: '#7F1D1D',
      textColor: '#FEE2E2',
      // Light theme
      lightBackgroundColor: '#FEE2E2',
      lightTextColor: '#7F1D1D',
    },
  },
]

const chatFramePresets: ShopItemColorPreset[] = [
  // Basic - Blue tones
  {
    id: 'chat-oceanic',
    labelKey: 'shop_item_preset_chat_ocean_label',
    descriptionKey: 'shop_item_preset_chat_ocean_description',
    swatches: ['#0EA5E9', '#0284C7', '#0C4A6E'],
    tier: ShopItemTier.Basic,
    config: {
      accentColor: '#38BDF8',
      borderColor: '#0284C7',
      // Dark theme
      backgroundColor: '#0C4A6E',
      textColor: '#E0F2FE',
      // Light theme
      lightBackgroundColor: '#E0F2FE',
      lightTextColor: '#0C4A6E',
    },
  },
  // Advanced - Orange/Yellow tones
  {
    id: 'chat-golden-sunset',
    labelKey: 'shop_item_preset_chat_golden_label',
    descriptionKey: 'shop_item_preset_chat_golden_description',
    swatches: ['#F59E0B', '#D97706', '#78350F'],
    tier: ShopItemTier.Advanced,
    config: {
      accentColor: '#FBBF24',
      borderColor: '#D97706',
      // Dark theme
      backgroundColor: '#78350F',
      textColor: '#FEF3C7',
      // Light theme
      lightBackgroundColor: '#FEF3C7',
      lightTextColor: '#78350F',
    },
  },
  // Elite - Purple tones
  {
    id: 'chat-neon-dream',
    labelKey: 'shop_item_preset_chat_neon_label',
    descriptionKey: 'shop_item_preset_chat_neon_description',
    swatches: ['#A855F7', '#7C3AED', '#4C1D95'],
    tier: ShopItemTier.Elite,
    config: {
      accentColor: '#C084FC',
      borderColor: '#7C3AED',
      // Dark theme
      backgroundColor: '#4C1D95',
      textColor: '#F3E8FF',
      // Light theme
      lightBackgroundColor: '#F3E8FF',
      lightTextColor: '#4C1D95',
    },
  },
  // Legendary - Red tones
  {
    id: 'chat-midnight-rose',
    labelKey: 'shop_item_preset_chat_midnight_label',
    descriptionKey: 'shop_item_preset_chat_midnight_description',
    swatches: ['#FB7185', '#E11D48', '#7F1D1D'],
    tier: ShopItemTier.Legendary,
    config: {
      accentColor: '#FDA4AF',
      borderColor: '#DC2626',
      // Dark theme
      backgroundColor: '#7F1D1D',
      textColor: '#FEE2E2',
      // Light theme
      lightBackgroundColor: '#FEE2E2',
      lightTextColor: '#7F1D1D',
    },
  },
]

const badgePresets: ShopItemColorPreset[] = [
  // Basic - Teal tones
  {
    id: 'badge-lagoon',
    labelKey: 'shop_item_preset_badge_lagoon_label',
    descriptionKey: 'shop_item_preset_badge_lagoon_description',
    swatches: ['#2DD4BF', '#0D9488', '#134E4A'],
    tier: ShopItemTier.Basic,
    config: {
      accentColor: '#2DD4BF',
      borderColor: '#0D9488',
      // Dark theme
      backgroundColor: '#134E4A',
      textColor: '#CCFBF1',
      // Light theme
      lightBackgroundColor: '#CCFBF1',
      lightTextColor: '#134E4A',
    },
  },
  // Advanced - Orange/Yellow tones
  {
    id: 'badge-supernova',
    labelKey: 'shop_item_preset_badge_supernova_label',
    descriptionKey: 'shop_item_preset_badge_supernova_description',
    swatches: ['#FACC15', '#EAB308', '#78350F'],
    tier: ShopItemTier.Advanced,
    config: {
      accentColor: '#FDE047',
      borderColor: '#D97706',
      // Dark theme
      backgroundColor: '#78350F',
      textColor: '#FEF3C7',
      // Light theme
      lightBackgroundColor: '#FEF3C7',
      lightTextColor: '#78350F',
    },
  },
  // Elite - Purple tones
  {
    id: 'badge-royal-amethyst',
    labelKey: 'shop_item_preset_badge_royal_label',
    descriptionKey: 'shop_item_preset_badge_royal_description',
    swatches: ['#A78BFA', '#7C3AED', '#4C1D95'],
    tier: ShopItemTier.Elite,
    config: {
      accentColor: '#C4B5FD',
      borderColor: '#7C3AED',
      // Dark theme
      backgroundColor: '#4C1D95',
      textColor: '#EDE9FE',
      // Light theme
      lightBackgroundColor: '#EDE9FE',
      lightTextColor: '#4C1D95',
    },
  },
  // Legendary - Pink tones
  {
    id: 'badge-hypernova',
    labelKey: 'shop_item_preset_badge_hypernova_label',
    descriptionKey: 'shop_item_preset_badge_hypernova_description',
    swatches: ['#F472B6', '#DB2777', '#831843'],
    tier: ShopItemTier.Legendary,
    config: {
      accentColor: '#FB7185',
      borderColor: '#DB2777',
      // Dark theme
      backgroundColor: '#831843',
      textColor: '#FCE7F3',
      // Light theme
      lightBackgroundColor: '#FCE7F3',
      lightTextColor: '#831843',
    },
  },
]

export const SHOP_ITEM_COLOR_PRESETS: Record<ShopItemVisualType, ShopItemColorPreset[]> = {
  [ShopItemVisualType.AvatarFrame]: avatarFramePresets,
  [ShopItemVisualType.ChatFrame]: chatFramePresets,
  [ShopItemVisualType.NameBadge]: badgePresets,
}

export const CUSTOM_PRESET_ID = 'custom'

export const defaultPresetForVisualType = (visualType: ShopItemVisualType) => {
  const presets = SHOP_ITEM_COLOR_PRESETS[visualType]
  return presets?.[0]
}

/**
 * Get the default color preset for a given visual type and tier.
 * Returns the preset that matches the tier, or the first preset if no match.
 */
export const getDefaultPresetForTier = (
  visualType: ShopItemVisualType,
  tier: ShopItemTier
): ShopItemColorPreset | null => {
  const presets = SHOP_ITEM_COLOR_PRESETS[visualType]
  if (!presets?.length) return null
  
  // Find preset matching the tier
  const tierPreset = presets.find((preset) => preset.tier === tier)
  return tierPreset ?? presets[0]
}

export const tryParseConfig = (value?: string | null): CosmeticPresetConfig | null => {
  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null
    }

    const candidate = parsed as Record<string, unknown>
    const result: CosmeticPresetConfig = {
      accentColor: typeof candidate.accentColor === 'string' ? candidate.accentColor : '',
      borderColor: typeof candidate.borderColor === 'string' ? candidate.borderColor : '',
      backgroundColor: typeof candidate.backgroundColor === 'string' ? candidate.backgroundColor : '',
      textColor: typeof candidate.textColor === 'string' ? candidate.textColor : '',
    }

    const hasAnyValue = Object.values(result).some(
      (value) => typeof value === 'string' && value.trim().length > 0
    )
    return hasAnyValue ? result : null
  } catch {
    return null
  }
}

const normalizeColor = (value?: string) => value?.trim().toLowerCase() ?? ''

export const compareConfigs = (
  base: CosmeticPresetConfig | null | undefined,
  candidate: CosmeticPresetConfig | null | undefined
) => {
  if (!base || !candidate) {
    return false
  }

  return (
    normalizeColor(base.accentColor) === normalizeColor(candidate.accentColor) &&
    normalizeColor(base.borderColor) === normalizeColor(candidate.borderColor) &&
    normalizeColor(base.backgroundColor) === normalizeColor(candidate.backgroundColor) &&
    normalizeColor(base.textColor) === normalizeColor(candidate.textColor)
  )
}

export const findPresetByConfig = (
  visualType: ShopItemVisualType,
  config: CosmeticPresetConfig | null | undefined
) => {
  if (!config) {
    return null
  }

  const presets = SHOP_ITEM_COLOR_PRESETS[visualType] ?? []
  return presets.find((preset) => compareConfigs(preset.config, config)) ?? null
}
