import { Loader2, Upload } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { ShopItemFormValues } from '..'
import type { TranslateFn } from '../types'

interface IconUploadSectionProps {
  iconUrl: string
  nameValue: string
  register: UseFormRegister<ShopItemFormValues>
  errors: FieldErrors<ShopItemFormValues>
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onTriggerUpload: () => void
  uploadInProgress: boolean
  t: TranslateFn
}

export const IconUploadSection = ({
  iconUrl,
  nameValue,
  register,
  errors,
  fileInputRef,
  onFileChange,
  onTriggerUpload,
  uploadInProgress,
  t,
}: IconUploadSectionProps) => {
  const fallbackInitial = (nameValue.trim().charAt(0) || 'S').toUpperCase()

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{t('item_icon')}</label>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="h-16 w-16">
          {iconUrl ? (
            <AvatarImage src={iconUrl} alt={nameValue || 'Shop item icon'} />
          ) : (
            <AvatarFallback>{fallbackInitial}</AvatarFallback>
          )}
        </Avatar>
        <div className="w-full space-y-2">
          <Input
            {...register('iconUrl')}
            placeholder={t('icon_url')}
            aria-invalid={errors.iconUrl ? 'true' : 'false'}
          />
          {errors.iconUrl && (
            <p className="text-sm text-error">{t(errors.iconUrl.message as string)}</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onTriggerUpload}
            disabled={uploadInProgress}
          >
            {uploadInProgress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Upload className="mr-2 h-4 w-4" />
            {t('upload_icon')}
          </Button>
        </div>
      </div>
    </div>
  )
}
