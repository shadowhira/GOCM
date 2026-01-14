/**
 * Form tái sử dụng cho create và edit comment
 * Hỗ trợ đính kèm 1 file (ảnh hoặc tài liệu)
 */
'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { Loader2, Send, Paperclip, X, FileIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { commentSchema, type CommentFormData } from '@/schemas/commentSchema'
import { cn } from '@/lib/utils'
import { isImageFile, validateFileSize, formatFileSize } from '@/lib/fileUtils'
import { toast } from 'sonner'
import type { AttachmentResponse } from '@/types/document'

const MAX_FILE_SIZE_MB = 10 // 10MB limit

interface CommentFormProps {
  onSubmit: (data: CommentFormData, file?: File, removeAttachment?: boolean) => Promise<void> | void
  onCancel?: () => void
  defaultValue?: string
  defaultAttachment?: AttachmentResponse | null
  placeholder?: string
  submitLabel?: string
  isSubmitting?: boolean
  className?: string
  mode?: 'create' | 'edit'
}

export const CommentForm = ({
  onSubmit,
  onCancel,
  defaultValue = '',
  defaultAttachment = null,
  placeholder,
  submitLabel,
  isSubmitting = false,
  className,
  mode = 'create',
}: CommentFormProps) => {
  const t = useTranslations()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // File state
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [existingAttachment, setExistingAttachment] = React.useState<AttachmentResponse | null>(defaultAttachment)
  const [removeExistingAttachment, setRemoveExistingAttachment] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: defaultValue },
    mode: 'onChange',
  })

  const content = watch('content')

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size
    if (!validateFileSize(file, MAX_FILE_SIZE_MB)) {
      toast.error(t('file_size_limit_exceeded', { size: MAX_FILE_SIZE_MB }))
      return
    }

    // Clear previous preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(file)
    setExistingAttachment(null)
    setRemoveExistingAttachment(true)

    // Generate preview for images
    if (isImageFile(file)) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    
    // If editing and had existing attachment, mark for removal
    if (mode === 'edit' && defaultAttachment) {
      setRemoveExistingAttachment(true)
      setExistingAttachment(null)
    }
  }

  const handleRemoveExistingAttachment = () => {
    setExistingAttachment(null)
    setRemoveExistingAttachment(true)
  }

  const handleFormSubmit = async (data: CommentFormData) => {
    await onSubmit(data, selectedFile || undefined, removeExistingAttachment)
    if (mode === 'create') {
      reset()
      handleRemoveFile()
    }
  }

  const handleCancel = () => {
    reset()
    handleRemoveFile()
    setExistingAttachment(defaultAttachment)
    setRemoveExistingAttachment(false)
    onCancel?.()
  }

  const hasAttachment = Boolean(selectedFile) || Boolean(existingAttachment && !removeExistingAttachment)

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className={cn('space-y-2', className)}>
      <div className="relative">
        <Textarea
          {...register('content')}
          placeholder={placeholder || t('comment_placeholder')}
          className={cn(
            'min-h-20 resize-none pr-12',
            errors.content && 'border-destructive focus-visible:ring-destructive'
          )}
          disabled={isSubmitting}
        />
        {errors.content && (
          <p className="text-xs text-destructive mt-1">
            {t(errors.content.message || 'comment_content_required')}
          </p>
        )}
      </div>

      {/* File Preview */}
      {selectedFile && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          {previewUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={previewUrl} alt="Preview" className="h-10 w-10 object-cover rounded" />
          ) : (
            <FileIcon className="h-10 w-10 p-2 bg-background rounded" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleRemoveFile}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Existing Attachment Preview (Edit mode) */}
      {existingAttachment && !removeExistingAttachment && !selectedFile && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          {existingAttachment.publicUrl && isImageFile({ name: existingAttachment.fileName }) ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={existingAttachment.publicUrl} alt="Attachment" className="h-10 w-10 object-cover rounded" />
          ) : (
            <FileIcon className="h-10 w-10 p-2 bg-background rounded" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{existingAttachment.fileName}</p>
            <p className="text-xs text-muted-foreground">{t('existing_attachment')}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleRemoveExistingAttachment}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        {/* Attach file button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            disabled={isSubmitting}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting || hasAttachment}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="h-4 w-4" />
            {t('attach_file')}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'edit' && onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || !isValid || !content?.trim()}
            className="gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('comment_submitting')}
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {submitLabel || (mode === 'edit' ? t('comment_update') : t('comment_submit'))}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
