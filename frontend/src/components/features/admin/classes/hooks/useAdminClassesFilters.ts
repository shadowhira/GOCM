'use client'

import { useEffect, useMemo, useState } from 'react'
import { useUrlParams } from '@/hooks/useUrlParams'

interface UseAdminClassesFiltersParams {
  initialPage: number
  initialPageSize: number
}

export const useAdminClassesFilters = ({
  initialPage,
  initialPageSize,
}: UseAdminClassesFiltersParams) => {
  const { params, updateParams } = useUrlParams('/admin/classes', {
    page: initialPage,
    pageSize: initialPageSize,
    onlyMine: false,
  })

  const [searchInput, setSearchInput] = useState(params.search ?? '')
  const [onlyMine, setOnlyMine] = useState(Boolean(params.onlyMine))

  useEffect(() => {
    setSearchInput(params.search ?? '')
  }, [params.search])

  useEffect(() => {
    setOnlyMine(Boolean(params.onlyMine))
  }, [params.onlyMine])

  useEffect(() => {
    const normalized = searchInput.trim()
    const currentSearch = params.search ?? ''

    if (normalized === currentSearch) {
      return
    }

    const timeout = window.setTimeout(() => {
      updateParams({ search: normalized || undefined, page: 1 })
    }, 400)

    return () => window.clearTimeout(timeout)
  }, [searchInput, params.search, updateParams])

  const pageNumber = params.page ?? initialPage
  const pageSize = params.pageSize ?? initialPageSize

  const handleOnlyMineChange = (value: boolean) => {
    setOnlyMine(value)
    updateParams({ onlyMine: value ? true : false, page: 1 })
  }

  const resetFilters = () => {
    setSearchInput('')
    setOnlyMine(false)
    updateParams({ search: undefined, onlyMine: false, page: 1 })
  }

  const memoizedParams = useMemo(() => params, [params])

  return {
    params: memoizedParams,
    updateParams,
    searchInput,
    setSearchInput,
    onlyMine,
    handleOnlyMineChange,
    resetFilters,
    pageNumber,
    pageSize,
  }
}
