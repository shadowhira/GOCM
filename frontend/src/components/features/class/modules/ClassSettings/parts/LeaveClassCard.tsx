"use client"

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { LogOut } from 'lucide-react'

interface LeaveClassCardProps {
  isLeaving: boolean
  onLeave: () => void
}

export const LeaveClassCard = ({ isLeaving, onLeave }: LeaveClassCardProps) => {
  const t = useTranslations()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogOut className="h-5 w-5" />
          {t('leave_class')}
        </CardTitle>
        <CardDescription>
          {t('leave_class_description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={isLeaving}>
              <LogOut className="mr-2 h-4 w-4" />
              {t('leave_class')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('confirm_leave_class')}</DialogTitle>
              <DialogDescription>
                {t('leave_class_warning')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => (document.activeElement as HTMLElement)?.blur()}>{t('cancel')}</Button>
              <Button variant="destructive" onClick={onLeave} disabled={isLeaving}>
                {t('confirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
