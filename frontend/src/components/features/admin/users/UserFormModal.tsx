'use client'

import { useEffect, useMemo } from 'react'
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
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { FileUpload } from '@/components/features/uploadFile/FileUpload'
import { createUserSchema, updateUserSchema } from '@/schemas/adminSchema'
import type { UploadAvatarResponse } from '@/types/user'

export type UserFormMode = 'create' | 'edit'

export interface UserFormValues {
  displayName: string
  email: string
  avatarUrl?: string
  role: 'admin' | 'user'
  password?: string
}

interface UserFormModalProps {
  mode: UserFormMode
  open: boolean
  onClose: () => void
  onSubmit: (values: UserFormValues) => void
  defaultValues?: Partial<UserFormValues>
  isSubmitting?: boolean
  isLoading?: boolean
  userId?: number
  onAvatarUploaded?: (avatarUrl: string, userId?: number) => void
}

export const UserFormModal = ({
  mode,
  open,
  onClose,
  onSubmit,
  defaultValues,
  isSubmitting = false,
  isLoading = false,
  userId,
  onAvatarUploaded,
}: UserFormModalProps) => {
  const t = useTranslations()

  const resolver = useMemo(
    () =>
      zodResolver(mode === 'create' ? createUserSchema : updateUserSchema) as unknown as Resolver<UserFormValues>,
    [mode]
  )

  const form = useForm<UserFormValues>({
    resolver,
    defaultValues: {
      displayName: defaultValues?.displayName ?? '',
      email: defaultValues?.email ?? '',
      avatarUrl: defaultValues?.avatarUrl ?? '',
      role: defaultValues?.role ?? 'user',
      password: defaultValues?.password ?? '',
    },
  })

  const { register, handleSubmit, reset, setValue, watch, formState } = form
  useEffect(() => {
    register('role')
  }, [register])
  const roleValue = watch('role') ?? 'user'
  const avatarUrlValue = watch('avatarUrl') ?? ''
  const displayNameValue = watch('displayName') ?? ''
  const canUploadAvatar = mode === 'edit' && typeof userId === 'number' && userId > 0
  const targetUserId = canUploadAvatar ? (userId as number) : undefined

  useEffect(() => {
    reset({
      displayName: defaultValues?.displayName ?? '',
      email: defaultValues?.email ?? '',
      avatarUrl: defaultValues?.avatarUrl ?? '',
      role: defaultValues?.role ?? 'user',
      password: '',
    })
  }, [defaultValues, mode, reset])

  useEffect(() => {
    if (mode === 'edit') {
      setValue('password', '')
    }
  }, [mode, setValue])

  const submitHandler = handleSubmit((values) => {
    const trimmedAvatar = values.avatarUrl?.trim() ?? ''
    const trimmedPassword = values.password?.trim()

    onSubmit({
      ...values,
      avatarUrl: trimmedAvatar,
      password: trimmedPassword ? trimmedPassword : undefined,
    })
  })

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? t('create_user') : t('edit_user')}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? t('create_account')
              : t('update_profile_information')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          </div>
        ) : (
          <form onSubmit={submitHandler} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium text-foreground">
                {t('display_name')} <span className="text-error">*</span>
              </label>
              <Input
                id="displayName"
                {...register('displayName')}
                placeholder={t('display_name')}
                aria-invalid={formState.errors.displayName ? 'true' : 'false'}
              />
              {formState.errors.displayName && (
                <p className="text-sm text-error">
                  {t(formState.errors.displayName.message as string)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                {t('email')} <span className="text-error">*</span>
              </label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="name@email.com"
                aria-invalid={formState.errors.email ? 'true' : 'false'}
              />
              {formState.errors.email && (
                <p className="text-sm text-error">
                  {t(formState.errors.email.message as string)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('avatar')}
              </label>
              <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center">
                <Avatar className="h-16 w-16">
                  {avatarUrlValue ? (
                    <AvatarImage src={avatarUrlValue} alt={displayNameValue || 'Avatar'} />
                  ) : null}
                  <AvatarFallback>
                    {(displayNameValue.trim().charAt(0) || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {canUploadAvatar && targetUserId ? (
                  <FileUpload
                    key={avatarUrlValue || 'avatar-uploader'}
                    className="w-full max-w-sm"
                    action={`/User/${targetUserId}/avatar`}
                    accept="image/*"
                    showPreview={false}
                    onUploaded={(response) => {
                      const data = response as UploadAvatarResponse
                      if (!data?.avatarUrl) {
                        toast.error(t('something_went_wrong'))
                        return
                      }

                      setValue('avatarUrl', data.avatarUrl, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                      onAvatarUploaded?.(data.avatarUrl, targetUserId)
                    }}
                    initialPreviewUrl={avatarUrlValue || null}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t('avatar_upload_edit_only')}
                  </p>
                )}
              </div>
              {formState.errors.avatarUrl && (
                <p className="text-sm text-error">
                  {t(formState.errors.avatarUrl.message as string)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-foreground">
                {t('user_role')} <span className="text-error">*</span>
              </label>
              <Select
                value={roleValue}
                onValueChange={(value) =>
                  setValue('role', value as 'admin' | 'user', {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('select_role')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('role_admin')}</SelectItem>
                  <SelectItem value="user">{t('role_user')}</SelectItem>
                </SelectContent>
              </Select>
              {formState.errors.role && (
                <p className="text-sm text-error">
                  {t(formState.errors.role.message as string)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                {t('password')}{' '}
                {mode === 'create' ? <span className="text-error">*</span> : null}
              </label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder={mode === 'create' ? t('password') : t('leave_blank_to_keep_password')}
                aria-invalid={formState.errors.password ? 'true' : 'false'}
              />
              {mode === 'edit' && (
                <p className="text-xs text-muted-foreground">
                  {t('leave_blank_to_keep_password')}
                </p>
              )}
              {formState.errors.password && (
                <p className="text-sm text-error">
                  {t(formState.errors.password.message as string)}
                </p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                {t('cancel')}
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === 'create' ? t('create_user') : t('save_changes')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
