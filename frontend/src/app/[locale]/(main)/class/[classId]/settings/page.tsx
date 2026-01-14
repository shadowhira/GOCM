import { Metadata } from 'next'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/serverQueryClient'
import ClassSettingsLoader from '@/components/features/class/modules/ClassSettings/ClassSettingsLoader'
import { classApi } from '@/api/classApi'
import { classKeys } from '@/queries/classQueries'

interface ClassSettingsPageProps {
  params: Promise<{
    locale: string
    classId: string
  }>
}

export async function generateMetadata({ params }: ClassSettingsPageProps): Promise<Metadata> {
  const { classId } = await params
  
  try {
    const classData = await classApi.getById(parseInt(classId))
    return {
      title: `Settings - ${classData.name}`,
      description: `Configure settings for ${classData.name}. Manage class preferences, permissions, and advanced options.`
    }
  } catch {
    return {
      title: 'Settings',
      description: 'Configure class settings and preferences'
    }
  }
}

export default async function SettingsPage({ params }: ClassSettingsPageProps) {
  const { classId } = await params
  const classIdNum = parseInt(classId)

  // SSR with TanStack Query - prefetch class detail for settings
  const queryClient = getServerQueryClient()

  try {
    await queryClient.prefetchQuery({
      queryKey: classKeys.detail(classIdNum),
      queryFn: () => classApi.getById(classIdNum),
    })
  } catch (error) {
    // Handle server-side fetch errors gracefully
    console.error('Failed to prefetch class detail:', error)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClassSettingsLoader classId={classId} />
    </HydrationBoundary>
  )
}