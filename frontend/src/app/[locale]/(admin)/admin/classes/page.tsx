import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { AdminClassesPage } from '@/components/features/admin/classes'
import { ADMIN_CLASSES_PAGINATION } from '@/config/pagination'
import { getServerQueryClient } from '@/lib/serverQueryClient'
import { classApi } from '@/api/classApi'
import { classKeys } from '@/queries/classQueries'
import { getCurrentUserRole } from '@/lib/auth-server'
import { Role } from '@/types/auth'

const DEFAULT_PAGE = ADMIN_CLASSES_PAGINATION.DEFAULT_PAGE_NUMBER
const DEFAULT_PAGE_SIZE = ADMIN_CLASSES_PAGINATION.DEFAULT_PAGE_SIZE

export const metadata: Metadata = {
  title: 'Admin Classes',
  description: 'Manage platform classes and members',
}

export default async function AdminClassesRoute() {
  const role = await getCurrentUserRole()
  if (role !== Role.Admin) {
    notFound()
  }

  const queryClient = getServerQueryClient()

  try {
    await queryClient.prefetchQuery({
      queryKey: classKeys.list({
        pageNumber: DEFAULT_PAGE,
        pageSize: DEFAULT_PAGE_SIZE,
        name: undefined,
        onlyMine: undefined,
      }),
      queryFn: () =>
        classApi.getList({
          pageNumber: DEFAULT_PAGE,
          pageSize: DEFAULT_PAGE_SIZE,
          name: undefined,
          onlyMine: undefined,
        }),
    })
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      notFound()
    }
    console.error('Failed to prefetch admin classes:', error)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminClassesPage initialPage={DEFAULT_PAGE} initialPageSize={DEFAULT_PAGE_SIZE} />
    </HydrationBoundary>
  )
}