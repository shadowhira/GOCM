'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTranslations } from 'next-intl'
import type { ClassResponse } from '@/types/class'
import { AdminClassesTableRow } from './AdminClassesTableRow'

interface AdminClassesTableProps {
  classes: ClassResponse[]
  onView: (classId: number) => void
  onEdit: (classId: number) => void
  onDelete: (classId: number) => void
}

export const AdminClassesTable = ({ classes, onView, onEdit, onDelete }: AdminClassesTableProps) => {
  const t = useTranslations()

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-6">{t('class_name')}</TableHead>
              <TableHead>{t('class_owner')}</TableHead>
              <TableHead>{t('members')}</TableHead>
              <TableHead>{t('created_date_short')}</TableHead>
              <TableHead>{t('join_code')}</TableHead>
              <TableHead className="w-32 pr-6 text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.map((item) => (
              <AdminClassesTableRow
                key={item.id}
                classData={item}
                onView={onView}
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
