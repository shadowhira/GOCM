import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Upload, X, FileText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
// No parent type selection; uploads are generic for class documents
import { toast } from 'sonner'
import { useUploadDocument } from '@/queries/documentQueries'

interface UploadDocumentModalProps {
  open: boolean
  onClose: () => void
  classId: number
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const UploadDocumentModal = ({ open, onClose, classId }: UploadDocumentModalProps) => {
  const t = useTranslations()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const { mutate: uploadDocument, isPending } = useUploadDocument()

  const handleFileSelect = useCallback((file: File) => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('file_too_large'))
      return
    }

    setSelectedFile(file)
  }, [t])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [handleFileSelect])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
  }

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error(t('please_upload_file'))
      return
    }

    uploadDocument(
      {
        file: selectedFile,
        classId,
      },
      {
        onSuccess: () => {
          toast.success(t('upload_success_document'))
          setSelectedFile(null)
          onClose()
        },
        onError: (error: Error) => {
          const axiosError = error as { response?: { data?: { message?: string } } }
          const errorMessage = axiosError?.response?.data?.message || t('upload_failed_document')
          toast.error(errorMessage)
        },
      }
    )
  }

  const handleClose = () => {
    if (!isPending) {
      setSelectedFile(null)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg w-[calc(100vw-2rem)] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>{t('upload_document_modal_title')}</DialogTitle>
          <DialogDescription>{t('documents_description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Drop Zone */}
          <div className="w-full">
            <Label>{t('upload_file')}</Label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                mt-2 border-2 border-dashed rounded-lg p-4 cursor-pointer
                transition-colors overflow-hidden
                ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-neutral-300 hover:border-primary-400'}
              `}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                className="hidden"
                onChange={handleFileInputChange}
                disabled={isPending}
              />
              
              {selectedFile ? (
                <div className="flex items-center gap-3 w-full min-w-0">
                  <FileText className="h-6 w-6 text-primary-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="font-medium text-sm truncate" title={selectedFile.name}>
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveFile()
                    }}
                    disabled={isPending}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{t('drag_drop_file')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Parent Type is fixed to POST for manual uploads (selector removed) */}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            {t('cancel')}
          </Button>
          <Button onClick={handleUpload} disabled={!selectedFile || isPending}>
            {isPending ? t('uploading') : t('upload_new_document')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
