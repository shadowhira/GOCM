'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'

interface EmptyStateProps {
  type: 'loading' | 'error' | 'empty' | 'no-results'
  onRetry?: () => void
}

export const EmptyState = ({ type, onRetry }: EmptyStateProps) => {
  const t = useTranslations()

  if (type === 'loading') {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
            <p>{t('loading_members')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === 'error') {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-3 text-destructive">
            <p>{t('something_went_wrong')}</p>
            <Button variant="outline" onClick={onRetry}>
              {t('try_again')}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === 'no-results') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('class_members')}
          </CardTitle>
          <CardDescription>
            {t('no_members_match_search')}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // type === 'empty'
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('class_members')}
        </CardTitle>
        <CardDescription>
          {t('no_members_yet')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground py-8">
          {t('invite_students_teachers')}
        </p>
      </CardContent>
    </Card>
  )
}
