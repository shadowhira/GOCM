"use client"

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateClassMemberSchema, type UpdateClassMemberFormData } from '@/schemas/classMemberSchema'
import { RoleInClass, type ClassMemberResponse } from '@/types/class'
import { Loader2 } from 'lucide-react'

interface ClassMemberEditModalProps {
  open: boolean
  member?: ClassMemberResponse
  onClose: () => void
  onSubmit: (values: UpdateClassMemberFormData) => void
  isSubmitting?: boolean
}

const formatDateForInput = (value?: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  const iso = date.toISOString()
  return iso.slice(0, 16)
}

export const ClassMemberEditModal = ({ open, member, onClose, onSubmit, isSubmitting = false }: ClassMemberEditModalProps) => {
  const t = useTranslations()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateClassMemberFormData>({
    resolver: zodResolver(updateClassMemberSchema),
    defaultValues: {
      roleInClassValue: member?.roleInClassValue ?? RoleInClass.STUDENT,
      points: member?.points ?? 0,
      enrollDate: formatDateForInput(member?.enrollDate),
    },
  })

  useEffect(() => {
    reset({
      roleInClassValue: member?.roleInClassValue ?? RoleInClass.STUDENT,
      points: member?.points ?? 0,
      enrollDate: formatDateForInput(member?.enrollDate),
    })
  }, [member, reset])

  const handleDialogClose = () => {
    if (isSubmitting) return
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleDialogClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('edit_class_member')}</DialogTitle>
          <DialogDescription>{t('update_member_details')}</DialogDescription>
        </DialogHeader>

        {member && (
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatarUrl} alt={member.userName} />
              <AvatarFallback>{member.userName?.charAt(0).toUpperCase() ?? '?'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{member.userName}</p>
              <p className="text-sm text-muted-foreground">{member.userEmail}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-select">{t('nickname')}</Label>
            <Controller
              control={control}
              name="roleInClassValue"
              render={({ field }) => (
                <Select
                  value={field.value !== undefined ? field.value.toString() : undefined}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger id="role-select">
                    <SelectValue placeholder={t('select_role')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RoleInClass.TEACHER.toString()}>{t('teacher')}</SelectItem>
                    <SelectItem value={RoleInClass.STUDENT.toString()}>{t('student')}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.roleInClassValue && (
              <p className="text-sm text-error">{t(errors.roleInClassValue.message!)}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="points-input">{t('points')}</Label>
            <Input
              id="points-input"
              type="number"
              min={0}
              step={1}
              {...register('points', { valueAsNumber: true })}
              disabled={isSubmitting}
            />
            {errors.points && <p className="text-sm text-error">{t(errors.points.message!)}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="enroll-date-input">{t('enrolled_date')}</Label>
            <Input
              id="enroll-date-input"
              type="datetime-local"
              {...register('enrollDate')}
              disabled={isSubmitting}
            />
            {errors.enrollDate && <p className="text-sm text-error">{t(errors.enrollDate.message!)}</p>}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={handleDialogClose} disabled={isSubmitting}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? t('updating_member') : t('save_changes')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
