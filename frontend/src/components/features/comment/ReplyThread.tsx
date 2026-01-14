/**
 * Quản lý hiển thị và nhập reply cho một bình luận
 */
'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useInView } from 'react-intersection-observer'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { CommentItem } from './CommentItem'
import { CommentForm } from './CommentForm'
import { useCreateComment, useGetInfiniteCommentReplies } from '@/queries/commentQueries'
import { getApiErrorMessage } from '@/lib/api-error'
import { useCurrentUser } from '@/store/auth'
import { useHydrateCosmeticsFromMembers } from '@/store'
import { documentApi } from '@/api/documentApi'
import type { CommentFormData } from '@/schemas/commentSchema'
import type { CommentResponse } from '@/types/comment'
import { ParentType } from '@/types/constants'

type RewardActionBuilder = (comment: CommentResponse) => React.ReactNode | undefined

interface ReplyThreadProps {
  parentComment: CommentResponse
  postId: number
  classMemberId?: number
  classId?: number
  editingCommentId?: number | null
  onEditComment?: (commentId: number) => void
  onCancelEdit?: () => void
  onUpdateComment?: (data: CommentFormData, file?: File, removeAttachment?: boolean) => Promise<void>
  isUpdatingComment?: boolean
  onDeleteComment?: (commentId: number) => void
  buildRewardAction?: RewardActionBuilder
}

export const ReplyThread = ({
  parentComment,
  postId,
  classMemberId,
  classId,
  editingCommentId,
  onEditComment,
  onCancelEdit,
  onUpdateComment,
  isUpdatingComment = false,
  onDeleteComment,
  buildRewardAction,
}: ReplyThreadProps) => {
  const t = useTranslations()
  const currentUser = useCurrentUser()
  const hydrateCosmetics = useHydrateCosmeticsFromMembers()

  const [isExpanded, setIsExpanded] = React.useState(false)
  const [showReplyForm, setShowReplyForm] = React.useState(false)

  const { ref, inView } = useInView({ rootMargin: '200px' })

  const {
    data: repliesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useGetInfiniteCommentReplies(
    { postId, parentCommentId: parentComment.id, pageSize: 10 },
    { enabled: isExpanded }
  )

  React.useEffect(() => {
    if (!isExpanded) return
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, inView, isExpanded, isFetchingNextPage])

  const createCommentMutation = useCreateComment()

  const allLoadedReplies = React.useMemo(() => {
    if (!repliesData) return [] as CommentResponse[]
    return repliesData.pages.flatMap((page) => page.items)
  }, [repliesData])

  const replyAuthors = React.useMemo(() => {
    const authors = new Map<number, CommentResponse['createdBy']>()
    allLoadedReplies.forEach((reply) => authors.set(reply.createdBy.id, reply.createdBy))
    return Array.from(authors.values())
  }, [allLoadedReplies])

  React.useEffect(() => {
    if (!classId || replyAuthors.length === 0) return
    hydrateCosmetics(classId, replyAuthors)
  }, [classId, replyAuthors, hydrateCosmetics])

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

  const handleCreateReply = async (data: CommentFormData, file?: File) => {
    if (!classMemberId) return
    try {
      let documentId: number | undefined
      
      // Upload file first if provided
      if (file && classId) {
        documentId = await uploadFile(file)
      }

      await createCommentMutation.mutateAsync({
        postId,
        content: data.content,
        parentCommentId: parentComment.id,
        createdByClassMemberId: classMemberId,
        documentId,
      })
      toast.success(t('comment_created_success'))
      setShowReplyForm(false)
      setIsExpanded(true)
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('comment_create_failed'), t))
      throw error
    }
  }

  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev)
  }

  const toggleReplyForm = () => {
    if (!classMemberId) return
    setShowReplyForm((prev) => !prev)
    setIsExpanded(true)
  }

  const renderReplyItem = (comment: CommentResponse) => {
    const isOwner = currentUser && comment.createdBy.userId === currentUser.id
    const rewardAction = buildRewardAction?.(comment)
    const isEditing = editingCommentId === comment.id
    
    return (
      <div key={comment.id} className="space-y-2">
        <CommentItem
          comment={comment}
          onEdit={isOwner && onEditComment && !isEditing ? () => onEditComment(comment.id) : undefined}
          onDelete={isOwner && onDeleteComment && !isEditing ? () => onDeleteComment(comment.id) : undefined}
          actionSlot={!isEditing ? rewardAction : undefined}
          classId={classId}
          isEditing={isEditing}
          onCancelEdit={onCancelEdit}
          onSubmitEdit={onUpdateComment}
          isSubmittingEdit={isUpdatingComment}
        />

        {(comment.replyCount > 0 || classMemberId) && (
          <ReplyThread
            parentComment={comment}
            postId={postId}
            classMemberId={classMemberId}
            classId={classId}
            editingCommentId={editingCommentId}
            onEditComment={onEditComment}
            onCancelEdit={onCancelEdit}
            onUpdateComment={onUpdateComment}
            isUpdatingComment={isUpdatingComment}
            onDeleteComment={onDeleteComment}
            buildRewardAction={buildRewardAction}
          />
        )}
      </div>
    )
  }

  if (parentComment.replyCount === 0 && !classMemberId) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="pl-12 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {classMemberId && (
          <button
            type="button"
            onClick={toggleReplyForm}
            className="font-medium text-primary hover:underline"
          >
            {showReplyForm ? t('comment_cancel_reply') : t('comment_reply_action')}
          </button>
        )}
        {parentComment.replyCount > 0 && (
          <button
            type="button"
            onClick={toggleExpanded}
            className="font-medium hover:underline"
          >
            {isExpanded
              ? t('comment_hide_replies')
              : t('comment_show_replies', { count: parentComment.replyCount })}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="ml-12 border-l pl-4 space-y-3">
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('comment_replies_loading')}
            </div>
          )}
          {error && (
            <p className="text-xs text-destructive">{t('comment_replies_error')}</p>
          )}
          {allLoadedReplies.map(renderReplyItem)}
          <div ref={ref} className="flex justify-center py-2">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">{t('loading_more_comments')}</span>
              </div>
            )}
            {/* {!hasNextPage && allLoadedReplies.length > 0 && (
              <p className="text-xs text-muted-foreground">{t('no_more_comments')}</p>
            )} */}
          </div>
        </div>
      )}

      {showReplyForm && classMemberId && (
        <div className="pl-12">
          <CommentForm
            mode="create"
            onSubmit={handleCreateReply}
            isSubmitting={createCommentMutation.isPending}
            placeholder={t('comment_placeholder')}
          />
        </div>
      )}
    </div>
  )
}
