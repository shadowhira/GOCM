/**
 * Danh sách bài đăng với infinite scroll
 */
'use client'

import React from 'react'
import { PostCard } from './PostCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'
import { useCurrentUser } from '@/store/auth'
import { useGetInfinitePostList } from '@/queries/postQueries'
import type { PostResponse } from '@/types/post'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useInView } from 'react-intersection-observer'
import { RoleInClass, type ClassMemberResponse } from '@/types/class'
import { useHydrateCosmeticsFromMembers } from '@/store'

interface PostListProps {
  classId?: number
  createdById?: number
  pageSize?: number
  showActions?: boolean
  currentUserClassMemberId?: number
  currentUserRoleInClass?: RoleInClass
  onCreatePost?: () => void
  onViewPost?: (postId: number) => void
  onEditPost?: (postId: number) => void
  onDeletePost?: (postId: number) => void
}

export const PostList = ({
  classId,
  createdById,
  pageSize = 10,
  currentUserClassMemberId,
  currentUserRoleInClass,
  onCreatePost,
  onEditPost,
  onDeletePost,
}: PostListProps) => {
  const t = useTranslations()
  const currentUser = useCurrentUser()
  const hydrateCosmetics = useHydrateCosmeticsFromMembers()

  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetInfinitePostList({
    pageSize,
    classId,
    createdById,
  })

  // Infinite scroll: observer để phát hiện khi user cuộn gần cuối
  const { ref, inView } = useInView({
    threshold: 0,
    triggerOnce: false,
    rootMargin: '400px', // Load sớm 400px để UX mượt hơn
  })

  // Tự động fetch trang tiếp theo khi user scroll
  React.useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Flatten: biến pages array thành single array để render
  const allPosts = React.useMemo(() => {
    return data?.pages.flatMap(page => page.items) || []
  }, [data])

  const postAuthors = React.useMemo(() => {
    if (!classId || allPosts.length === 0) {
      return []
    }

    const unique = new Map<number, ClassMemberResponse>()
    allPosts.forEach((post) => {
      if (post.createdBy) {
        unique.set(post.createdBy.id, post.createdBy)
      }
    })

    return Array.from(unique.values())
  }, [allPosts, classId])

  React.useEffect(() => {
    if (!classId || postAuthors.length === 0) {
      return
    }

    hydrateCosmetics(classId, postAuthors)
  }, [classId, postAuthors, hydrateCosmetics])

  const totalItems = data?.pages[0]?.totalItems || 0

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy>
        <span className="sr-only">{t('loading_posts')}</span>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border bg-card text-card-foreground rounded-xl shadow-md p-0">
            <div className="flex items-start gap-4 p-6 pb-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28 mt-2" />
              </div>
            </div>
            <div className="px-6 pb-6 pt-0 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="h-px w-full bg-border my-4" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="ml-2">
          {t('failed_to_load_posts')}
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
  if (allPosts.length === 0) {
    return (
      <Card>
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg">{t('no_posts_yet')}</CardTitle>
          <CardDescription>{t('no_posts_description')}</CardDescription>
        </CardHeader>
        {onCreatePost && (
          <CardContent className="flex justify-center pb-6">
            <Button onClick={onCreatePost} variant="primary">
              <Plus className="mr-2 h-4 w-4" />
              {t('create_first_post')}
            </Button>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      {onCreatePost && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('posts_title')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t('posts_count', { count: totalItems })}
            </p>
          </div>
          <Button onClick={onCreatePost} variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            {t('create_post')}
          </Button>
        </div>
      )}

      {/* Post List */}
      <div className="space-y-4">
        {allPosts.map((post: PostResponse) => {
            const isOwner = currentUser && post.createdBy?.userId === currentUser.id
            const isTeacher = currentUserRoleInClass === RoleInClass.TEACHER
            const canEdit = isOwner && onEditPost
            const canDelete = (isOwner || isTeacher) && onDeletePost
            return (
              <PostCard
                key={post.id}
                post={post}
                classMemberId={currentUserClassMemberId}
                classId={classId}
                currentMemberRole={currentUserRoleInClass}
                onEdit={canEdit ? () => onEditPost(post.id) : undefined}
                onDelete={canDelete ? () => onDeletePost(post.id) : undefined}
              />
            )
          })}
        
        {/* Vùng trigger cho infinite scroll */}
        <div ref={ref} className="flex justify-center py-4 min-h-24">
          {isFetchingNextPage && (
            <div className="w-full space-y-4" aria-busy>
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
              <span className="sr-only">{t('loading_more_posts')}</span>
            </div>
          )}
          {!hasNextPage && allPosts.length > 0 && !isFetchingNextPage && (
            <p className="text-sm text-muted-foreground">{t('no_more_posts')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
