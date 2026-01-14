"use client";

import type { usePaginationHelpers } from "@/hooks/usePaginationHelpers";
import { Pagination } from "@/components/ui/pagination";

interface PaginationFooterProps {
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
  helpers: ReturnType<typeof usePaginationHelpers>;
}

export const PaginationFooter = ({
  page,
  setPage,
  totalPages,
  helpers,
}: PaginationFooterProps) => {
  return (
    <Pagination
      currentPage={page}
      totalPages={totalPages}
      onPageChange={setPage}
      paginationHelpers={helpers}
      hasPreviousPage={helpers.hasPreviousPage}
      hasNextPage={helpers.hasNextPage}
      className="border-t px-4 py-3"
      align="end"
      maxVisiblePages={7}
    />
  );
};
