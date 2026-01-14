'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2 } from 'lucide-react'
import { RoleInClass, type ClassMemberResponse } from '@/types/class'

interface EditMemberRoleDialogProps {
  open: boolean
  member?: ClassMemberResponse | null
  onClose: () => void
  onSubmit: (role: RoleInClass) => void
  isSubmitting?: boolean
}

export const EditMemberRoleDialog = ({
  open,
  member,
  onClose,
  onSubmit,
  isSubmitting = false,
}: EditMemberRoleDialogProps) => {
  const t = useTranslations()
  const [selectedRole, setSelectedRole] = useState<RoleInClass>(member?.roleInClassValue ?? RoleInClass.STUDENT)

  useEffect(() => {
    setSelectedRole(member?.roleInClassValue ?? RoleInClass.STUDENT)
  }, [member])

  const handleOpenChange = (value: boolean) => {
    if (!value && !isSubmitting) {
      onClose()
    }
  }

  const handleSubmit = () => {
    if (!member || isSubmitting) return
    onSubmit(selectedRole)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('edit_member_role')}</DialogTitle>
          <DialogDescription>{t('edit_member_role_description')}</DialogDescription>
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

        <div className="space-y-2">
          <Label htmlFor="role-select">{t('nickname')}</Label>
          <Select
            value={selectedRole.toString()}
            onValueChange={(value) => setSelectedRole(Number(value) as RoleInClass)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="role-select">
              <SelectValue placeholder={t('select_role')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RoleInClass.TEACHER.toString()}>{t('teacher')}</SelectItem>
              <SelectItem value={RoleInClass.STUDENT.toString()}>{t('student')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !member} className="gap-2">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? t('saving_changes') : t('save_changes')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
