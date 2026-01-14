import { Metadata } from 'next'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/serverQueryClient'
import ClassDocumentsLoader from '@/components/features/class/modules/ClassDocuments/ClassDocumentsLoader'
import { classApi } from '@/api/classApi'
import { documentApi } from '@/api/documentApi'
import { documentKeys } from '@/queries/documentQueries'

interface ClassDocumentsPageProps {
  params: Promise<{
    locale: string
    classId: string
  }>
}

export async function generateMetadata({ params }: ClassDocumentsPageProps): Promise<Metadata> {
  const { classId } = await params
  
  try {
    const classData = await classApi.getById(parseInt(classId))
    return {
      title: `Documents - ${classData.name}`,
      description: `Access and manage documents for ${classData.name}. Upload, share, and organize educational resources.`
    }
  } catch {
    return {
      title: 'Documents',
      description: 'Manage class documents and educational resources'
    }
  }
}

export default async function DocumentsPage({ params }: ClassDocumentsPageProps) {
  const { classId } = await params
  const classIdNum = parseInt(classId)

  // SSR with TanStack Query - prefetch documents data
  const queryClient = getServerQueryClient()

  try {
    await queryClient.prefetchQuery({
      queryKey: documentKeys.byClass(classIdNum),
      queryFn: () => documentApi.getByClassId(classIdNum),
    })
  } catch (error) {
    // Handle server-side fetch errors gracefully
    console.error('Failed to prefetch documents:', error)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ClassDocumentsLoader classId={classId} />
    </HydrationBoundary>
  )
}