import { Metadata } from 'next'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/serverQueryClient'
import ClassLiveRoomLoader from '@/components/features/class/modules/ClassLiveRoom/ClassLiveRoomLoader'
import { classApi } from '@/api/classApi'
import { liveRoomApi } from '@/api/liveRoomApi'
import { liveRoomKeys } from '@/queries/liveRoomQueries'
import { LIVE_ROOMS_PAGINATION } from '@/config/pagination'

interface ClassLiveRoomPageProps {
  params: Promise<{
    locale: string
    classId: string
  }>
}

export async function generateMetadata({ params }: ClassLiveRoomPageProps): Promise<Metadata> {
  const { classId } = await params

  try {
    const classData = await classApi.getById(parseInt(classId))
    return {
      title: `Live Class - ${classData.name}`,
      description: `Join live sessions for ${classData.name}. Interactive online learning and real-time collaboration.`
    }
  } catch {
    return {
      title: 'Live Class',
      description: 'Join live class sessions and interactive learning'
    }
  }
}

export default async function LiveClassPage({ params }: ClassLiveRoomPageProps) {
  const { classId } = await params
  const classIdNum = parseInt(classId)

  // SSR with TanStack Query - prefetch live rooms data
  const queryClient = getServerQueryClient()

  try {
    const liveRoomParams = {
      classId: classIdNum,
      keyword: '',
      pageNumber: LIVE_ROOMS_PAGINATION.DEFAULT_PAGE_NUMBER,
      pageSize: LIVE_ROOMS_PAGINATION.DEFAULT_PAGE_SIZE,
    }
    await queryClient.prefetchQuery({
      queryKey: liveRoomKeys.list(liveRoomParams),
      queryFn: () => liveRoomApi.getList(liveRoomParams),
    })
  } catch (error) {
    // Handle server-side fetch errors gracefully
    console.error('Failed to prefetch live rooms:', error)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClassLiveRoomLoader classId={classId} />
    </HydrationBoundary>
  )
}
