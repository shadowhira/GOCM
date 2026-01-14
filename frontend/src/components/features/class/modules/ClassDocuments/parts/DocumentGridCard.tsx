import { useTranslations } from 'next-intl'
import { Download, Trash2, MoreVertical } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { DocumentResponse } from '@/types/document'
import { getFileIcon, formatDocumentDate } from '../utils/documentHelpers'

interface DocumentGridCardProps {
  document: DocumentResponse
  canDelete: boolean
  onDelete: () => void
  locale?: string
}

export const DocumentGridCard = ({
  document,
  canDelete,
  onDelete,
  locale = 'en',
}: DocumentGridCardProps) => {
  const t = useTranslations()
  const uploadDate = formatDocumentDate(document.createdAt, locale)

  const handleDownload = () => {
    if (document.publicUrl) {
      window.open(document.publicUrl, '_blank')
    }
  }

  return (
    <Card
      className="p-4 hover:shadow-md transition-all cursor-pointer group relative"
      onClick={() => {
        if (document.publicUrl) {
          window.open(document.publicUrl, '_blank')
        }
      }}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Header: Menu */}
        <div className="w-full flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDownload} disabled={!document.publicUrl}>
                <Download className="h-4 w-4 mr-2" />
                {t('download')}
              </DropdownMenuItem>
              {canDelete && (
                <DropdownMenuItem onClick={e => { e.stopPropagation(); onDelete(); }} className="text-error">
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('delete')}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Icon */}
        <div className="w-full flex justify-center py-4">
          {getFileIcon(document.fileType, 'h-12 w-12')}
        </div>

        {/* File Info */}
        <div className="w-full space-y-2 text-center">
          <h4 className="font-medium text-sm truncate" title={document.fileName}>
            {document.fileName}
          </h4>
          
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>{uploadDate}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
