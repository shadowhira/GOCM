'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Search, FilterX } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface AdminClassesFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  onlyMine: boolean
  onOnlyMineChange: (value: boolean) => void
  isBusy?: boolean
  onResetFilters?: () => void
}

export const AdminClassesFilters = ({
  searchValue,
  onSearchChange,
  onlyMine,
  onOnlyMineChange,
  isBusy = false,
  onResetFilters,
}: AdminClassesFiltersProps) => {
  const t = useTranslations()
  const hasActiveFilter = (searchValue?.trim()?.length ?? 0) > 0 || onlyMine

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('search_classes_admin')}
            aria-label={t('search_classes_admin')}
            className={cn('pl-9 pr-9', isBusy && 'animate-pulse')}
          />
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-dashed border-border/70 px-3 py-2">
          <Switch
            checked={onlyMine}
            onCheckedChange={onOnlyMineChange}
            id="only-mine-switch"
          />
          <Label htmlFor="only-mine-switch" className="text-sm text-muted-foreground">
            {t('only_my_classes')}
          </Label>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        className="w-full sm:w-auto"
        onClick={() => onResetFilters?.()}
        disabled={!hasActiveFilter}
      >
        <FilterX className="mr-2 h-4 w-4" />
        {t('clear_all')}
      </Button>
    </div>
  )
}
