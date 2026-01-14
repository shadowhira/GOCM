'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import type { UserResponse } from '@/types/user'

interface UserDeleteDialogProps {
  open: boolean
  user?: UserResponse
  onCancel: () => void
  onConfirm: () => void
  isDeleting?: boolean
}

export const UserDeleteDialog = ({
  open,
  user,
  onCancel,
  onConfirm,
  isDeleting = false,
}: UserDeleteDialogProps) => {
  const t = useTranslations()

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('confirm_delete_user')}</DialogTitle>
          <DialogDescription>
            {t('delete_user_warning')}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium text-foreground">{user?.displayName ?? '—'}</p>
          <p className="text-sm text-muted-foreground">{user?.email ?? '—'}</p>
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isDeleting}>
            {t('cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('delete_user')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
