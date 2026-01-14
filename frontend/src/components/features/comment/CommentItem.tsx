/**
 * Hiển thị một comment 
 */
'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { MoreVertical, Pencil, Trash2, FileIcon, ExternalLink, Loader2, Paperclip, X, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDateFnsLocale } from '@/lib/i18nUtils'
import { useTranslations, useLocale } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import type { CommentResponse } from '@/types/comment'
import { CosmeticAvatar, CosmeticBadge, CosmeticChatBubble } from '@/components/features/cosmetics'
import {
  UserDetailModal,
  ClickableAvatarWrapper,
  useUserDetailModal,
  type UserBasicInfo,
  type UserClassContext,
} from '@/components/features/user'
import { RoleInClass } from '@/types/class'
import { isImageFile, validateFileSize } from '@/lib/fileUtils'
import { commentSchema, type CommentFormData } from '@/schemas/commentSchema'
import type { AttachmentResponse } from '@/types/document'
import { toast } from 'sonner'
import { parseBackendDateTime } from '@/lib/utils'

const MAX_FILE_SIZE_MB = 10

interface CommentItemProps {
  comment: CommentResponse
  onEdit?: () => void
  onDelete?: () => void
  className?: string
  actionSlot?: React.ReactNode
  classId?: number
  // Edit mode props
  isEditing?: boolean
  onCancelEdit?: () => void
  onSubmitEdit?: (data: CommentFormData, file?: File, removeAttachment?: boolean) => Promise<void>
  isSubmittingEdit?: boolean
}

