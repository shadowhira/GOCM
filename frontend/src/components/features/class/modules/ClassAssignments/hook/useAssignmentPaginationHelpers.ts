import { usePaginationHelpers } from "@/hooks/usePaginationHelpers";
import type { PaginatedClassResponse } from "@/types/class";

export const useAssignmentPaginationHelpers = (shape: {
  pageIndex: number;
  totalPages: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  pageSize?: number;
  totalItems?: number;
}) => {
  const adapted: PaginatedClassResponse = {
    items: [],
    totalItems: shape.totalItems ?? 0,
    pageIndex: shape.pageIndex,
    pageSize: shape.pageSize ?? 0,
    totalPages: shape.totalPages,
    hasPreviousPage: shape.hasPreviousPage ?? shape.pageIndex > 1,
    hasNextPage: shape.hasNextPage ?? shape.pageIndex < shape.totalPages,
  };
  return usePaginationHelpers(adapted);
};
