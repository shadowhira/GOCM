'use client'

import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type ClassStoreSortOption = 'name' | 'costLowHigh' | 'costHighLow'

interface ClassStoreFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  sort: ClassStoreSortOption
  onSortChange: (value: ClassStoreSortOption) => void
}

export const ClassStoreFilters = ({
  search,
  onSearchChange,
  sort,
  onSortChange,
}: ClassStoreFiltersProps) => {
  const t = useTranslations()

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={t('class_store_search_placeholder')}
        className="md:max-w-sm"
      />

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          {t('class_store_sort_label')}
        </span>
        <Select value={sort} onValueChange={(value) => onSortChange(value as ClassStoreSortOption)}>
          <SelectTrigger className="min-w-40 md:min-w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">{t('class_store_sort_name')}</SelectItem>
            <SelectItem value="costLowHigh">{t('class_store_sort_cost_low_high')}</SelectItem>
            <SelectItem value="costHighLow">{t('class_store_sort_cost_high_low')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
