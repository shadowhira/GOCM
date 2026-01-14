import { useTranslations } from 'next-intl'
import { FileText, Loader2, AlertCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  type: 'empty' | 'no-results' | 'loading' | 'error'
  onRetry?: () => void
}

export const EmptyState = ({ type, onRetry }: EmptyStateProps) => {
  const t = useTranslations()

  if (type === 'loading') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 text-primary-500 animate-spin mb-4" />
          <p className="text-muted-foreground">{t('loading_documents')}</p>
        </CardContent>
      </Card>
    )
  }

  if (type === 'error') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-12 w-12 text-error mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('documents_error')}</h3>
          <p className="text-muted-foreground mb-4">{t('something_went_wrong')}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              {t('try_again')}
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  if (type === 'no-results') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('no_documents_found')}</h3>
          <p className="text-muted-foreground">{t('no_results_try_again')}</p>
        </CardContent>
      </Card>
    )
  }

  // type === 'empty'
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{t('no_documents_found')}</h3>
        <p className="text-muted-foreground">{t('no_documents_description')}</p>
      </CardContent>
    </Card>
  )
}
