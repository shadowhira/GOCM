'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, FilterX } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { RoleFilter } from '../../types'

interface AdminUsersFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  roleFilter: RoleFilter
  onRoleFilterChange: (value: RoleFilter) => void
  isBusy?: boolean
  onResetFilters?: () => void
}

export const AdminUsersFilters = ({
  searchValue,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  isBusy = false,
  onResetFilters,
}: AdminUsersFiltersProps) => {
  const t = useTranslations()
  const hasActiveFilter = roleFilter !== 'all' || (searchValue?.trim()?.length ?? 0) > 0

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-md">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={t('search_users')}
          aria-label={t('search_users')}
          className={cn('pl-9 pr-9', isBusy && 'animate-pulse')}
        />
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
        <Select value={roleFilter} onValueChange={(value: RoleFilter) => onRoleFilterChange(value)}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder={t('filter_by_role')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_roles')}</SelectItem>
            <SelectItem value="admin">{t('role_admin')}</SelectItem>
            <SelectItem value="user">{t('role_user')}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="ghost"
          className="w-full md:w-auto"
          onClick={() => onResetFilters?.()}
          disabled={!hasActiveFilter}
        >
          <FilterX className="mr-2 h-4 w-4" />
          {t('clear_all')}
        </Button>
      </div>
    </div>
  )
}
