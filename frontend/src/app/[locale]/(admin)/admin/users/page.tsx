import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { AdminUsersPage } from '@/components/features/admin/users'
import { ADMIN_USERS_PAGINATION } from '@/config/pagination'
import { getServerQueryClient } from '@/lib/serverQueryClient'
import { userApi } from '@/api/userApi'
import { adminKeys } from '@/queries/adminQueries'
import { getCurrentUserRole } from '@/lib/auth-server'
import { Role } from '@/types/auth'

const DEFAULT_PAGE = ADMIN_USERS_PAGINATION.DEFAULT_PAGE_NUMBER
const DEFAULT_PAGE_SIZE = ADMIN_USERS_PAGINATION.DEFAULT_PAGE_SIZE

export const metadata: Metadata = {
  title: 'Admin Users',
  description: 'Manage platform users',
}

export default async function AdminUsersRoute() {
  const role = await getCurrentUserRole()
  if (role !== Role.Admin) {
    notFound()
  }

  const queryClient = getServerQueryClient()

  try {
    await queryClient.prefetchQuery({
      queryKey: adminKeys.usersList({
        pageNumber: DEFAULT_PAGE,
        pageSize: DEFAULT_PAGE_SIZE,
        displayName: undefined,
      }),
      queryFn: () =>
        userApi.getList({
          pageNumber: DEFAULT_PAGE,
          pageSize: DEFAULT_PAGE_SIZE,
          displayName: undefined,
        }),
    })
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      notFound()
    }
    console.error('Failed to prefetch admin users:', error)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminUsersPage initialPage={DEFAULT_PAGE} initialPageSize={DEFAULT_PAGE_SIZE} />
    </HydrationBoundary>
  )
}