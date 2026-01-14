import { Switch } from '@/components/ui/switch'
import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { ShopItemFormValues } from '..'
import type { TranslateFn } from '../types'

interface DefaultToggleSectionProps {
  control: Control<ShopItemFormValues>
  isSubmitting: boolean
  t: TranslateFn
}

export const DefaultToggleSection = ({ control, isSubmitting, t }: DefaultToggleSectionProps) => {
  return (
    <div className="flex items-center justify-between rounded-md border border-border p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{t('default_shop_item')}</p>
        <p className="text-xs text-muted-foreground">{t('default_shop_item_helper')}</p>
      </div>
      <Controller
        control={control}
        name="isDefault"
        render={({ field }) => (
          <Switch checked={field.value} onCheckedChange={(checked) => field.onChange(checked)} disabled={isSubmitting} />
        )}
      />
    </div>
  )
}
