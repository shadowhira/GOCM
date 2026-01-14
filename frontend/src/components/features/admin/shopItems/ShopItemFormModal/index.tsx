'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useUploadShopItemIcon } from '@/queries/adminQueries'
import { createShopItemSchema, updateShopItemSchema } from '@/schemas/adminSchema'
import { ShopItemTier, ShopItemVisualType } from '@/types/shopItem'
import type { ClassMemberCosmeticSlotsResponse, CosmeticConfig } from '@/types/class'
import { ShopItemPricing } from '@/config/pointSystem'
import {
  CUSTOM_PRESET_ID,
  SHOP_ITEM_COLOR_PRESETS,
  compareConfigs,
  defaultPresetForVisualType,
  findPresetByConfig,
  getDefaultPresetForTier,
  tryParseConfig,
  type CosmeticPresetConfig,
  type ShopItemColorPreset,
} from '../colorPresets'
import { NameDescriptionFields } from './components/NameDescriptionFields'
import { VisualSettingsFields } from './components/VisualSettingsFields'
import { CostDurationFields } from './components/CostDurationFields'
import { IconUploadSection } from './components/IconUploadSection'
import { ThemeConfigurator } from './components/ThemeConfigurator'
import { DefaultToggleSection } from './components/DefaultToggleSection'

export type ShopItemFormMode = 'create' | 'edit'

export interface ShopItemFormValues {
  name: string
  description: string
  costInPoints: number
  usageDurationDays: number
  iconUrl?: string
  visualType: ShopItemVisualType
  tier: ShopItemTier
  isDefault: boolean
  colorPresetId: string
  configJson: string
}

interface ShopItemFormModalProps {
  mode: ShopItemFormMode
  open: boolean
  onClose: () => void
  onSubmit: (values: ShopItemFormValues) => void
  defaultValues?: Partial<ShopItemFormValues>
  isSubmitting?: boolean
  isLoading?: boolean
}

