import { useTranslations } from 'next-intl'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteConfirmDialogProps {
  open: boolean
  fileName: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}

export const DeleteConfirmDialog = ({
  open,
  fileName,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmDialogProps) => {
  const t = useTranslations()

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('delete_document_title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('delete_document_message', { fileName })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-error hover:bg-error/90"
          >
            {isDeleting ? t('deleting') : t('confirm_delete_document')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
