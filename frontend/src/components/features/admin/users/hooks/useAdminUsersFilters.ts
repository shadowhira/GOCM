'use client'

import { useEffect, useMemo, useState } from 'react'
import { useUrlParams } from '@/hooks/useUrlParams'
import type { RoleFilter } from '../types'

interface UseAdminUsersFiltersParams {
  initialPage: number
  initialPageSize: number
}

export const useAdminUsersFilters = ({
  initialPage,
  initialPageSize,
}: UseAdminUsersFiltersParams) => {
  const { params, updateParams } = useUrlParams('/admin/users', {
    page: initialPage,
    pageSize: initialPageSize,
  })

  const [searchInput, setSearchInput] = useState(params.search ?? '')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>((params.role as RoleFilter) ?? 'all')

  useEffect(() => {
    setSearchInput(params.search ?? '')
  }, [params.search])

  useEffect(() => {
    setRoleFilter((params.role as RoleFilter) ?? 'all')
  }, [params.role])

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

  const handleRoleFilterChange = (value: RoleFilter) => {
    setRoleFilter(value)
    updateParams({ role: value === 'all' ? undefined : value, page: 1 })
  }

  const resetFilters = () => {
    setSearchInput('')
    setRoleFilter('all')
    updateParams({ search: undefined, role: undefined, page: 1 })
  }

  const memoizedParams = useMemo(() => params, [params])

  return {
    params: memoizedParams,
    updateParams,
    searchInput,
    setSearchInput,
    roleFilter,
    handleRoleFilterChange,
    resetFilters,
    pageNumber,
    pageSize,
  }
}
