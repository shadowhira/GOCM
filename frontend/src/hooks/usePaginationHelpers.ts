import type { PaginatedClassResponse } from '@/types/class'

interface PaginationHelpers {
  hasPreviousPage: boolean
  hasNextPage: boolean
  canGoToPage: (page: number) => boolean
  getPageNumbers: (maxVisible?: number) => number[]
}

/**
 * Client-side pagination helpers
 * Handles cases where backend doesn't provide hasPreviousPage/hasNextPage
 */
export const usePaginationHelpers = (data: PaginatedClassResponse): PaginationHelpers => {
  const { pageIndex, totalPages } = data

  // Calculate client-side if backend doesn't provide these fields
  const hasPreviousPage = data.hasPreviousPage ?? pageIndex > 1
  const hasNextPage = data.hasNextPage ?? pageIndex < totalPages

  const canGoToPage = (page: number): boolean => {
    return page >= 1 && page <= totalPages
  }

  /**
   * Generate page numbers for pagination UI
   * Google-style: show 1 ... 4 5 6 ... 10
   */
  const getPageNumbers = (maxVisible: number = 5): number[] => {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: number[] = []
    const current = pageIndex
    const half = Math.floor(maxVisible / 2)

    // Always show first page
    pages.push(1)

    let start = Math.max(2, current - half)
    let end = Math.min(totalPages - 1, current + half)

    // Adjust range if we're near the beginning or end
    if (current <= half + 1) {
      end = Math.min(totalPages - 1, maxVisible - 1)
    }
    if (current >= totalPages - half) {
      start = Math.max(2, totalPages - maxVisible + 2)
    }

    // Add ellipsis before start if needed
    if (start > 2) {
      pages.push(-1) // -1 represents ellipsis
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i)
      }
    }

    // Add ellipsis after end if needed
    if (end < totalPages - 1) {
      pages.push(-1) // -1 represents ellipsis
    }

    // Always show last page (if not already included)
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  return {
    hasPreviousPage,
    hasNextPage,
    canGoToPage,
    getPageNumbers,
  }
}