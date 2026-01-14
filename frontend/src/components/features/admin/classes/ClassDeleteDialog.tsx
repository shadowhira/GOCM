'use client'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useTranslations } from 'next-intl'
import type { ClassResponse } from '@/types/class'
import { Loader2 } from 'lucide-react'

interface ClassDeleteDialogProps {
  open: boolean
  classData?: ClassResponse
  onCancel: () => void
  onConfirm: () => void
  isDeleting?: boolean
}

export const ClassDeleteDialog = ({ open, classData, onCancel, onConfirm, isDeleting = false }: ClassDeleteDialogProps) => {
  const t = useTranslations()

  return (
    <AlertDialog open={open} onOpenChange={(value) => !value && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('confirm_delete_class')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('delete_class_warning')}
            {classData && (
              <strong className="mt-2 block text-foreground">{classData.name}</strong>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isDeleting} className="bg-destructive text-white hover:bg-destructive/90">
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('delete_class')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
