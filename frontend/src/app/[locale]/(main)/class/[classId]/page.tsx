import { Metadata } from 'next'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/serverQueryClient'
import ClassPostsLoader from '@/components/features/class/modules/ClassPosts/ClassPostsLoader'
import { classApi } from '@/api/classApi'
import { postApi } from '@/api/postApi'
import { postKeys } from '@/queries/postQueries'
import { DASHBOARD_PAGINATION } from '@/config/pagination'

interface ClassPageProps {
  params: Promise<{
    locale: string
    classId: string
  }>
}

export async function generateMetadata({ params }: ClassPageProps): Promise<Metadata> {
  const { classId } = await params
  
  try {
    const classData = await classApi.getById(parseInt(classId))
    return {
      title: `${classData.name}`,
      description: `Overview and details for class: ${classData.name}. ${classData.description || 'Manage assignments, grades, and class activities.'}`
    }
  } catch {
    return {
      title: 'Class',
      description: 'Class overview and management page'
    }
  }
}

export default async function ClassPage({ params }: ClassPageProps) {
  const { classId } = await params
  const classIdNum = parseInt(classId)

  // SSR with TanStack Query - prefetch posts data
  const queryClient = getServerQueryClient()

  try {
    const postParams = {
      classId: classIdNum,
      pageNumber: DASHBOARD_PAGINATION.DEFAULT_PAGE_NUMBER,
      pageSize: DASHBOARD_PAGINATION.DEFAULT_PAGE_SIZE,
    }
    await queryClient.prefetchQuery({
      queryKey: postKeys.list(postParams),
      queryFn: () => postApi.getList(postParams),
    })
  } catch (error) {
    // Handle server-side fetch errors gracefully
    console.error('Failed to prefetch posts:', error)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClassPostsLoader classId={classId} />
    </HydrationBoundary>
  )
}