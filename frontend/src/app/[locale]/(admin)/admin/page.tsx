import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { AdminDashboard } from '@/components/features/admin/AdminDashboard'
import { getServerQueryClient } from '@/lib/serverQueryClient'
import { adminApi } from '@/api/adminApi'
import { adminKeys } from '@/queries/adminQueries'
import { getCurrentUserRole } from '@/lib/auth-server'
import { Role } from '@/types/auth'
import { isAxiosError } from 'axios'

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin panel dashboard with system overview',
}

export default async function AdminPage() {
  const role = await getCurrentUserRole()
  if (role !== Role.Admin) {
    notFound()
  }

  const queryClient = getServerQueryClient()

  try {
    await queryClient.prefetchQuery({
      queryKey: adminKeys.overview(),
      queryFn: () => adminApi.getOverview(),
    })
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) {
      notFound()
    }
    console.error('Failed to prefetch admin overview:', error)
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminDashboard />
    </HydrationBoundary>
  )
}