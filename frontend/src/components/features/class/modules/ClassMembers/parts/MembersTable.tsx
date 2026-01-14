'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users } from 'lucide-react'
import { MemberRow } from './MemberRow'
import type { ClassMemberResponse } from '@/types/class'

interface MembersTableProps {
  title: string
  members: ClassMemberResponse[]
  iconColor?: string
  canRemove?: boolean
  canEditRole?: boolean
  ownerId?: number
  onRemoveMember?: (memberId: number) => void
  onEditRole?: (member: ClassMemberResponse) => void
  classId: number
}

export const MembersTable = ({ 
  title, 
  members, 
  iconColor = 'text-primary-600',
  canRemove = false,
  canEditRole = false,
  ownerId,
  onRemoveMember,
  onEditRole,
  classId,
}: MembersTableProps) => {
  const t = useTranslations()

  if (members.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className={`h-5 w-5 ${iconColor}`} />
          {title} ({members.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('member')}</TableHead>
              <TableHead>{t('nickname')}</TableHead>
              <TableHead>{t('enrolled_date')}</TableHead>
              {(canRemove || canEditRole) && <TableHead className="w-28 text-right">{t('actions')}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <MemberRow 
                key={member.id} 
                member={member}
                canRemove={canRemove}
                canEditRole={canEditRole}
                isOwner={member.userId === ownerId}
                onRemove={onRemoveMember}
                onEditRole={onEditRole}
                classId={classId}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
