'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { Layers, RefreshCcw } from 'lucide-react'

type EmptyStateType = 'empty' | 'no-results' | 'error'

interface AdminClassesEmptyStateProps {
  type: EmptyStateType
  onRetry?: () => void
}

export const AdminClassesEmptyState = ({ type, onRetry }: AdminClassesEmptyStateProps) => {
  const t = useTranslations()

  const content = (() => {
    switch (type) {
      case 'error':
        return {
          icon: <RefreshCcw className="h-10 w-10 text-destructive" />,
          title: t('something_went_wrong'),
          description: t('failed_to_load_classes'),
          actionLabel: t('try_again'),
        }
      case 'no-results':
        return {
          icon: <Layers className="h-10 w-10 text-muted-foreground" />,
          title: t('no_classes_found'),
          description: t('try_different_keywords'),
        }
      default:
        return {
          icon: <Layers className="h-10 w-10 text-muted-foreground" />,
          title: t('no_classes_yet'),
          description: t('start_your_learning_journey'),
        }
    }
  })()

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        {content.icon}
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">{content.title}</h3>
          <p className="text-sm text-muted-foreground">{content.description}</p>
        </div>
        {type === 'error' && onRetry && (
          <Button variant="primary" onClick={onRetry}>
            {content.actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
