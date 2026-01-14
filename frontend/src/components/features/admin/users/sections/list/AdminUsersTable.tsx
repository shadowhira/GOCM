'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTranslations } from 'next-intl'
import type { UserResponse } from '@/types/user'
import { AdminUsersTableRow } from './AdminUsersTableRow'

interface AdminUsersTableProps {
  users: UserResponse[]
  onEdit: (userId: number) => void
  onDelete: (userId: number) => void
}

export const AdminUsersTable = ({ users, onEdit, onDelete }: AdminUsersTableProps) => {
  const t = useTranslations()

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-6">{t('display_name')}</TableHead>
              <TableHead>{t('email')}</TableHead>
              <TableHead>{t('user_role')}</TableHead>
              <TableHead className="w-28 pr-6 text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <AdminUsersTableRow
                key={user.id}
                user={user}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
