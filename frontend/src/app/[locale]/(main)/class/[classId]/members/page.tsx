import { Metadata } from 'next'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/serverQueryClient'
import ClassMembersLoader from '@/components/features/class/modules/ClassMembers/ClassMembersLoader'
import { classApi } from '@/api/classApi'
import { classKeys } from '@/queries/classQueries'

interface ClassMembersPageProps {
  params: Promise<{
    locale: string
    classId: string
  }>
}

export async function generateMetadata({ params }: ClassMembersPageProps): Promise<Metadata> {
  const { classId } = await params
  
  try {
    const classData = await classApi.getById(parseInt(classId))
    return {
      title: `Members - ${classData.name}`,
      description: `Manage members of ${classData.name}. View student list, manage roles, and track participation.`
    }
  } catch {
    return {
      title: 'Members',
      description: 'Manage class members and student participation'
    }
  }
}

export default async function MembersPage({ params }: ClassMembersPageProps) {
  const { classId } = await params
  const classIdNum = parseInt(classId)

  // SSR with TanStack Query - prefetch members data
  const queryClient = getServerQueryClient()

  try {
    await queryClient.prefetchQuery({
      queryKey: classKeys.members(classIdNum),
      queryFn: () => classApi.getMembers(classIdNum),
    })
  } catch (error) {
    // Handle server-side fetch errors gracefully
    console.error('Failed to prefetch class members:', error)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClassMembersLoader classId={classId} />
    </HydrationBoundary>
  )
}