/**
 * Composite component tích hợp form + list
 */
'use client'

import React from 'react'
import { CommentList } from './CommentList'
import { CommentForm } from './CommentForm'
import { useTranslations } from 'next-intl'
import { useCreateComment, useUpdateComment } from '@/queries/commentQueries'
import { toast } from 'sonner'
import type { CommentFormData } from '@/schemas/commentSchema'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'
import { getApiErrorMessage } from '@/lib/api-error'
import type { RoleInClass } from '@/types/class'
import { documentApi } from '@/api/documentApi'
import { ParentType } from '@/types/constants'

interface CommentSectionProps {
  postId: number
  classMemberId?: number
  showForm?: boolean
  classId?: number
  currentMemberRole?: RoleInClass
}

export const CommentSection = ({
  postId,
  classMemberId,
  showForm = true,
  classId,
  currentMemberRole,
}: CommentSectionProps) => {
  const t = useTranslations()
  
  // Edit mode: lưu ID của comment đang edit, null = create mode
  const [editingCommentId, setEditingCommentId] = React.useState<number | null>(null)
  
  const createCommentMutation = useCreateComment()
  const updateCommentMutation = useUpdateComment()

  // Upload file helper
  const uploadFile = async (file: File): Promise<number | undefined> => {
    if (!classId) return undefined
    
    try {
      const response = await documentApi.upload({
        file,
        classId,
        parentType: ParentType.COMMENT,
      })
      return response.id
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('file_upload_failed'), t))
      throw error
    }
  }

  // Handle create comment
  const handleCreateComment = async (data: CommentFormData, file?: File) => {
    if (!classMemberId) {
      toast.error(t('class_member_id_required'))
      return
    }

    try {
      let documentId: number | undefined
      
      // Upload file first if provided
      if (file && classId) {
        documentId = await uploadFile(file)
      }

      await createCommentMutation.mutateAsync({
        postId,
        content: data.content,
        createdByClassMemberId: classMemberId,
        documentId,
      })
      toast.success(t('comment_created_success'))
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('comment_create_failed'), t))
    }
  }

  // Handle update comment
  const handleUpdateComment = async (data: CommentFormData, file?: File, removeAttachment?: boolean) => {
    if (!editingCommentId) return

    try {
      let documentId: number | undefined | null = undefined // undefined = no change
      
      // Upload new file if provided
      if (file && classId) {
        documentId = await uploadFile(file)
      } else if (removeAttachment) {
        // Mark for removal by setting to 0
        documentId = 0
      }

      await updateCommentMutation.mutateAsync({
        id: editingCommentId,
        content: data.content,
        documentId,
      })
      toast.success(t('comment_updated_success'))
      setEditingCommentId(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('comment_update_failed'), t))
    }
  }

  // Handle edit comment
  const handleEditComment = (commentId: number) => {
    setEditingCommentId(commentId)
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingCommentId(null)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-lg">{t('comments_title')}</h3>
          </div>

          {/* Create Comment Form - hidden when editing */}
          {showForm && classMemberId && !editingCommentId && (
            <CommentForm
              mode="create"
              onSubmit={handleCreateComment}
              isSubmitting={createCommentMutation.isPending}
            />
          )}

          {/* Comment List with inline edit form */}
          <CommentList
            postId={postId}
            editingCommentId={editingCommentId}
            onEditComment={classMemberId ? handleEditComment : undefined}
            onCancelEdit={handleCancelEdit}
            onUpdateComment={handleUpdateComment}
            isUpdating={updateCommentMutation.isPending}
            classId={classId}
            currentMemberRole={currentMemberRole}
            classMemberId={classMemberId}
          />
        </div>
      </CardContent>
    </Card>
  )
}

