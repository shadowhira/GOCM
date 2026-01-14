/**
 * Danh sách comments với infinite scroll
 */
'use client'

import React from 'react'
import { CommentItem } from './CommentItem'
import { ReplyThread } from './ReplyThread'
import { Loader2, AlertCircle, Gift } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'
import { useCurrentUser } from '@/store/auth'
import { useGetInfiniteCommentList, useDeleteComment } from '@/queries/commentQueries'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useInView } from 'react-intersection-observer'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { GrantRewardDialog } from '@/components/features/class/modules/ClassPosts/reward'
import { useGrantCommentReward } from '@/queries/rewardQueries'
import type { GrantRewardRequest } from '@/types/reward'
import { RoleInClass } from '@/types/class'
import { useHydrateCosmeticsFromMembers } from '@/store'
import type { CommentResponse } from '@/types/comment'
import type { CommentFormData } from '@/schemas/commentSchema'

interface CommentListProps {
  postId: number
  pageSize?: number
  editingCommentId: number | null
  onEditComment?: (commentId: number) => void
  onCancelEdit?: () => void
  onUpdateComment?: (data: CommentFormData, file?: File, removeAttachment?: boolean) => Promise<void>
  isUpdating?: boolean
  classId?: number
  currentMemberRole?: RoleInClass
  classMemberId?: number
}

export const CommentList = ({
  postId,
  pageSize = 20,
  editingCommentId,
  onEditComment,
  onCancelEdit,
  onUpdateComment,
  isUpdating = false,
  classId,
  currentMemberRole,
  classMemberId,
}: CommentListProps) => {
  const t = useTranslations()
  const currentUser = useCurrentUser()
  const [deleteCommentId, setDeleteCommentId] = React.useState<number | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  const [rewardingCommentId, setRewardingCommentId] = React.useState<number | null>(null)

  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetInfiniteCommentList({
    pageSize,
    postId,
  })

  const deleteCommentMutation = useDeleteComment()
  const grantCommentRewardMutation = useGrantCommentReward()
  const canGrantReward = Boolean(classId && currentMemberRole === RoleInClass.TEACHER)
  const hydrateCosmetics = useHydrateCosmeticsFromMembers()

  // Infinite scroll: observer để tự động load comments tiếp theo
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
    rootMargin: '200px', // Load sớm 200px
  })

  // Auto fetch: gọi API khi user cuộn gần cuối list
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Flatten: biến pages array thành single array để render
  const allComments = React.useMemo(() => {
    return data?.pages.flatMap(page => page.items) || []
  }, [data])

  const commentAuthors = React.useMemo(() => {
    if (!classId || allComments.length === 0) {
      return []
    }

    const unique = new Map<number, CommentResponse['createdBy']>()
    allComments.forEach((comment) => {
      unique.set(comment.createdBy.id, comment.createdBy)
    })

    return Array.from(unique.values())
  }, [allComments, classId])

  React.useEffect(() => {
    if (!classId || commentAuthors.length === 0) {
      return
    }

    hydrateCosmetics(classId, commentAuthors)
  }, [classId, commentAuthors, hydrateCosmetics])

  const totalItems = data?.pages[0]?.totalItems || 0

  function openDeleteDialog(commentId: number) {
    setDeleteCommentId(commentId)
    setIsDeleteOpen(true)
  }

  async function confirmDeleteComment() {
    if (!deleteCommentId) return
    try {
      await deleteCommentMutation.mutateAsync(deleteCommentId)
      toast.success(t('comment_deleted_success'))
      setIsDeleteOpen(false)
      setDeleteCommentId(null)
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('comment_delete_failed'), t))
    }
  }

  const handleGrantCommentReward = React.useCallback(async (
    commentId: number,
    payload: GrantRewardRequest,
    memberName: string,
  ) => {
    if (!classId) {
      toast.error(t('reward_missing_class'))
      throw new Error('missing class id')
    }

    setRewardingCommentId(commentId)

    try {
      await grantCommentRewardMutation.mutateAsync({
        classId,
        commentId,
        data: payload,
      })
      toast.success(t('reward_comment_success', { name: memberName }))
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('reward_comment_failed'), t))
      throw error
    } finally {
      setRewardingCommentId((current) => (current === commentId ? null : current))
    }
  }, [classId, grantCommentRewardMutation, t])

  const renderRewardAction = React.useCallback((comment: CommentResponse) => {
    if (!canGrantReward || !classId) {
      return undefined
    }

    return (
      <GrantRewardDialog
        context="comment"
        recipientName={comment.createdBy.userName}
        triggerIcon={<Gift className="h-3.5 w-3.5" />}
        triggerVariant="ghost"
        triggerSize="sm"
        onSubmit={(payload) => handleGrantCommentReward(comment.id, payload, comment.createdBy.userName)}
        isSubmitting={grantCommentRewardMutation.isPending && rewardingCommentId === comment.id}
      />
    )
  }, [canGrantReward, classId, grantCommentRewardMutation.isPending, handleGrantCommentReward, rewardingCommentId])

  // Loading state
  if (isLoading) {
    return (
      <div className="py-8 space-y-4">
        {/* Skeleton for comment header */}
        <Skeleton className="h-4 w-32 mb-4" />
        {/* Skeleton for comment items */}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="ml-2">
          {t('failed_to_load_comments')}
          <Button
            variant="link"
            size="sm"
            onClick={() => refetch()}
            className="ml-2 h-auto p-0"
          >
            {t('try_again')}
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  // Empty state
  if (allComments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        {t('no_comments_yet')}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="text-sm font-medium text-muted-foreground">
          {t('comments_count', { count: totalItems })}
        </div>

        {/* Comment List */}
        <div className="space-y-3">
          {allComments.map((comment) => {
            const isOwner = currentUser && comment.createdBy.userId === currentUser.id
            const isTeacher = currentMemberRole === RoleInClass.TEACHER
            const rewardAction = renderRewardAction(comment)
            const isEditing = editingCommentId === comment.id
            const canEdit = isOwner && onEditComment && !isEditing
            const canDelete = (isOwner || isTeacher) && !isEditing
            
            return (
              <div key={comment.id} className="space-y-2">
                <CommentItem
                  comment={comment}
                  onEdit={canEdit ? () => onEditComment(comment.id) : undefined}
                  onDelete={canDelete ? () => openDeleteDialog(comment.id) : undefined}
                  actionSlot={!isEditing ? rewardAction : undefined}
                  classId={classId}
                  isEditing={isEditing}
                  onCancelEdit={onCancelEdit}
                  onSubmitEdit={onUpdateComment}
                  isSubmittingEdit={isUpdating}
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
                    isUpdatingComment={isUpdating}
                    onDeleteComment={openDeleteDialog}
                    buildRewardAction={renderRewardAction}
                  />
                )}
              </div>
            )
          })}
          
          {/* Vùng trigger cho infinite scroll */}
          <div ref={ref} className="flex justify-center py-4">
            {isFetchingNextPage && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">{t('loading_more_comments')}</span>
              </div>
            )}
            {/* {!hasNextPage && allComments.length > 0 && !isFetchingNextPage && (
              <p className="text-xs text-muted-foreground">{t('no_more_comments')}</p>
            )} */}
          </div>
        </div>
      </div>

      {/* Delete Comment Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirm_delete_comment')}</DialogTitle>
            <DialogDescription>
              {t('confirm_delete_comment_description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deleteCommentMutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteComment}
              disabled={deleteCommentMutation.isPending}
            >
              {deleteCommentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
  }
