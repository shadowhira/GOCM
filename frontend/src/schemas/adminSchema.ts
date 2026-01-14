import { z } from 'zod'
import { ShopItemTier, ShopItemVisualType } from '@/types/shopItem'

const roleSchema = z.enum(['admin', 'user'])

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => value ?? '')
  .refine(
    (value) => value === '' || /^https?:\/\//i.test(value),
    'invalid_url'
  )

const displayNameSchema = z
  .string()
  .min(1, 'display_name_required')
  .min(2, 'display_name_min_length')
  .max(50, 'display_name_max_length')

const emailSchema = z
  .string()
  .min(1, 'email_required')
  .email('email_invalid')

const baseUserSchema = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  avatarUrl: optionalUrlSchema,
  role: roleSchema,
})

export const createUserSchema = baseUserSchema.extend({
  password: z
    .string()
    .min(1, 'password_required')
    .min(6, 'password_min_length')
    .max(50, 'password_max_length'),
})

export const updateUserSchema = baseUserSchema.extend({
  password: z
    .string()
    .max(50, 'password_max_length')
    .optional()
    .transform((value) => {
      const trimmed = value?.trim()
      return trimmed ? trimmed : undefined
    }),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>

const shopItemBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'item_name_required')
    .min(3, 'item_name_min_length')
    .max(100, 'item_name_max_length'),
  description: z
    .string()
    .max(500, 'description_max_length')
    .optional()
    .transform((value) => value?.trim() ?? ''),
  costInPoints: z.coerce
    .number()
    .refine((value) => Number.isFinite(value), 'cost_must_be_number')
    .min(0, 'cost_must_be_positive'),
  usageDurationDays: z.coerce
    .number()
    .refine((value) => Number.isInteger(value) && value > 0, 'usage_duration_must_be_positive'),
  iconUrl: optionalUrlSchema,
  visualType: z.nativeEnum(ShopItemVisualType),
  tier: z.nativeEnum(ShopItemTier),
  isDefault: z.boolean().optional().transform((value) => Boolean(value)),
  colorPresetId: z
    .string()
    .min(1, 'color_preset_required'),
  configJson: z
    .string()
    .min(1, 'color_preset_required'),
})

export const createShopItemSchema = shopItemBaseSchema

export const updateShopItemSchema = shopItemBaseSchema

export type CreateShopItemFormData = z.infer<typeof createShopItemSchema>
export type UpdateShopItemFormData = z.infer<typeof updateShopItemSchema>
