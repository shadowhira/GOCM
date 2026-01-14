'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { useRouterWithProgress } from '@/hooks/useRouterWithProgress'
import { PostList, PostModal } from './post'
import { useGetClassMembers } from '@/queries/classQueries'
import { useCurrentUser } from '@/store/auth'
import { useGetPostById, useDeletePost } from '@/queries/postQueries'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ClassPostsProps {
  classId: string
}

export const ClassPosts = ({ classId }: ClassPostsProps) => {
  const t = useTranslations()
  const router = useRouterWithProgress()
  const currentUser = useCurrentUser()
  const numericClassId = Number(classId)

  // Fetch members to derive classMemberId for current user
  const { data: members } = useGetClassMembers(numericClassId)
  const currentMember = React.useMemo(() => {
    return members?.find((m) => m.userId === currentUser?.id)
  }, [members, currentUser?.id])
  const classMemberId = currentMember?.id
  const currentMemberRole = currentMember?.roleInClassValue

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editPostId, setEditPostId] = React.useState<number | null>(null)
  const [deletePostId, setDeletePostId] = React.useState<number | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)
  
  // Fetch post data when edit modal opens
  const { data: editPostData } = useGetPostById(editPostId || 0)
  const deletePostMutation = useDeletePost()

  // Manage URL hash for post modals
  const setCreateHash = React.useCallback(() => {
    if (typeof window === 'undefined') return
    window.location.hash = 'create-post'
  }, [])

  const setEditHash = React.useCallback((id: number) => {
    if (typeof window === 'undefined') return
    window.location.hash = `edit-post-${id}`
  }, [])

  const clearHash = React.useCallback(() => {
    if (typeof window === 'undefined') return
    const url = `${window.location.pathname}${window.location.search}`
    window.history.replaceState(null, '', url)
  }, [])

  function openDeleteDialog(postId: number) {
    setDeletePostId(postId)
    setIsDeleteOpen(true)
  }

  async function confirmDeletePost() {
    if (!deletePostId) return
    try {
      await deletePostMutation.mutateAsync(deletePostId)
      toast.success(t('post_deleted_success'))
      // Clear hash only if it points to the deleted post detail modal
      if (typeof window !== 'undefined') {
        const hash = window.location.hash
        if (hash === `#post-${deletePostId}`) {
          clearHash()
        }
      }
      setIsDeleteOpen(false)
      setDeletePostId(null)
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error(t('post_delete_failed'))
    }
  }

  // Parse and sync modal state from URL hash
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const syncFromHash = () => {
      const hash = window.location.hash
      if (hash === '#create-post') {
        setCreateOpen(true)
        setEditPostId(null)
        return
      }
      const match = hash.match(/^#edit-post-(\d+)$/)
      if (match) {
        const id = Number(match[1])
        if (!Number.isNaN(id)) {
          setEditPostId(id)
          setCreateOpen(false)
          return
        }
      }
      // Any other hash (or cleared): close both
      setCreateOpen(false)
      setEditPostId(null)
    }

    // Initial check and listener
    syncFromHash()
    window.addEventListener('hashchange', syncFromHash)
    return () => window.removeEventListener('hashchange', syncFromHash)
  }, [])


  return (
    <div className="space-y-6">
      {/* Posts Section - Bảng tin */}
      <section className="space-y-4">
        <PostList
          classId={numericClassId}
          showActions={!!classMemberId}
          currentUserClassMemberId={classMemberId}
          currentUserRoleInClass={currentMemberRole}
          onCreatePost={() => { setCreateHash(); setCreateOpen(true) }}
          onViewPost={(postId) => router.push(`/${classId}/post/${postId}`)}
          onEditPost={classMemberId ? (postId) => { setEditHash(postId); setEditPostId(postId) } : undefined}
          onDeletePost={classMemberId ? (postId) => openDeleteDialog(postId) : undefined}
        />
      </section>

      {/* Post Modal - Create */}
      <PostModal
        mode="create"
        open={createOpen}
        onClose={() => { if (typeof window !== 'undefined' && window.location.hash === '#create-post') clearHash(); setCreateOpen(false) }}
        classId={numericClassId}
        classMemberId={classMemberId}
      />

      {/* Post Modal - Edit */}
      {editPostData && (
        <PostModal
          mode="edit"
          open={!!editPostId}
          onClose={() => { if (typeof window !== 'undefined' && /^#edit-post-\d+$/.test(window.location.hash)) clearHash(); setEditPostId(null) }}
          post={editPostData}
          classId={numericClassId}
        />
      )}

      {/* Delete Post Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirm_delete_post')}</DialogTitle>
            <DialogDescription>
              {/* Optional: provide additional warning if desired */}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={deletePostMutation.isPending}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeletePost}
              disabled={deletePostMutation.isPending}
            >
              {t('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
