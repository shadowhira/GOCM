"use client"

import React from 'react'
import { useRouterWithProgress } from '@/hooks/useRouterWithProgress'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateClass } from '@/queries/classQueries'
import { createClassSchema, type CreateClassFormData } from '@/schemas/classSchema'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'

interface CreateClassModalProps {
  open: boolean
  onClose: () => void
}

export const CreateClassModal = ({ open, onClose }: CreateClassModalProps) => {
  const router = useRouterWithProgress()
  const t = useTranslations()
  const createClassMutation = useCreateClass()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateClassFormData>({
    resolver: zodResolver(createClassSchema),
  })

  const onSubmit = async (data: CreateClassFormData) => {
    try {
      const result = await createClassMutation.mutateAsync(data)
      
      toast.success(t('class_created_success'))
      reset()
      onClose()
      
      // Navigate to the newly created class
      router.push(`/class/${result.id}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('create_class_failed'), t))
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('create_new_class')}</DialogTitle>
          <DialogDescription>
            {t('start_your_learning_journey')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Class Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              {t('class_name')} <span className="text-error">*</span>
            </label>
            <Input
              id="name"
              placeholder={t('enter_class_name')}
              {...register('name')}
              disabled={isSubmitting}
              className={errors.name ? 'border-error' : ''}
            />
            {errors.name && (
              <p className="text-sm text-error">{t(errors.name.message!)}</p>
            )}
          </div>

          {/* Description (optional) */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              {t('description_optional')}
            </label>
            <textarea
              id="description"
              placeholder={t('enter_class_description')}
              {...register('description')}
              disabled={isSubmitting}
              rows={3}
              className={`flex w-full rounded-md border px-3 py-2 text-base ring-offset-ring focus:border-ring focus:ring-1 focus:ring-ring placeholder:text-muted-foreground focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                errors.description ? 'border-error' : ''
              }`}
            />
            {errors.description && (
              <p className="text-sm text-error">{t(errors.description.message!)}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? t('creating_class') : t('create_class')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
