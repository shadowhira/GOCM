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
import { useJoinClass } from '@/queries/classQueries'
import { joinClassSchema, type JoinClassFormData } from '@/schemas/classSchema'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'

interface JoinClassModalProps {
  open: boolean
  onClose: () => void
}

export const JoinClassModal = ({ open, onClose }: JoinClassModalProps) => {
  const router = useRouterWithProgress()
  const t = useTranslations()
  const joinClassMutation = useJoinClass()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<JoinClassFormData>({
    resolver: zodResolver(joinClassSchema),
  })

  const onSubmit = async (data: JoinClassFormData) => {
    try {
      const result = await joinClassMutation.mutateAsync(data)
      
      toast.success(t('class_joined_success'))
      reset()
      onClose()
      
      // Navigate to the joined class
      router.push(`/class/${result.id}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('join_class_failed'), t))
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
          <DialogTitle>{t('join_existing_class')}</DialogTitle>
          <DialogDescription>
            {t('enter_join_code')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Join Code */}
          <div className="space-y-2">
            <label htmlFor="joinCode" className="text-sm font-medium">
              {t('join_code')} <span className="text-error">*</span>
            </label>
            <Input
              id="joinCode"
              placeholder="ABCDEF"
              {...register('joinCode')}
              disabled={isSubmitting}
              className={`uppercase ${errors.joinCode ? 'border-error' : ''}`}
              maxLength={6}
              onChange={(e) => {
                e.target.value = e.target.value.toUpperCase()
              }}
            />
            {errors.joinCode && (
              <p className="text-sm text-error">{t(errors.joinCode.message!)}</p>
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
              {isSubmitting ? t('joining_class') : t('join_class')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
