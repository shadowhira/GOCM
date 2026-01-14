import { Metadata } from "next";
import { Header } from '@/components/features/layout/header'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getServerQueryClient } from '@/lib/serverQueryClient'
import { classApi } from '@/api/classApi'
import { classKeys } from '@/queries/classQueries'
import DashboardLoader from '@/components/features/dashboard/DashboardLoader'
import { DASHBOARD_PAGINATION } from '@/config/pagination'

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your personalized dashboard with overview of classes, recent activities, and quick access to important features.",
};

interface DashboardPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    pageSize?: string
  }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams
  const defaultPage = DASHBOARD_PAGINATION.DEFAULT_PAGE_NUMBER

  // Parse search parameters with defaults
  const page = parseInt(params.page || defaultPage.toString(), 10)
  const pageSize = parseInt(
    params.pageSize || DASHBOARD_PAGINATION.DEFAULT_PAGE_SIZE.toString(),
    10
  )
  const search = params.search || undefined

  // Validate page number
  const currentPage = Math.max(defaultPage, Number.isNaN(page) ? defaultPage : page)

  // SSR with TanStack Query - prefetch only current user's classes with pagination
  const queryClient = getServerQueryClient()

  try {
    await queryClient.prefetchQuery({
      queryKey: classKeys.list({ 
        pageNumber: currentPage, 
        pageSize: pageSize,
        name: search,
        onlyMine: true,
      }),
      queryFn: () => classApi.getList({ 
        pageNumber: currentPage, 
        pageSize: pageSize,
        name: search,
        onlyMine: true,
      }),
    })
  } catch (error) {
    // Handle server-side fetch errors gracefully
    console.error('Failed to prefetch classes:', error)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header in Dashboard mode - no left elements */}
      <Header mode="dashboard" />

      {/* Main content - Dashboard with SSR data */}
      <main className="pt-14 sm:pt-16"> {/* Add padding-top to account for fixed header */}
        <HydrationBoundary state={dehydrate(queryClient)}>
          <DashboardLoader />
        </HydrationBoundary>
      </main>
    </div>
  )
}