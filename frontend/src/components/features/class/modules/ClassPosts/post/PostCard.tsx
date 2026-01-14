/**
 * Hiển thị preview của một bài đăng
 */
"use client"

import * as React from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { AttachmentList } from "@/components/ui/attachment-list"
import { MoreVertical, Pencil, Trash2, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { getDateFnsLocale } from "@/lib/i18nUtils"
import { useTranslations, useLocale } from "next-intl"
import { formatDistanceToNow } from "date-fns"
import type { PostResponse } from "@/types/post"
import { PostDetailModal } from "./PostDetailModal"
import { RoleInClass } from "@/types/class"
import { CosmeticAvatar, CosmeticBadge } from "@/components/features/cosmetics"
import {
  UserDetailModal,
  ClickableAvatarWrapper,
  useUserDetailModal,
  type UserBasicInfo,
  type UserClassContext,
} from "@/components/features/user"
import { parseBackendDateTime } from "@/lib/utils"

interface PostCardProps {
  post: PostResponse
  classMemberId?: number
  classId?: number
  currentMemberRole?: RoleInClass
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  classMemberId,
  classId,
  currentMemberRole,
  onEdit,
  onDelete,
  className,
}) => {
  const t = useTranslations()
  const locale = useLocale()
  const dateFnsLocale = getDateFnsLocale(locale)
  const [showModal, setShowModal] = React.useState(false)
  const { isOpen: isUserModalOpen, selectedUser, classContext, openModal: openUserModal, setIsOpen: setUserModalOpen } = useUserDetailModal()
  
  // Lấy comment count trực tiếp từ PostResponse
  const commentCount = post.commentCount ?? 0

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const member = post.createdBy
    const userBasicInfo: UserBasicInfo = {
      id: member.userId,
      displayName: member.userName,
      email: member.userEmail,
      avatarUrl: member.avatarUrl,
    }
    const userClassContext: UserClassContext = {
      classId: classId!,
      classMemberId: member.id,
      roleInClass: member.roleInClassValue,
      roleInClassLabel: member.roleInClass,
      points: member.points ?? 0,
      enrollDate: member.enrollDate,
      cosmetics: member.cosmetics,
    }
    openUserModal(userBasicInfo, classId ? userClassContext : null)
  }

  // Hash routing: cho phép share link trực tiếp tới post (e.g., #post-123)
  const openModal = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      window.location.hash = `post-${post.id}`
    }
    setShowModal(true)
  }, [post.id])

  const closeModal = React.useCallback(() => {
    if (typeof window !== 'undefined' && window.location.hash === `#post-${post.id}`) {
      const url = `${window.location.pathname}${window.location.search}`
      window.history.replaceState(null, '', url)
    }
    setShowModal(false)
  }, [post.id])

  // Sync modal state từ URL hash
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const syncFromHash = () => {
      const hash = window.location.hash
      if (hash === `#post-${post.id}`) {
        setShowModal(true)
      } else if (showModal && !hash.startsWith('#post-')) {
        setShowModal(false)
      }
    }

    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [post.id, showModal])

  return (
    <>
      <Card
        className={cn(
          "relative group border bg-card text-card-foreground rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-0 cursor-pointer",
          "dark:bg-muted/60 dark:border-border",
          className
        )}
        onClick={openModal}
      >
        <CardHeader className="flex flex-row items-start gap-4 p-6 mb-[-20]">
          <ClickableAvatarWrapper onClick={handleAvatarClick}>
            <CosmeticAvatar
              classId={classId}
              classMemberId={post.createdBy.id}
              avatarUrl={post.createdBy.avatarUrl}
              displayName={post.createdBy.userName}
              size="lg"
            />
          </ClickableAvatarWrapper>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-base text-foreground truncate">
                {post.createdBy.userName}
              </span>
              <CosmeticBadge
                classId={classId}
                classMemberId={post.createdBy.id}
                fallbackLabel={post.createdBy.roleInClass}
                size="sm"
                showWhenDisabled
              />
              <span className="text-xs text-muted-foreground">
                &bull; {formatDistanceToNow(
                  parseBackendDateTime(post.createdAt) ?? new Date(),
                  { addSuffix: true, locale: dateFnsLocale }
                )}
              </span>
            </div>
          </div>
          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon-sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">{t("post_actions")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t("post_edit")}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("post_delete")}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          {post.title && (
            <div className="font-semibold text-lg mb-1 text-foreground line-clamp-2">{post.title}</div>
          )}
          <div className="prose prose-sm max-w-none text-foreground dark:prose-invert break-words whitespace-pre-line line-clamp-7">
            {post.content}
          </div>

          {/* Attachments */}
          {post.documents && post.documents.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <AttachmentList attachments={post.documents} variant="preview" />
            </div>
          )}

          {/* View Comments Button */}
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                openModal()
              }}
            >
              <MessageSquare className="h-4 w-4" />
                {commentCount > 0
                  ? t('comments_count', { count: commentCount })
                  : t('view_comments')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Post Detail Modal */}
      <PostDetailModal
        post={post}
        open={showModal}
        onClose={closeModal}
        classMemberId={classMemberId}
        classId={classId}
        currentMemberRole={currentMemberRole}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          classContext={classContext}
          open={isUserModalOpen}
          onOpenChange={setUserModalOpen}
        />
      )}
    </>
  )
}
