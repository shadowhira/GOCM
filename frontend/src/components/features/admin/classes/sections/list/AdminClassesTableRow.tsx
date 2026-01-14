'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTranslations } from 'next-intl'
import type { ClassResponse } from '@/types/class'
import { Calendar, Clipboard, ClipboardCheck, Eye, Pencil, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface AdminClassesTableRowProps {
  classData: ClassResponse
  onView: (classId: number) => void
  onEdit: (classId: number) => void
  onDelete: (classId: number) => void
}

const formatDate = (value: string) => {
  const date = new Date(value.includes('Z') || value.includes('+') ? value : `${value}Z`)
  return date.toLocaleDateString()
}

export const AdminClassesTableRow = ({ classData, onView, onEdit, onDelete }: AdminClassesTableRowProps) => {
  const t = useTranslations()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(classData.joinCode)
      setCopied(true)
      toast.success(t('join_code_copied'))
      window.setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      console.error('copy failed', error)
      toast.error(t('copy_failed'))
    }
  }

  return (
    <TableRow>
      <TableCell className="pl-6">
        <div className="space-y-1">
          <p className="font-medium text-foreground">{classData.name}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {classData.description || t('no_description_yet')}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={classData.createdByUserAvatarUrl || undefined} alt={classData.createdByUserName} />
            <AvatarFallback className="bg-primary-100 text-primary-700 text-sm font-semibold">
              {classData.createdByUserName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">{classData.createdByUserName}</p>
            <p className="text-xs text-muted-foreground">{t('class_owner')}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="gap-1">
          <Users className="h-4 w-4" />
          {classData.memberCount}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {formatDate(classData.createdAt)}
        </div>
      </TableCell>
      <TableCell>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
          {copied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
          {classData.joinCode}
        </Button>
      </TableCell>
      <TableCell className="pr-6">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" aria-label={t('view_details')} onClick={() => onView(classData.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={t('edit_class')} onClick={() => onEdit(classData.id)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={t('delete_class')} onClick={() => onDelete(classData.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
