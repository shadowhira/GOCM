import { useTranslations } from 'next-intl'
import { Download, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { DocumentResponse } from '@/types/document'
import { getFileIcon, getFileTypeName, getParentTypeBadge, formatDocumentDate } from '../utils/documentHelpers'

interface DocumentCardProps {
  document: DocumentResponse
  canDelete: boolean
  onDelete: () => void
  locale?: string
}

export const DocumentCard = ({ document, canDelete, onDelete, locale = 'en' }: DocumentCardProps) => {
  const t = useTranslations()

  const handleDownload = () => {
    if (document.publicUrl) {
      window.open(document.publicUrl, '_blank')
    }
  }

  const uploadDate = formatDocumentDate(document.createdAt, locale)

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with icon and file name */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getFileIcon(document.fileType)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 
                className="font-semibold text-sm truncate text-primary hover:text-primary/80 cursor-pointer hover:underline transition-colors"
                title={document.fileName}
                onClick={handleDownload}
              >
                {document.fileName}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {getFileTypeName(document.fileType)}
              </p>
            </div>

            {getParentTypeBadge(document.parentType, t)}
          </div>

          {/* Metadata */}
          <div className="bg-muted/30 rounded-md p-3 space-y-1.5">
            <div className="flex justify-between items-start gap-2">
              <div className="text-xs text-muted-foreground">{t('document_uploaded_by')}:</div>
              <div className="text-sm font-medium text-foreground text-right">
                {document.uploadedBy?.userName || document.uploadedBy?.userEmail || 'Unknown'}
              </div>
            </div>
            <div className="flex justify-between items-start gap-2">
              <div className="text-xs text-muted-foreground">{t('document_upload_date')}:</div>
              <div className="text-sm text-muted-foreground">
                {uploadDate}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              disabled={!document.publicUrl}
              className="flex-1"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              {t('download')}
            </Button>
            {canDelete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={e => { e.stopPropagation(); onDelete(); }}
                className="flex-1"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                {t('delete')}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
