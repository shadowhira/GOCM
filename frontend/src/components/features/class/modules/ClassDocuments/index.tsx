'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useGetDocumentsByClassId, useDeleteDocument } from '@/queries/documentQueries'
import { useGetClassMembers } from '@/queries/classQueries'
import { useCurrentUser } from '@/store/auth/useAuthStore'
import { RoleInClass } from '@/types/class'
import { ParentType } from '@/types/constants'
import type { DocumentResponse } from '@/types/document'
import { DocumentsHeader, type ViewMode, type SortOption } from './parts/DocumentsHeader'
import { DocumentsFilters } from './parts/DocumentsFilters'
import { DocumentsTable } from './parts/DocumentsTable'
import { DocumentGridView } from './parts/DocumentGridView'
import { EmptyState } from './parts/EmptyState'
import { UploadDocumentModal } from './parts/UploadDocumentModal'
import { DeleteConfirmDialog } from './parts/DeleteConfirmDialog'
import { useDocumentsHash } from './hooks/useDocumentsHash'
import { getApiErrorMessage } from '@/lib/api-error'

interface ClassDocumentsProps {
  classId: string
}

export const ClassDocuments = ({ classId }: ClassDocumentsProps) => {
  const t = useTranslations()
  const locale = useLocale()
  const currentUser = useCurrentUser()
  const classIdNum = parseInt(classId)

  const [activeTab] = useState<'documents'>('documents')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [searchQuery, setSearchQuery] = useState('')
  const [parentTypeFilter, setParentTypeFilter] = useState<'all' | ParentType>('all')
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; fileName: string } | null>(null)

  const { isUploadModalOpen, openUploadModal, closeUploadModal } = useDocumentsHash()

  // Queries
  const { data: documents = [], isLoading, isError } = useGetDocumentsByClassId(classIdNum)
  const { data: members = [] } = useGetClassMembers(classIdNum)
  const { mutate: deleteDocument, isPending: isDeleting } = useDeleteDocument()

  // Check user permissions
  const currentUserMember = useMemo(
    () => members.find((m) => m.userId === currentUser?.id),
    [members, currentUser]
  )

  const isTeacher = currentUserMember?.roleInClassValue === RoleInClass.TEACHER
  const isStudent = currentUserMember?.roleInClassValue === RoleInClass.STUDENT
  // Both teacher and student can upload documents
  const canUpload = isTeacher || isStudent

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    // Filter
    let filtered = documents.filter((doc) => {
      const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = parentTypeFilter === 'all' || doc.parentType === parentTypeFilter
      return matchesSearch && matchesType
    })

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.fileName.localeCompare(b.fileName)
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'type':
          return a.fileType - b.fileType
        default:
          return 0
      }
    })

    return filtered
  }, [documents, searchQuery, parentTypeFilter, sortBy])

  // Check if user can delete a document
  const canDeleteDocument = (doc: DocumentResponse): boolean => {
    if (isTeacher) return true
    if (!doc.uploadedBy) return false
    return doc.uploadedBy.userId === currentUser?.id
  }

  const handleDeleteClick = (id: number, fileName: string) => {
    setDeleteTarget({ id, fileName })
  }

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return

    deleteDocument(deleteTarget.id, {
      onSuccess: () => {
        toast.success(t('delete_success_document'))
        setDeleteTarget(null)
      },
      onError: (error: Error) => {
        toast.error(getApiErrorMessage(error, t('delete_failed_document'), t))
      }
    })
  }

  const handleDeleteCancel = () => {
    setDeleteTarget(null)
  }

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <DocumentsHeader 
        canUpload={canUpload} 
        viewMode={viewMode}
        sortBy={sortBy}
        onUpload={openUploadModal}
        onViewModeChange={setViewMode}
        onSortChange={setSortBy}
      />

      <Tabs value={activeTab} onValueChange={() => {}}>
        <TabsList>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            {t('tab_class_documents')}
            <Badge variant="secondary" className="text-xs">
              {filteredAndSortedDocuments.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6 mt-6">
          <DocumentsFilters
            searchQuery={searchQuery}
            parentTypeFilter={parentTypeFilter}
            onSearchChange={setSearchQuery}
            onFilterChange={setParentTypeFilter}
          />

          {isLoading && <EmptyState type="loading" />}

          {isError && <EmptyState type="error" onRetry={handleRetry} />}

          {!isLoading && !isError && filteredAndSortedDocuments.length === 0 && (
            <EmptyState type={searchQuery || parentTypeFilter !== 'all' ? 'no-results' : 'empty'} />
          )}

          {!isLoading && !isError && filteredAndSortedDocuments.length > 0 && (
            <>
              {viewMode === 'grid' ? (
                <DocumentGridView
                  documents={filteredAndSortedDocuments}
                  canDelete={canDeleteDocument}
                  onDelete={handleDeleteClick}
                  locale={locale}
                />
              ) : (
                <DocumentsTable
                  documents={filteredAndSortedDocuments}
                  canDelete={canDeleteDocument}
                  onDelete={handleDeleteClick}
                  locale={locale}
                />
              )}
            </>
          )}
        </TabsContent>

      </Tabs>

      <UploadDocumentModal
        open={isUploadModalOpen}
        onClose={closeUploadModal}
        classId={classIdNum}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        fileName={deleteTarget?.fileName || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </div>
  )
}