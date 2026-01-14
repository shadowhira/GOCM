'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Calendar, Mail, Pencil, Trash2 } from 'lucide-react'
import { RoleInClass } from '@/types/class'
import type { ClassMemberResponse } from '@/types/class'
import { CosmeticAvatar, CosmeticBadge } from '@/components/features/cosmetics'
import {
  UserDetailModal,
  ClickableAvatarWrapper,
  useUserDetailModal,
  type UserBasicInfo,
  type UserClassContext,
} from '@/components/features/user'

interface MemberRowProps {
  member: ClassMemberResponse
  canRemove?: boolean
  canEditRole?: boolean
  isOwner?: boolean
  onRemove?: (memberId: number) => void
  onEditRole?: (member: ClassMemberResponse) => void
  classId: number
}

export const MemberRow = ({
  member,
  canRemove = false,
  canEditRole = false,
  isOwner = false,
  onRemove,
  onEditRole,
  classId,
}: MemberRowProps) => {
  const t = useTranslations()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const { isOpen, selectedUser, classContext, openModal, setIsOpen } = useUserDetailModal()

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'Z').toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleRemoveClick = () => {
    setShowConfirmDialog(true)
  }

  const handleConfirmRemove = () => {
    onRemove?.(member.id)
    setShowConfirmDialog(false)
  }

  const handleEditClick = () => {
    onEditRole?.(member)
  }

  const handleAvatarClick = () => {
    const userBasicInfo: UserBasicInfo = {
      id: member.userId,
      displayName: member.userName,
      email: member.userEmail,
      avatarUrl: member.avatarUrl,
    }

    const userClassContext: UserClassContext = {
      classId,
      classMemberId: member.id,
      roleInClass: member.roleInClassValue,
      roleInClassLabel: member.roleInClass,
      points: member.points ?? 0,
      enrollDate: member.enrollDate,
      cosmetics: member.cosmetics,
    }

    openModal(userBasicInfo, userClassContext)
  }

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <div className="flex items-center gap-3">
            <ClickableAvatarWrapper onClick={handleAvatarClick}>
              <CosmeticAvatar
                classId={classId}
                classMemberId={member.id}
                avatarUrl={member.avatarUrl}
                displayName={member.userName}
                size="md"
              />
            </ClickableAvatarWrapper>
            <div>
              <p className="font-medium text-foreground">{member.userName}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{member.userEmail}</span>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <CosmeticBadge
            classId={classId}
            classMemberId={member.id}
            fallbackLabel={member.roleInClass}
            size="md"
            className={member.roleInClassValue === RoleInClass.TEACHER ? 'uppercase tracking-wide' : undefined}
            showWhenDisabled
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(member.enrollDate)}</span>
          </div>
        </TableCell>
        {(canEditRole || canRemove) && (
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-1">
              {canEditRole && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  aria-label={t('edit_member')}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {canRemove && !isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveClick}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label={t('remove_member')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TableCell>
        )}
      </TableRow>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          classContext={classContext}
          open={isOpen}
          onOpenChange={setIsOpen}
        />
      )}

      {/* Confirm Remove Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirm_remove_member')}</DialogTitle>
            <DialogDescription>
              {t('remove_member_warning', { name: member.userName })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmRemove}>
              {t('remove_member')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