export const ShopItemFormModal = ({
  mode,
  open,
  onClose,
  onSubmit,
  defaultValues,
  isSubmitting = false,
  isLoading = false,
}: ShopItemFormModalProps) => {
  const t = useTranslations()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const uploadMutation = useUploadShopItemIcon()

  const initialVisualType = defaultValues?.visualType ?? ShopItemVisualType.NameBadge

  const themeDefaults = useMemo(() => {
    return resolveThemeDefaults(initialVisualType, defaultValues?.configJson)
  }, [initialVisualType, defaultValues?.configJson])

  const visualTypeOptions = useMemo(
    () => [
      { value: ShopItemVisualType.AvatarFrame, label: t('shop_item_visual_avatar_frame') },
      { value: ShopItemVisualType.ChatFrame, label: t('shop_item_visual_chat_frame') },
      { value: ShopItemVisualType.NameBadge, label: t('shop_item_visual_name_badge') },
    ],
    [t]
  )

  const tierOptions = useMemo(
    () => [
      { value: ShopItemTier.Basic, label: t('shop_item_tier_basic') },
      { value: ShopItemTier.Advanced, label: t('shop_item_tier_advanced') },
      { value: ShopItemTier.Elite, label: t('shop_item_tier_elite') },
      { value: ShopItemTier.Legendary, label: t('shop_item_tier_legendary') },
    ],
    [t]
  )

  const resolver = useMemo(
    () =>
      zodResolver(mode === 'create' ? createShopItemSchema : updateShopItemSchema) as unknown as Resolver<ShopItemFormValues>,
    [mode]
  )

  const form = useForm<ShopItemFormValues>({
    resolver,
    defaultValues: {
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      costInPoints: defaultValues?.costInPoints ?? 0,
      usageDurationDays: defaultValues?.usageDurationDays ?? 30,
      iconUrl: defaultValues?.iconUrl ?? '',
      visualType: defaultValues?.visualType ?? ShopItemVisualType.NameBadge,
      tier: defaultValues?.tier ?? ShopItemTier.Basic,
      isDefault: defaultValues?.isDefault ?? false,
      colorPresetId: themeDefaults.colorPresetId,
      configJson: themeDefaults.configJson,
    },
  })

  const { register, handleSubmit, reset, watch, setValue, formState, control } = form
  const iconUrlValue = watch('iconUrl') ?? ''
  const nameValue = watch('name') ?? ''
  const visualTypeValue = watch('visualType') ?? ShopItemVisualType.NameBadge
  const tierValue = watch('tier') ?? ShopItemTier.Basic
  const colorPresetValue = watch('colorPresetId') ?? themeDefaults.colorPresetId
  const configJsonValue = watch('configJson') ?? themeDefaults.configJson

  const availablePresets = useMemo(() => {
    const presets = SHOP_ITEM_COLOR_PRESETS[visualTypeValue] ?? []
    const shouldAddCustomPreset =
      Boolean(themeDefaults.customPreset) && initialVisualType === visualTypeValue
    if (shouldAddCustomPreset && themeDefaults.customPreset) {
      return [themeDefaults.customPreset, ...presets]
    }
    return presets
  }, [visualTypeValue, initialVisualType, themeDefaults.customPreset])

  const previewCosmetics = useMemo(
    () => buildPreviewCosmetics(visualTypeValue, tierValue, configJsonValue, iconUrlValue, nameValue),
    [visualTypeValue, tierValue, configJsonValue, iconUrlValue, nameValue]
  )

  useEffect(() => {
    reset({
      name: defaultValues?.name ?? '',
      description: defaultValues?.description ?? '',
      costInPoints: defaultValues?.costInPoints ?? 0,
      usageDurationDays: defaultValues?.usageDurationDays ?? 30,
      iconUrl: defaultValues?.iconUrl ?? '',
      visualType: defaultValues?.visualType ?? ShopItemVisualType.NameBadge,
      tier: defaultValues?.tier ?? ShopItemTier.Basic,
      isDefault: defaultValues?.isDefault ?? false,
      colorPresetId: themeDefaults.colorPresetId,
      configJson: themeDefaults.configJson,
    })
  }, [defaultValues, mode, reset, themeDefaults])

  // Auto-fill cost, duration, and colors when tier changes (only in create mode or when user explicitly changes tier)
  const previousTierRef = useRef<ShopItemTier | null>(null)
  useEffect(() => {
    // Skip auto-fill on initial load for edit mode
    if (mode === 'edit' && previousTierRef.current === null) {
      previousTierRef.current = tierValue
      return
    }
    
    // Only auto-fill when tier actually changes
    if (previousTierRef.current !== null && previousTierRef.current !== tierValue) {
      const tierPricing = ShopItemPricing[tierValue]
      
      // Auto-fill cost and duration
      setValue('costInPoints', tierPricing.recommendedPrice, { shouldDirty: true, shouldValidate: true })
      setValue('usageDurationDays', tierPricing.durationDays, { shouldDirty: true, shouldValidate: true })
      
      // Auto-fill colors based on tier
      const tierPreset = getDefaultPresetForTier(visualTypeValue, tierValue)
      if (tierPreset) {
        setValue('colorPresetId', tierPreset.id, { shouldDirty: true, shouldValidate: true })
        setValue('configJson', JSON.stringify(tierPreset.config), { shouldDirty: true, shouldValidate: true })
      }
    }
    
    previousTierRef.current = tierValue
  }, [tierValue, visualTypeValue, mode, setValue])

  useEffect(() => {
    if (!availablePresets.length) {
      return
    }

    const selectedPreset = availablePresets.find((preset) => preset.id === colorPresetValue)

    if (!selectedPreset) {
      const fallbackPreset = availablePresets[0]
      setValue('colorPresetId', fallbackPreset.id, { shouldDirty: true, shouldValidate: true })
      setValue('configJson', JSON.stringify(fallbackPreset.config), { shouldDirty: true, shouldValidate: true })
      return
    }

    const currentConfig = tryParseConfig(configJsonValue)
    if (!compareConfigs(currentConfig, selectedPreset.config)) {
      setValue('configJson', JSON.stringify(selectedPreset.config), { shouldDirty: false, shouldValidate: true })
    }
  }, [availablePresets, colorPresetValue, configJsonValue, setValue])

  const submitHandler = handleSubmit((values) => {
    onSubmit({
      name: values.name.trim(),
      description: values.description.trim(),
      costInPoints: values.costInPoints,
      usageDurationDays: values.usageDurationDays,
      iconUrl: values.iconUrl?.trim() || undefined,
      visualType: values.visualType,
      tier: values.tier,
      isDefault: values.isDefault,
      colorPresetId: values.colorPresetId,
      configJson: values.configJson,
    })
  })

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    uploadMutation.mutate(file, {
      onSuccess: (response) => {
        if (!response?.iconUrl) {
          toast.error(t('something_went_wrong'))
          return
        }

        setValue('iconUrl', response.iconUrl, {
          shouldDirty: true,
          shouldValidate: true,
        })
        toast.success(t('file_upload_success'))
      },
      onError: () => {
        toast.error(t('file_upload_failed'))
      },
      onSettled: () => {
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      },
    })
  }

  const handlePresetSelect = (preset: ShopItemColorPreset) => {
    setValue('colorPresetId', preset.id, { shouldDirty: true, shouldValidate: true })
    setValue('configJson', JSON.stringify(preset.config), { shouldDirty: true, shouldValidate: true })
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      {/* eslint-disable-next-line design-system/use-design-tokens */}
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto p-0 sm:max-w-2xl">
        <div className="flex flex-col">
          <div className="border-b border-border px-6 py-4">
            <DialogHeader className="space-y-1">
              <DialogTitle>{mode === 'create' ? t('create_shop_item') : t('edit_shop_item')}</DialogTitle>
              <DialogDescription>
                {mode === 'create' ? t('create') : t('save_changes')}
              </DialogDescription>
            </DialogHeader>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : (
            <form onSubmit={submitHandler} className="flex flex-col pr-5">
              <div className="space-y-6 px-6 py-4 pr-1">
                {/* 1. Name and Description */}
                <NameDescriptionFields register={register} errors={formState.errors} t={t} />
                
                {/* 2. Display Type and Tier (select these first) */}
                <VisualSettingsFields
                  control={control}
                  errors={formState.errors}
                  visualTypeOptions={visualTypeOptions}
                  tierOptions={tierOptions}
                  isSubmitting={isSubmitting}
                  t={t}
                />
                
                {/* 3. Cost and Duration (auto-filled based on tier) */}
                <CostDurationFields
                  register={register}
                  errors={formState.errors}
                  tier={tierValue}
                  t={t}
                />
                
                {/* 4. Icon Upload */}
                <IconUploadSection
                  iconUrl={iconUrlValue}
                  nameValue={nameValue}
                  register={register}
                  errors={formState.errors}
                  fileInputRef={fileInputRef}
                  onFileChange={handleFileChange}
                  onTriggerUpload={() => fileInputRef.current?.click()}
                  uploadInProgress={uploadMutation.isPending}
                  t={t}
                />
                <ThemeConfigurator
                  register={register}
                  errors={formState.errors}
                  availablePresets={availablePresets}
                  selectedPresetId={colorPresetValue}
                  onPresetSelect={handlePresetSelect}
                  previewCosmetics={previewCosmetics}
                  visualType={visualTypeValue}
                  nameValue={nameValue}
                  t={t}
                />
                <DefaultToggleSection control={control} isSubmitting={isSubmitting} t={t} />
              </div>
              <div className="border-t border-border bg-background px-6 py-4">
                <DialogFooter className="gap-3 p-0">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                    {t('cancel')}
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === 'create' ? t('create_shop_item') : t('save_changes')}
                  </Button>
                </DialogFooter>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const DEFAULT_THEME_CONFIG: CosmeticPresetConfig = {
  accentColor: '#C084FC',
  borderColor: '#7C3AED',
  backgroundColor: '#312E81',
  textColor: '#F5F3FF',
}

const buildCustomPreset = (config: CosmeticPresetConfig): ShopItemColorPreset => ({
  id: CUSTOM_PRESET_ID,
  labelKey: 'shop_item_color_custom_current_label',
  descriptionKey: 'shop_item_color_custom_current_description',
  swatches: [config.accentColor, config.borderColor, config.backgroundColor, config.textColor].filter(Boolean),
  config,
})

const resolveThemeDefaults = (visualType: ShopItemVisualType, configJson?: string | null) => {
  const parsedConfig = tryParseConfig(configJson)
  const matchedPreset = findPresetByConfig(visualType, parsedConfig)
  const fallbackPreset = defaultPresetForVisualType(visualType)
  const resolvedConfig = matchedPreset?.config ?? parsedConfig ?? fallbackPreset?.config ?? DEFAULT_THEME_CONFIG
  const serializedConfig = JSON.stringify(resolvedConfig)
  const customPreset = !matchedPreset && parsedConfig ? buildCustomPreset(parsedConfig) : null

  return {
    colorPresetId: matchedPreset?.id ?? (parsedConfig ? CUSTOM_PRESET_ID : fallbackPreset?.id ?? CUSTOM_PRESET_ID),
    configJson: serializedConfig,
    customPreset,
  }
}

const buildPreviewCosmetics = (
  visualType: ShopItemVisualType,
  tier: ShopItemTier,
  configJson: string,
  iconUrl?: string,
  name?: string
): ClassMemberCosmeticSlotsResponse => {
  const config = (tryParseConfig(configJson) ?? defaultPresetForVisualType(visualType)?.config ?? DEFAULT_THEME_CONFIG) as CosmeticConfig
  const baseItem = {
    shopItemId: -1,
    name: name?.trim() || 'Preview',
    iconUrl: iconUrl?.trim() || '',
    visualType,
    tier,
    remainingDays: 30,
    config,
  }

  switch (visualType) {
    case ShopItemVisualType.AvatarFrame:
      return { avatarFrame: baseItem, chatFrame: null, badge: null }
    case ShopItemVisualType.ChatFrame:
      return { avatarFrame: null, chatFrame: baseItem, badge: null }
    case ShopItemVisualType.NameBadge:
      return { avatarFrame: null, chatFrame: null, badge: baseItem }
    default:
      return { avatarFrame: null, chatFrame: null, badge: null }
  }
}
