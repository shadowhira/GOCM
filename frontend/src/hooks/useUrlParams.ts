import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface UrlParamsState {
  page?: number
  search?: string
  pageSize?: number
  role?: string
  onlyMine?: boolean
}

interface UseUrlParamsReturn {
  params: UrlParamsState
  updateParams: (newParams: Partial<UrlParamsState>) => void
  resetParams: () => void
}

/**
 * Custom hook for handling URL search parameters
 * More reusable and cleaner than manual URLSearchParams handling
 */
export const useUrlParams = (
  basePath: string = '/dashboard',
  defaults: UrlParamsState = {}
): UseUrlParamsReturn => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current params with defaults
  const currentParams: UrlParamsState = {
    page: parseInt(searchParams.get('page') || defaults.page?.toString() || '1', 10),
    search: searchParams.get('search') || defaults.search || undefined,
    pageSize: parseInt(searchParams.get('pageSize') || defaults.pageSize?.toString() || '8', 10),
    role: searchParams.get('role') || defaults.role || undefined,
    onlyMine: searchParams.get('onlyMine') === 'true' || defaults.onlyMine,
  }

  const updateParams = useCallback((newParams: Partial<UrlParamsState>) => {
    const params = new URLSearchParams(searchParams)
    
    // Handle page parameter
    if (newParams.page !== undefined) {
      if (newParams.page === 1 || newParams.page === defaults.page) {
        params.delete('page')
      } else {
        params.set('page', newParams.page.toString())
      }
    }
    
    // Handle search parameter
    if (newParams.search !== undefined) {
      if (newParams.search && newParams.search.trim()) {
        params.set('search', newParams.search.trim())
        // Reset page to 1 when searching
        if (newParams.page === undefined) {
          params.delete('page')
        }
      } else {
        params.delete('search')
      }
    }
    
    // Handle pageSize parameter
    if (newParams.pageSize !== undefined) {
      if (newParams.pageSize === defaults.pageSize) {
        params.delete('pageSize')
      } else {
        params.set('pageSize', newParams.pageSize.toString())
        // Reset page to 1 when changing page size
        if (newParams.page === undefined) {
          params.delete('page')
        }
      }
    }

    // Handle role parameter
    if (newParams.role !== undefined) {
      if (newParams.role && newParams.role.trim()) {
        params.set('role', newParams.role)
        if (newParams.page === undefined) {
          params.delete('page')
        }
      } else {
        params.delete('role')
      }
    }

    // Handle onlyMine parameter (boolean)
    if (newParams.onlyMine !== undefined) {
      if (newParams.onlyMine) {
        params.set('onlyMine', 'true')
        if (newParams.page === undefined) {
          params.delete('page')
        }
      } else {
        params.delete('onlyMine')
      }
    }
    
    const newUrl = params.toString() ? `${basePath}?${params.toString()}` : basePath
    router.push(newUrl)
  }, [router, searchParams, basePath, defaults])

  const resetParams = useCallback(() => {
    router.push(basePath)
  }, [router, basePath])

  return {
    params: currentParams,
    updateParams,
    resetParams,
  }
}