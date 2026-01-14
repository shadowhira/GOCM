import { Input } from '@/components/ui/input'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { ShopItemFormValues } from '..'
import type { TranslateFn } from '../types'
import { ShopItemTier } from '@/types/shopItem'
import { ShopItemPricing } from '@/config/pointSystem'

interface CostDurationFieldsProps {
  register: UseFormRegister<ShopItemFormValues>
  errors: FieldErrors<ShopItemFormValues>
  tier: ShopItemTier
  t: TranslateFn
}

export const CostDurationFields = ({ register, errors, tier, t }: CostDurationFieldsProps) => {
  const pricing = ShopItemPricing[tier]

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">{t('tier_pricing_hint')}:</span>{' '}
          {t('price_range')}: {pricing.minPrice} - {pricing.maxPrice} {t('points')},{' '}
          {t('recommended_duration')}: {pricing.durationDays} {t('days')}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="costInPoints" className="text-sm font-medium text-foreground">
            {t('cost_in_points')} <span className="text-error">*</span>
          </label>
          <Input
            id="costInPoints"
            type="number"
            step="1"
            min={pricing.minPrice}
            max={pricing.maxPrice}
            {...register('costInPoints', { valueAsNumber: true })}
            placeholder={pricing.recommendedPrice.toString()}
            aria-invalid={errors.costInPoints ? 'true' : 'false'}
          />
          {errors.costInPoints && (
            <p className="text-sm text-error">{t(errors.costInPoints.message as string)}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="usageDurationDays" className="text-sm font-medium text-foreground">
            {t('usage_duration_days')} <span className="text-error">*</span>
          </label>
          <Input
            id="usageDurationDays"
            type="number"
            step="1"
            min="1"
            {...register('usageDurationDays', { valueAsNumber: true })}
            placeholder={pricing.durationDays.toString()}
            aria-invalid={errors.usageDurationDays ? 'true' : 'false'}
          />
          <p className="text-xs text-muted-foreground">{t('usage_duration_days_helper')}</p>
          {errors.usageDurationDays && (
            <p className="text-sm text-error">{t(errors.usageDurationDays.message as string)}</p>
          )}
        </div>
      </div>
    </div>
  )
}
