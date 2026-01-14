"use client"

import { useEffect, useMemo, useState } from 'react'
import { useUrlParams } from '@/hooks/useUrlParams'
import { ShopItemVisualType } from '@/types/shopItem'

interface UseAdminShopItemsFiltersParams {
  initialPage: number
  initialPageSize: number
}

export const useAdminShopItemsFilters = ({
  initialPage,
  initialPageSize,
}: UseAdminShopItemsFiltersParams) => {
  const { params, updateParams } = useUrlParams('/admin/shop-items', {
    page: initialPage,
    pageSize: initialPageSize,
  })

  const [searchInput, setSearchInput] = useState(params.search ?? '')
  // Client-side filter for visual type (not persisted to URL)
  const [visualType, setVisualType] = useState<ShopItemVisualType | undefined>(undefined)

  useEffect(() => {
    setSearchInput(params.search ?? '')
  }, [params.search])

  useEffect(() => {
    const normalizedInput = searchInput.trim()
    const currentSearch = params.search ?? ''

    if (normalizedInput === currentSearch) {
      return
    }

    const timeout = window.setTimeout(() => {
      updateParams({ search: normalizedInput || undefined, page: 1 })
    }, 400)

    return () => window.clearTimeout(timeout)
  }, [searchInput, params.search, updateParams])

  const pageNumber = params.page ?? initialPage
  const pageSize = params.pageSize ?? initialPageSize

  const resetFilters = () => {
    setSearchInput('')
    setVisualType(undefined)
    updateParams({ search: undefined, page: 1 })
  }

  const memoizedParams = useMemo(() => params, [params])

  return {
    params: memoizedParams,
    updateParams,
    searchInput,
    setSearchInput,
    visualType,
    setVisualType,
    resetFilters,
    pageNumber,
    pageSize,
  }
}
