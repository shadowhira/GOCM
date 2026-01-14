import { useTranslations } from 'next-intl'
import { Download, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { DocumentResponse } from '@/types/document'
import { DocumentCard } from './DocumentCard'
import { getFileIcon, getParentTypeBadge, formatDocumentDate } from '../utils/documentHelpers'

interface DocumentsTableProps {
  documents: DocumentResponse[]
  canDelete: (doc: DocumentResponse) => boolean
  onDelete: (id: number, fileName: string) => void
  locale?: string
}

export const DocumentsTable = ({ 
  documents, 
  canDelete, 
  onDelete, 
  locale = 'en' 
}: DocumentsTableProps) => {
  const t = useTranslations()

  const handleDownload = (url?: string) => {
    if (url) {
      window.open(url, '_blank')
    }
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-lg border overflow-hidden bg-background">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-0">
              <TableHead className="px-4 py-3 font-semibold text-xs uppercase text-muted-foreground">{t('document_name')}</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-xs uppercase text-muted-foreground">{t('document_file_type')}</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-xs uppercase text-muted-foreground">{t('document_uploaded_by')}</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-xs uppercase text-muted-foreground text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {documents.map((doc) => {
              const uploadDate = formatDocumentDate(doc.createdAt, locale)

              return (
                <TableRow key={doc.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getFileIcon(doc.fileType, 'h-4 w-4')}
                      </div>
                      <span
                        className="font-medium text-sm truncate max-w-xs text-primary hover:text-primary/80 cursor-pointer hover:underline transition-colors"
                        title={doc.fileName}
                        onClick={() => doc.publicUrl && window.open(doc.publicUrl, '_blank')}
                      >
                        {doc.fileName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getParentTypeBadge(doc.parentType, t, 'outline')}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-sm text-foreground font-medium">
                        {(doc.uploadedBy?.userName || doc.uploadedBy?.userEmail) ?? 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {uploadDate}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(doc.publicUrl)}
                        disabled={!doc.publicUrl}
                        className="hover:bg-primary/10 text-primary"
                        title={t('download')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {canDelete(doc) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={e => { e.stopPropagation(); onDelete(doc.id, doc.fileName); }}
                          className="hover:bg-destructive/10 text-destructive"
                          title={t('delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            canDelete={canDelete(doc)}
            onDelete={() => onDelete(doc.id, doc.fileName)}
            locale={locale}
          />
        ))}
      </div>
    </>
  )
}
