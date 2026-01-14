"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

type PaginationHelpersLike = {
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  getPageNumbers?: (maxVisible?: number) => number[];
};

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  align?: "start" | "center" | "end";
  paginationHelpers?: PaginationHelpersLike;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  maxVisiblePages?: number;
  showPageNumbers?: boolean;
  pageSize?: number;
  totalItems?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
}

const buildPageNumbers = (
  currentPage: number,
  totalPages: number,
  maxVisible: number
) => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: number[] = [];
  const half = Math.floor(maxVisible / 2);
  const start = Math.max(2, currentPage - half);
  const end = Math.min(totalPages - 1, currentPage + half);

  pages.push(1);

  if (start > 2) {
    pages.push(-1);
  }

  for (let page = start; page <= end; page += 1) {
    if (page > 1 && page < totalPages) {
      pages.push(page);
    }
  }

  if (end < totalPages - 1) {
    pages.push(-1);
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  align = "center",
  paginationHelpers,
  hasPreviousPage,
  hasNextPage,
  maxVisiblePages = 5,
  showPageNumbers = true,
  pageSize,
  totalItems,
  pageSizeOptions = [10, 20, 30, 40, 50],
  onPageSizeChange,
}: PaginationProps) {
  const t = useTranslations();
  const showRangeInfo =
    typeof totalItems === "number" && typeof pageSize === "number" && totalItems > 0;
  const showPageSizeSelect =
    typeof onPageSizeChange === "function" && typeof pageSize === "number";

  if (totalPages <= 1 && !showRangeInfo && !showPageSizeSelect) {
    return null;
  }

  const resolvedHasPrevious =
    paginationHelpers?.hasPreviousPage ?? hasPreviousPage ?? currentPage > 1;
  const resolvedHasNext =
    paginationHelpers?.hasNextPage ?? hasNextPage ?? currentPage < totalPages;

  const shouldShowPageNumbers = showPageNumbers && totalPages > 1;
  const derivedPageNumbers = paginationHelpers?.getPageNumbers
    ? paginationHelpers.getPageNumbers(maxVisiblePages)
    : shouldShowPageNumbers
      ? buildPageNumbers(currentPage, totalPages, maxVisiblePages)
      : [];

  const startItem = showRangeInfo ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = showRangeInfo ? Math.min(currentPage * pageSize, totalItems) : 0;

  const handlePageSizeChange = (value: string) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      onPageSizeChange?.(parsed);
    }
  };

  const alignmentClass = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
  }[align];

  const changePage = (page: number) => {
    if (page === currentPage) return;
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {(showRangeInfo || showPageSizeSelect) && (
        <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          {showRangeInfo && (
            <span>{t("range", { start: startItem, end: endItem, total: totalItems })}</span>
          )}

          {showPageSizeSelect && (
            <div className="flex items-center gap-2">
              <span>{t("page_size")}</span>
              <Select
                value={pageSize !== undefined ? pageSize.toString() : undefined}
                onValueChange={handlePageSizeChange}
              >
                <SelectTrigger className="h-8 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {pageSizeOptions.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      <div className={cn("flex w-full", alignmentClass)}>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={!resolvedHasPrevious}
            onClick={() => resolvedHasPrevious && changePage(currentPage - 1)}
            size="sm"
            className="text-foreground hover:text-primary-700 hover:bg-primary-50 disabled:text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t("previous")}
          </Button>

          {derivedPageNumbers.length > 0 && (
            <div className="flex gap-1 mx-2">
              {derivedPageNumbers.map((pageNum, index) =>
                pageNum === -1 ? (
                  <span key={`ellipsis-${index}`} className="px-2 py-1 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => changePage(pageNum)}
                    className={
                      pageNum === currentPage
                        ? "min-w-8 h-8 bg-primary-600 text-white hover:bg-primary-700"
                        : "min-w-8 h-8 text-foreground hover:text-primary-700 hover:bg-primary-50"
                    }
                  >
                    {pageNum}
                  </Button>
                )
              )}
            </div>
          )}

          <Button
            onClick={() => resolvedHasNext && changePage(currentPage + 1)}
            disabled={!resolvedHasNext}
            variant="outline"
            size="sm"
            className="text-foreground hover:text-primary-700 hover:bg-primary-50 disabled:text-muted-foreground"
          >
            {t("next")}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
