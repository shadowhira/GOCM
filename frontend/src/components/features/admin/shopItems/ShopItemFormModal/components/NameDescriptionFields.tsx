import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { ShopItemFormValues } from '..'
import type { TranslateFn } from '../types'

interface NameDescriptionFieldsProps {
  register: UseFormRegister<ShopItemFormValues>
  errors: FieldErrors<ShopItemFormValues>
  t: TranslateFn
}

export const NameDescriptionFields = ({ register, errors, t }: NameDescriptionFieldsProps) => {
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
    </div>
  )
}
