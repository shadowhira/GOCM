import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ShopItemFormValues } from '..'
import type { TranslateFn } from '../types'

interface VisualSettingsFieldsProps {
  control: Control<ShopItemFormValues>
  errors: FieldErrors<ShopItemFormValues>
  visualTypeOptions: Array<{ value: number; label: string }>
  tierOptions: Array<{ value: number; label: string }>
  isSubmitting: boolean
  t: TranslateFn
}

export const VisualSettingsFields = ({
  control,
  errors,
  visualTypeOptions,
  tierOptions,
  isSubmitting,
  t,
}: VisualSettingsFieldsProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t('visual_type')} <span className="text-error">*</span>
        </label>
        <Controller
          control={control}
          name="visualType"
          render={({ field }) => (
            <Select
              value={field.value.toString()}
              onValueChange={(value) => field.onChange(Number(value))}
              disabled={isSubmitting}
            >
              <SelectTrigger aria-invalid={errors.visualType ? 'true' : 'false'}>
                <SelectValue placeholder={t('select_option')} />
              </SelectTrigger>
              <SelectContent>
                {visualTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.visualType && (
          <p className="text-sm text-error">{t(errors.visualType.message as string)}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t('tier')} <span className="text-error">*</span>
        </label>
        <Controller
          control={control}
          name="tier"
          render={({ field }) => (
            <Select
              value={field.value.toString()}
              onValueChange={(value) => field.onChange(Number(value))}
              disabled={isSubmitting}
            >
              <SelectTrigger aria-invalid={errors.tier ? 'true' : 'false'}>
                <SelectValue placeholder={t('select_option')} />
              </SelectTrigger>
              <SelectContent>
                {tierOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.tier && <p className="text-sm text-error">{t(errors.tier.message as string)}</p>}
      </div>
    </div>
  )
}
