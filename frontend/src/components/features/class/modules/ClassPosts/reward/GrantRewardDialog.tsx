'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button, type ButtonProps } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { GrantRewardRequest } from '@/types/reward'
import { RewardPointDefaults } from '@/types/reward'
import { useTranslations } from 'next-intl'

type RewardDialogContext = 'post' | 'comment'

interface GrantRewardDialogProps {
  context: RewardDialogContext
  recipientName: string
  triggerIcon?: React.ReactNode
  triggerVariant?: ButtonProps['variant']
  triggerSize?: ButtonProps['size']
  defaultPoints?: number
  minPoints?: number
  maxPoints?: number
  reasonMaxLength?: number
  disabled?: boolean
  onSubmit: (payload: GrantRewardRequest) => Promise<void>
  isSubmitting?: boolean
}

export const GrantRewardDialog = ({
  context,
  recipientName,
  triggerIcon,
  triggerVariant = 'secondary',
  triggerSize = 'sm',
  defaultPoints,
  minPoints,
  maxPoints,
  reasonMaxLength = 512,
  disabled,
  onSubmit,
  isSubmitting: externalSubmitting = false,
}: GrantRewardDialogProps) => {
  const t = useTranslations()
  const prefix = context === 'post' ? 'reward_post' : 'reward_comment'

  const resolvedDefaultPoints =
    defaultPoints ??
    (context === 'post'
      ? RewardPointDefaults.post
      : RewardPointDefaults.comment)

  const resolvedMinPoints = minPoints ?? (context === 'post' ? RewardPointDefaults.postMin : RewardPointDefaults.commentMin)
  const resolvedMaxPoints = maxPoints ?? (context === 'post' ? RewardPointDefaults.postMax : RewardPointDefaults.commentMax)

  const [open, setOpen] = React.useState(false)
  const [pointsValue, setPointsValue] = React.useState(String(resolvedDefaultPoints))
  const [reasonValue, setReasonValue] = React.useState('')
  const [formError, setFormError] = React.useState<string | null>(null)
  const [internalSubmitting, setInternalSubmitting] = React.useState(false)
  const uniqueId = React.useId()

  const isSubmitting = internalSubmitting || externalSubmitting

  React.useEffect(() => {
    if (!open) {
      setPointsValue(String(resolvedDefaultPoints))
      setReasonValue('')
      setFormError(null)
      setInternalSubmitting(false)
    }
  }, [open, resolvedDefaultPoints])

  const handleSubmit = async () => {
    const numericPoints = Number(pointsValue)
    if (
      Number.isNaN(numericPoints) ||
      numericPoints < resolvedMinPoints ||
      numericPoints > resolvedMaxPoints
    ) {
      setFormError(
        t('reward_invalid_points', {
          min: resolvedMinPoints,
          max: resolvedMaxPoints,
        }),
      )
      return
    }

    setFormError(null)
    setInternalSubmitting(true)

    try {
      await onSubmit({
        points: numericPoints,
        reason: reasonValue.trim() ? reasonValue.trim() : undefined,
      })
      setOpen(false)
    } finally {
      setInternalSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isSubmitting && setOpen(next)}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          disabled={disabled || isSubmitting}
        >
          {triggerIcon}
          {t(`${prefix}_button`)}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t(`${prefix}_dialog_title`)}</DialogTitle>
          <DialogDescription>
            {t(`${prefix}_dialog_description`, { name: recipientName })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* POINTS */}
          <div className="space-y-2">
            <Label htmlFor={`${uniqueId}-points`}>
              {t('reward_points_label')}
            </Label>
            <Input
              id={`${uniqueId}-points`}
              type="number"
              min={resolvedMinPoints}
              max={resolvedMaxPoints}
              step={1}
              value={pointsValue}
              onChange={(e) => setPointsValue(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {t('reward_points_helper', {
                min: resolvedMinPoints,
                max: resolvedMaxPoints,
              })}
            </p>
          </div>

          {/* REASON */}
          <div className="space-y-2">
            <Label htmlFor={`${uniqueId}-reason`}>
              {t('reward_reason_label')}
            </Label>
            <Textarea
              id={`${uniqueId}-reason`}
              maxLength={reasonMaxLength}
              rows={3}
              value={reasonValue}
              placeholder={t('reward_reason_placeholder')}
              onChange={(e) => setReasonValue(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {reasonValue.length}/{reasonMaxLength}
            </p>
          </div>

          {formError && (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            {t('reward_cancel')}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" />
            )}
            {t('reward_submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
