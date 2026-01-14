'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Layers } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AdminClassesHeaderProps {
  totalClasses?: number
  onCreate: () => void
}

export const AdminClassesHeader = ({ totalClasses = 0, onCreate }: AdminClassesHeaderProps) => {
  const t = useTranslations()

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary-50 p-3 text-primary-600">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
              {t('admin_classes')}
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              {t('classes_management')}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('total_classes')}: <span className="font-medium text-foreground">{totalClasses}</span>
            </p>
          </div>
        </div>
        <Button onClick={onCreate} variant="primary" className="w-full gap-2 md:w-auto">
          {t('create_class')}
        </Button>
      </CardContent>
    </Card>
  )
}
