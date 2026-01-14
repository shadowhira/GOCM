/**
 * Modal hiển thị full nội dung post + comments
 */
'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { AttachmentList } from '@/components/ui/attachment-list'
import { Gift, MoreVertical, Pencil, Trash2, X } from 'lucide-react'
import { getDateFnsLocale } from '@/lib/i18nUtils'
import { useTranslations, useLocale } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import type { PostResponse } from '@/types/post'
import { CommentSection } from '@/components/features/comment'
import { GrantRewardDialog } from '../reward'
import { useGrantPostReward } from '@/queries/rewardQueries'
import type { GrantRewardRequest } from '@/types/reward'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { RoleInClass } from '@/types/class'
import { CosmeticAvatar, CosmeticBadge } from '@/components/features/cosmetics'
import { parseBackendDateTime } from '@/lib/utils'

interface PostDetailModalProps {
  post: PostResponse
  open: boolean
  onClose: () => void
  classMemberId?: number
  classId?: number
  currentMemberRole?: RoleInClass
  onEdit?: () => void
  onDelete?: () => void
}

export const PostDetailModal = ({
  post,
  open,
  onClose,
  classMemberId,
  classId,
  currentMemberRole,
  onEdit,
  onDelete,
}: PostDetailModalProps) => {
  const t = useTranslations()
  const locale = useLocale()
  const dateFnsLocale = getDateFnsLocale(locale)
  const grantPostRewardMutation = useGrantPostReward()
  const canGrantReward = Boolean(classId && currentMemberRole === RoleInClass.TEACHER)

  const handleGrantPostReward = async (request: GrantRewardRequest) => {
    if (!classId) {
      toast.error(t('reward_missing_class'))
      throw new Error('missing class id')
    }

    try {
      await grantPostRewardMutation.mutateAsync({
        classId,
        postId: post.id,
        data: request,
      })
      toast.success(t('reward_post_success', { name: post.createdBy.userName }))
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('reward_post_failed'), t))
      throw error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        // eslint-disable-next-line design-system/use-design-tokens
        className="max-w-modal-lg h-[90vh] p-0 gap-0 flex flex-col overflow-hidden !rounded-xl [&>button]:hidden"
        aria-describedby="post-detail-description"
      >
        <DialogTitle className="sr-only">
          {post.title || t('comments_title')}
        </DialogTitle>
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-background flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CosmeticAvatar
                classId={classId}
                classMemberId={post.createdBy.id}
                avatarUrl={post.createdBy.avatarUrl}
                displayName={post.createdBy.userName}
                size="md"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-base">{post.createdBy.userName}</p>
                  <CosmeticBadge
                    classId={classId}
                    classMemberId={post.createdBy.id}
                    fallbackLabel={post.createdBy.roleInClass}
                    showWhenDisabled
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(
                    parseBackendDateTime(post.createdAt) ?? new Date(),
                    { addSuffix: true, locale: dateFnsLocale }
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canGrantReward && (
                <GrantRewardDialog
                  context="post"
                  recipientName={post.createdBy.userName}
                  triggerIcon={<Gift className="h-4 w-4" />}
                  onSubmit={handleGrantPostReward}
                  isSubmitting={grantPostRewardMutation.isPending}
                />
              )}
              {(onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">{t('post_actions')}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={onEdit}>
                        <Pencil className="mr-2 h-4 w-4" />
                        {t('post_edit')}
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('post_delete')}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button variant="ghost" size="icon-sm" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
                <span className="sr-only">{t('close')}</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content with scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            {/* Post Content */}
            <div className="space-y-4">
              {post.title && (
                <h2 className="text-2xl font-bold text-foreground">{post.title}</h2>
              )}
              <div className="prose prose-sm max-w-none text-foreground dark:prose-invert whitespace-pre-line">
                {post.content}
              </div>

              {/* Attachments */}
              {post.documents && post.documents.length > 0 && (
                <div className="pt-4">
                  <AttachmentList attachments={post.documents} variant="preview" />
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Comment Section */}
            <div id="post-detail-description">
              <CommentSection
                postId={post.id}
                classMemberId={classMemberId}
                classId={classId}
                currentMemberRole={currentMemberRole}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
