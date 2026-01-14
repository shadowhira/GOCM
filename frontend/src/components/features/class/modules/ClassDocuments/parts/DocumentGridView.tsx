import type { DocumentResponse } from '@/types/document'
import { DocumentGridCard } from './DocumentGridCard'

interface DocumentGridViewProps {
  documents: DocumentResponse[]
  canDelete: (doc: DocumentResponse) => boolean
  onDelete: (id: number, fileName: string) => void
  locale?: string
}

export const DocumentGridView = ({
  documents,
  canDelete,
  onDelete,
  locale = 'en',
}: DocumentGridViewProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {documents.map((doc) => (
        <DocumentGridCard
          key={doc.id}
          document={doc}
          canDelete={canDelete(doc)}
          onDelete={() => onDelete(doc.id, doc.fileName)}
          locale={locale}
        />
      ))}
    </div>
  )
}
