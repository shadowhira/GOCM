import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { ShopItemFormValues } from '..'
import type { TranslateFn } from '../types'

interface GeneralInfoFieldsProps {
  register: UseFormRegister<ShopItemFormValues>
  errors: FieldErrors<ShopItemFormValues>
  t: TranslateFn
}

export const GeneralInfoFields = ({ register, errors, t }: GeneralInfoFieldsProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-foreground">
          {t('item_name')} <span className="text-error">*</span>
        </label>
        <Input
          id="name"
          {...register('name')}
          placeholder={t('item_name')}
          aria-invalid={errors.name ? 'true' : 'false'}
        />
        {errors.name && (
          <p className="text-sm text-error">{t(errors.name.message as string)}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-foreground">
          {t('item_description')}
        </label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder={t('item_description')}
          aria-invalid={errors.description ? 'true' : 'false'}
        />
        {errors.description && (
          <p className="text-sm text-error">{t(errors.description.message as string)}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="costInPoints" className="text-sm font-medium text-foreground">
          {t('cost_in_points')} <span className="text-error">*</span>
        </label>
        <Input
          id="costInPoints"
          type="number"
          step="1"
          min="0"
          {...register('costInPoints', { valueAsNumber: true })}
          placeholder="0"
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
          placeholder="30"
          aria-invalid={errors.usageDurationDays ? 'true' : 'false'}
        />
        <p className="text-xs text-muted-foreground">{t('usage_duration_days_helper')}</p>
        {errors.usageDurationDays && (
          <p className="text-sm text-error">{t(errors.usageDurationDays.message as string)}</p>
        )}
      </div>
    </div>
  )
}
