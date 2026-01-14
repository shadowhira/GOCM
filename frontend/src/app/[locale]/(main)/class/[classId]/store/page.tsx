import { Metadata } from 'next'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import ClassStoreLoader from '@/components/features/class/modules/ClassStore/ClassStoreLoader'
import { classApi } from '@/api/classApi'
import { classKeys } from '@/queries/classQueries'
import { getServerQueryClient } from '@/lib/serverQueryClient'

interface ClassStorePageProps {
  params: Promise<{
    locale: string
    classId: string
  }>
}

export async function generateMetadata({ params }: ClassStorePageProps): Promise<Metadata> {
  const { classId } = await params
  
  try {
    const classData = await classApi.getById(parseInt(classId))
    return {
      title: `Store - ${classData.name}`,
      description: `Browse the store for ${classData.name}. Access educational materials, resources, and premium content.`
    }
  } catch {
    return {
      title: 'Store',
      description: 'Browse educational materials and class resources'
    }
  }
}

export default async function StorePage({ params }: ClassStorePageProps) {
  const { classId } = await params
  const classIdNum = parseInt(classId, 10)
  const queryClient = getServerQueryClient()

  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: classKeys.detail(classIdNum),
        queryFn: () => classApi.getById(classIdNum),
      }),
      queryClient.prefetchQuery({
        queryKey: classKeys.shopItems(classIdNum),
        queryFn: () => classApi.getShopItems(classIdNum),
      }),
    ])
  } catch (error) {
    console.error('Failed to prefetch class store data:', error)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClassStoreLoader classId={classId} />
    </HydrationBoundary>
  )
}