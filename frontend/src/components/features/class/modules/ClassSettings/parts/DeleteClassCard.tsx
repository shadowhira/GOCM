"use client"

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ShieldAlert, Trash2 } from 'lucide-react'

interface DeleteClassCardProps {
  isDeleting: boolean
  onDelete: () => void
}

export const DeleteClassCard = ({ isDeleting, onDelete }: DeleteClassCardProps) => {
  const t = useTranslations()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <ShieldAlert className="h-5 w-5" />
          {t('danger_zone')}
        </CardTitle>
        <CardDescription>
          {t('danger_zone_description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" disabled={isDeleting}>
              <Trash2 className="mr-2 h-4 w-4" />
              {t('delete_class')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('confirm_delete_class')}</DialogTitle>
              <DialogDescription>
                {t('delete_class_warning')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => (document.activeElement as HTMLElement)?.blur()}>{t('cancel')}</Button>
              <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
                {t('confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