export const CommentItem = ({
  comment,
  onEdit,
  onDelete,
  className,
  actionSlot,
  classId,
  isEditing = false,
  onCancelEdit,
  onSubmitEdit,
  isSubmittingEdit = false,
}: CommentItemProps) => {
  const t = useTranslations()
  const locale = useLocale()
  const dateFnsLocale = getDateFnsLocale(locale)
  const { isOpen: isUserModalOpen, selectedUser, classContext, openModal: openUserModal, setIsOpen: setUserModalOpen } = useUserDetailModal()
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Edit mode state
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [existingAttachment, setExistingAttachment] = React.useState<AttachmentResponse | null>(comment.document ?? null)
  const [removeExistingAttachment, setRemoveExistingAttachment] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: comment.content },
    mode: 'onChange',
  })

  const editContent = watch('content')

  // Reset edit state when entering/exiting edit mode
  React.useEffect(() => {
    if (isEditing) {
      reset({ content: comment.content })
      setExistingAttachment(comment.document ?? null)
      setRemoveExistingAttachment(false)
      setSelectedFile(null)
      setPreviewUrl(null)
    }
  }, [isEditing, comment.content, comment.document, reset])

  // Cleanup preview URL
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!validateFileSize(file, MAX_FILE_SIZE_MB)) {
      toast.error(t('file_size_limit_exceeded', { size: MAX_FILE_SIZE_MB }))
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(file)
    setExistingAttachment(null)
    setRemoveExistingAttachment(true)
    if (isImageFile(file)) {
      setPreviewUrl(URL.createObjectURL(file))
    } else {
      setPreviewUrl(null)
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(null)
    setPreviewUrl(null)
    if (comment.document) {
      setRemoveExistingAttachment(true)
      setExistingAttachment(null)
    }
  }

  const handleRemoveExistingAttachment = () => {
    setExistingAttachment(null)
    setRemoveExistingAttachment(true)
  }

  const handleEditSubmit = async (data: CommentFormData) => {
    if (onSubmitEdit) {
      await onSubmitEdit(data, selectedFile || undefined, removeExistingAttachment)
    }
  }

  const handleCancelEdit = () => {
    reset({ content: comment.content })
    setSelectedFile(null)
    setPreviewUrl(null)
    setExistingAttachment(comment.document ?? null)
    setRemoveExistingAttachment(false)
    onCancelEdit?.()
  }

  const hasAttachment = Boolean(selectedFile) || Boolean(existingAttachment && !removeExistingAttachment)

  // Approximate character count for 5 lines of text in UI
  const COMMENT_CLAMP_THRESHOLD = 120
  const [expanded, setExpanded] = React.useState(false)
  const shouldClamp = !expanded
  // Only show "Show more" if content exceeds threshold
  const canToggle = comment.content.length > COMMENT_CLAMP_THRESHOLD

  const member = comment.createdBy

  const handleAvatarClick = () => {
    const userBasicInfo: UserBasicInfo = {
      id: member.userId,
      displayName: member.userName,
      email: member.userEmail,
      avatarUrl: member.avatarUrl,
    }
    const userClassContext: UserClassContext | null = classId ? {
      classId,
      classMemberId: member.id,
      roleInClass: member.roleInClassValue as RoleInClass,
      roleInClassLabel: member.roleInClass,
      points: member.points ?? 0,
      enrollDate: member.enrollDate,
      cosmetics: member.cosmetics,
    } : null
    openUserModal(userBasicInfo, userClassContext)
  }

  return (
    <div className={cn('group flex items-start gap-3', className)}>
      <ClickableAvatarWrapper onClick={handleAvatarClick}>
        <CosmeticAvatar
          classId={classId}
          classMemberId={member.id}
          avatarUrl={member.avatarUrl}
          displayName={member.userName}
          cosmetics={member.cosmetics ?? null}
          size="sm"
          className="mt-0.5"
        />
      </ClickableAvatarWrapper>

      <div className="flex-1 min-w-0">
        <CosmeticChatBubble
          classId={classId}
          classMemberId={member.id}
          cosmetics={member.cosmetics ?? null}
          header={
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm">
                  {member.userName}
                </span>
                <CosmeticBadge
                  classId={classId}
                  classMemberId={member.id}
                  cosmetics={member.cosmetics ?? null}
                  fallbackLabel={member.roleInClass}
                  size="sm"
                  showWhenDisabled
                />
              </div>
              <div className="flex items-center gap-1">
                {actionSlot}
                {(onEdit || onDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                        <span className="sr-only">{t('comment_actions')}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEdit && (
                        <DropdownMenuItem 
                          onClick={onEdit}
                          className="cursor-pointer hover:bg-foreground hover:text-background transition-colors"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          {t('comment_edit')}
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={onDelete} 
                          className="cursor-pointer text-destructive hover:bg-destructive/10 focus:text-destructive focus:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('comment_delete')}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          }
          footer={
            <div className="flex items-center gap-2">
              <span className="text-xs">
                {formatDistanceToNow(
                  parseBackendDateTime(comment.createdAt) ?? new Date(),
                  { addSuffix: true, locale: dateFnsLocale }
                )}
              </span>
              {comment.updatedAt && (
                <span className="text-xs">
                  &bull; {t('comment_edited')}
                </span>
              )}
            </div>
          }
          className="px-3 py-2"
        >
          {isEditing ? (
            // Edit mode - show form inside bubble
            <form onSubmit={handleSubmit(handleEditSubmit)} className="space-y-2">
              <Textarea
                {...register('content')}
                className={cn(
                  'min-h-16 resize-none text-sm',
                  errors.content && 'border-destructive'
                )}
                disabled={isSubmittingEdit}
                autoFocus
              />
              
              {/* File Preview - New file */}
              {selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-md">
                  {previewUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={previewUrl} alt="Preview" className="h-8 w-8 object-cover rounded" />
                  ) : (
                    <FileIcon className="h-8 w-8 p-1.5 bg-background rounded" />
                  )}
                  <span className="text-xs truncate flex-1">{selectedFile.name}</span>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={handleRemoveFile} disabled={isSubmittingEdit}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {/* File Preview - Existing attachment */}
              {existingAttachment && !removeExistingAttachment && !selectedFile && (
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded-md">
                  {existingAttachment.publicUrl && isImageFile({ name: existingAttachment.fileName }) ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={existingAttachment.publicUrl} alt="Attachment" className="h-8 w-8 object-cover rounded" />
                  ) : (
                    <FileIcon className="h-8 w-8 p-1.5 bg-background rounded" />
                  )}
                  <span className="text-xs truncate flex-1">{existingAttachment.fileName}</span>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={handleRemoveExistingAttachment} disabled={isSubmittingEdit}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    disabled={isSubmittingEdit}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmittingEdit || hasAttachment}
                    className="gap-1 text-xs h-7"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit} disabled={isSubmittingEdit} className="h-7 text-xs">
                    {t('cancel')}
                  </Button>
                  <Button type="submit" size="sm" disabled={isSubmittingEdit || !isValid || !editContent?.trim()} className="h-7 text-xs gap-1">
                    {isSubmittingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    {t('comment_update')}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            // View mode - show content
            <>
              <p
                className={cn(
                  'text-sm whitespace-pre-line break-words',
                  shouldClamp && 'line-clamp-5',
                  canToggle && 'cursor-pointer'
                )}
                onClick={() => {
                  if (canToggle) setExpanded(!expanded)
                }}
                aria-expanded={expanded}
              >
                {comment.content}
              </p>
              {canToggle && !expanded && (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  className="text-xs text-primary-600 hover:underline mt-1"
                >
                  {t('comment_show_more')}
                </button>
              )}
              
              {/* Attachment Preview */}
              {comment.document && (
                <div className="mt-2">
                  {comment.document.publicUrl && isImageFile({ name: comment.document.fileName }) ? (
                    <a 
                      href={comment.document.publicUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={comment.document.publicUrl} 
                        alt={comment.document.fileName}
                        className="max-w-full max-h-48 rounded-md object-contain border border-border hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ) : (
                    <a
                      href={comment.document.publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-muted rounded-md hover:bg-muted/80 transition-colors text-sm"
                    >
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-[200px]">{comment.document.fileName}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </CosmeticChatBubble>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          classContext={classContext}
          open={isUserModalOpen}
          onOpenChange={setUserModalOpen}
        />
      )}
    </div>
  )
}
