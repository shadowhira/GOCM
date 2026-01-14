import { CosmeticAvatar, CosmeticBadge, CosmeticChatBubble } from '@/components/features/cosmetics'
import type { ClassMemberCosmeticSlotsResponse } from '@/types/class'
import { ShopItemVisualType } from '@/types/shopItem'
import { cn } from '@/lib/utils'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { ShopItemFormValues } from '..'
import type { TranslateFn } from '../types'
import type { ShopItemColorPreset } from '../../colorPresets'

interface ThemeConfiguratorProps {
  register: UseFormRegister<ShopItemFormValues>
  errors: FieldErrors<ShopItemFormValues>
  availablePresets: ShopItemColorPreset[]
  selectedPresetId: string
  onPresetSelect: (preset: ShopItemColorPreset) => void
  previewCosmetics: ClassMemberCosmeticSlotsResponse
  visualType: ShopItemVisualType
  nameValue: string
  t: TranslateFn
}

export const ThemeConfigurator = ({
  register,
  errors,
  availablePresets,
  selectedPresetId,
  onPresetSelect,
  previewCosmetics,
  visualType,
  nameValue,
  t,
}: ThemeConfiguratorProps) => {
  return (
    <div className="space-y-4 rounded-md border border-border p-4">
      <div className="space-y-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{t('shop_item_theme_section_title')}</p>
          <p className="text-xs text-muted-foreground">{t('shop_item_theme_section_description')}</p>
        </div>
        <input type="hidden" {...register('colorPresetId')} />
        <input type="hidden" {...register('configJson')} />
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('shop_item_color_preset_label')}
          </label>
          <div className="grid gap-3">
            {availablePresets.map((preset) => {
              const isActive = preset.id === selectedPresetId
              return (
                <button
                  type="button"
                  key={preset.id}
                  className={cn(
                    'w-full rounded-md border p-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
                    isActive ? 'border-primary-500 bg-primary-500/5 ring-2 ring-primary-200' : 'border-border hover:border-primary-200'
                  )}
                  onClick={() => onPresetSelect(preset)}
                  aria-pressed={isActive}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t(preset.labelKey)}</p>
                      <p className="text-xs text-muted-foreground">{t(preset.descriptionKey)}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {preset.swatches.map((swatch, index) => (
                        <span
                          key={`${preset.id}-${swatch}-${index}`}
                          className="h-6 w-6 rounded-full border border-white/40"
                          style={{ backgroundColor: swatch }}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          {errors.colorPresetId && (
            <p className="text-sm text-error">{t(errors.colorPresetId.message as string)}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('shop_item_color_preview_label')}
        </p>
        <div className="space-y-3 rounded-md border border-dashed border-border p-3">
          {visualType === ShopItemVisualType.AvatarFrame && (
            <div className="flex items-center gap-3">
              <CosmeticAvatar cosmetics={previewCosmetics} displayName={nameValue || t('preview_label')} showFrameWhenHidden />
              <div>
                <p className="text-sm font-semibold text-foreground">{nameValue || t('preview_label')}</p>
                <p className="text-xs text-muted-foreground">{t('shop_item_visual_avatar_frame')}</p>
              </div>
            </div>
          )}

          {visualType === ShopItemVisualType.NameBadge && (
            <div className="flex items-center gap-3">
              <CosmeticBadge cosmetics={previewCosmetics} fallbackLabel={nameValue || t('preview_label')} showWhenDisabled />
              <p className="text-xs text-muted-foreground">{t('shop_item_visual_name_badge')}</p>
            </div>
          )}

          {visualType === ShopItemVisualType.ChatFrame && (
            <CosmeticChatBubble cosmetics={previewCosmetics} footer="2m ago" align="start">
              {t('shop_item_color_preview_message')}
            </CosmeticChatBubble>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{t('shop_item_color_preview_help')}</p>
      </div>
    </div>
  )
}
