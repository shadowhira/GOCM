"use client";

import { Pagination } from "@/components/ui/pagination";
import { NOTIFICATIONS_PAGINATION } from "@/config/pagination";

interface NotificationsPaginationProps {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const NotificationsPagination = ({
  pageNumber,
  pageSize,
  totalPages,
  totalItems,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  onPageSizeChange,
}: NotificationsPaginationProps) => {
  if (totalPages <= 1 && totalItems <= pageSize) {
    return null;
  }

  return (
    <div className="flex justify-end">
      <Pagination
        currentPage={pageNumber}
        totalPages={totalPages}
        onPageChange={onPageChange}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        pageSize={pageSize}
        totalItems={totalItems}
        pageSizeOptions={[...NOTIFICATIONS_PAGINATION.PAGE_SIZE_OPTIONS]}
        onPageSizeChange={onPageSizeChange}
        align="end"
      />
    </div>
  );
};
