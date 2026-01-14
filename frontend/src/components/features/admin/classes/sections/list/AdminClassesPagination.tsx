'use client'

import { Pagination } from '@/components/ui/pagination'
import { ADMIN_CLASSES_PAGINATION } from '@/config/pagination'

interface AdminClassesPaginationProps {
  currentPage: number
  totalPages: number
  totalItems?: number
  pageSize?: number
  hasPreviousPage?: boolean
  hasNextPage?: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export const AdminClassesPagination = ({
  currentPage,
  totalPages,
  totalItems = 0,
  pageSize = ADMIN_CLASSES_PAGINATION.DEFAULT_PAGE_SIZE,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  onPageSizeChange,
}: AdminClassesPaginationProps) => {
  if (totalPages <= 1 && totalItems <= pageSize) {
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
        pageSize={pageSize}
        totalItems={totalItems}
        pageSizeOptions={[...ADMIN_CLASSES_PAGINATION.PAGE_SIZE_OPTIONS]}
        onPageSizeChange={onPageSizeChange}
        align="end"
      />
    </div>
  )
}
