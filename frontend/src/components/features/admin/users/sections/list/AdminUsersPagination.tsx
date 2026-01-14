"use client"

import { Pagination } from '@/components/ui/pagination'

interface AdminUsersPaginationProps {
  currentPage: number
  totalPages: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
  onPageChange: (page: number) => void
}

export const AdminUsersPagination = ({
  currentPage,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
}: AdminUsersPaginationProps) => {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex justify-end">
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        align="end"
      />
    </div>
  )
}
