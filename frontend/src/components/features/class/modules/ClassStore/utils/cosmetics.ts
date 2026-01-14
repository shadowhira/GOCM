import { CosmeticSlot } from '@/types/class'
import { ShopItemVisualType } from '@/types/shopItem'

export const cosmeticSlotLabelKeyMap: Record<CosmeticSlot, string> = {
  [CosmeticSlot.AvatarFrame]: 'class_store_slot_avatar_frame',
  [CosmeticSlot.ChatFrame]: 'class_store_slot_chat_frame',
  [CosmeticSlot.Badge]: 'class_store_slot_badge',
}

export const cosmeticSlotDescriptionKeyMap: Record<CosmeticSlot, string> = {
  [CosmeticSlot.AvatarFrame]: 'class_store_slot_avatar_frame_desc',
  [CosmeticSlot.ChatFrame]: 'class_store_slot_chat_frame_desc',
  [CosmeticSlot.Badge]: 'class_store_slot_badge_desc',
}

const numericSlotMap: Record<number, CosmeticSlot> = {
  [ShopItemVisualType.AvatarFrame]: CosmeticSlot.AvatarFrame,
  [ShopItemVisualType.ChatFrame]: CosmeticSlot.ChatFrame,
  [ShopItemVisualType.NameBadge]: CosmeticSlot.Badge,
}

const stringSlotMap: Record<string, CosmeticSlot> = {
  AvatarFrame: CosmeticSlot.AvatarFrame,
  ChatFrame: CosmeticSlot.ChatFrame,
  Badge: CosmeticSlot.Badge,
  NameBadge: CosmeticSlot.Badge,
}

export const normalizeCosmeticSlot = (value: unknown): CosmeticSlot | null => {
  if (value === null || value === undefined) {
    return null
  }

  if (typeof value === 'number') {
    return numericSlotMap[value] ?? null
  }

  if (typeof value === 'string') {
    const key = value.trim()
    return key ? stringSlotMap[key] ?? null : null
  }

  return null
}

export const resolveSlotFromVisualType = (visualType: ShopItemVisualType | string | number | null | undefined): CosmeticSlot | null => {
  if (visualType === null || visualType === undefined) {
    return null
  }

  return normalizeCosmeticSlot(visualType)
}
