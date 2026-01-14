import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { AdminShopItemsPage } from '@/components/features/admin/shopItems'
import { ADMIN_SHOP_ITEMS_PAGINATION } from '@/config/pagination'
import { getServerQueryClient } from '@/lib/serverQueryClient'
import { shopItemApi } from '@/api/shopItemApi'
import { adminKeys } from '@/queries/adminQueries'
import { getCurrentUserRole } from '@/lib/auth-server'
import { Role } from '@/types/auth'

const DEFAULT_PAGE = ADMIN_SHOP_ITEMS_PAGINATION.DEFAULT_PAGE_NUMBER
const DEFAULT_PAGE_SIZE = ADMIN_SHOP_ITEMS_PAGINATION.DEFAULT_PAGE_SIZE

export const metadata: Metadata = {
  title: 'Admin Shop Items',
  description: 'Manage platform shop items',
}

export default async function AdminShopItemsRoute() {
  const role = await getCurrentUserRole()
  if (role !== Role.Admin) {
    notFound()
  }

  const queryClient = getServerQueryClient()

  try {
    await queryClient.prefetchQuery({
      queryKey: adminKeys.shopItemsList({
        pageNumber: DEFAULT_PAGE,
        pageSize: DEFAULT_PAGE_SIZE,
        keyword: undefined,
      }),
      queryFn: () =>
        shopItemApi.getList({
          pageNumber: DEFAULT_PAGE,
          pageSize: DEFAULT_PAGE_SIZE,
          keyword: undefined,
        }),
    })
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      notFound()
    }
    console.error('Failed to prefetch admin shop items:', error)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminShopItemsPage initialPage={DEFAULT_PAGE} initialPageSize={DEFAULT_PAGE_SIZE} />
    </HydrationBoundary>
  )
}