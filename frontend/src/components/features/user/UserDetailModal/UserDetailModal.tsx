'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { UserDetailContent } from './UserDetailContent'
import type { UserDetailModalProps } from './types'

export const UserDetailModal = ({
  user,
  classContext,
  open,
  onOpenChange,
  trigger,
}: UserDetailModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>{user.displayName}</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>
        <UserDetailContent user={user} classContext={classContext} />
      </DialogContent>
    </Dialog>
  )
}
