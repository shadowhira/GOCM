'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { Pencil, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { UserResponse } from '@/types/user'
import { Role } from '@/types/auth'

interface AdminUsersTableRowProps {
  user: UserResponse
  onEdit: (userId: number) => void
  onDelete: (userId: number) => void
}

export const AdminUsersTableRow = ({ user, onEdit, onDelete }: AdminUsersTableRowProps) => {
  const t = useTranslations()

  const isAdmin = user.role === Role.Admin

  return (
    <TableRow className="hover:bg-muted/40">
      <TableCell className="pl-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.displayName} />
            ) : (
              <AvatarFallback className="bg-primary-100 text-primary-700">
                {user.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{user.displayName}</p>
            <p className="text-xs text-muted-foreground">ID: {user.id}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <p className="text-sm text-foreground">{user.email}</p>
      </TableCell>
      <TableCell>
        <Badge variant={isAdmin ? 'accent' : 'primary'} className="text-xs">
          {isAdmin ? t('role_admin') : t('role_user')}
        </Badge>
      </TableCell>
      <TableCell className="pr-6 text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            aria-label={t('edit_user')}
            onClick={() => onEdit(user.id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t('delete_user')}
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(user.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
