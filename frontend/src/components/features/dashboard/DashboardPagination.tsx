"use client"

import type { PaginatedClassResponse } from '@/types/class'
import type { usePaginationHelpers } from '@/hooks/usePaginationHelpers'
import { Pagination } from '@/components/ui/pagination'

interface DashboardPaginationProps {
  data: PaginatedClassResponse
  currentPage: number
  onPageChange: (page: number) => void
  paginationHelpers?: ReturnType<typeof usePaginationHelpers>
}

export const DashboardPagination = ({
  data,
  currentPage,
  onPageChange,
  paginationHelpers,
}: DashboardPaginationProps) => {
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={data.totalPages}
      onPageChange={onPageChange}
      paginationHelpers={paginationHelpers}
      hasPreviousPage={data.hasPreviousPage}
      hasNextPage={data.hasNextPage}
      className="mt-8"
      align="center"
      showPageNumbers={Boolean(paginationHelpers)}
    />
  )
}