'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, FilterX } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { ShopItemVisualType } from '@/types/shopItem'

interface AdminShopItemsFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  visualType: ShopItemVisualType | undefined
  onVisualTypeChange: (value: ShopItemVisualType | undefined) => void
  isBusy?: boolean
  onResetFilters?: () => void
}

export const AdminShopItemsFilters = ({
  searchValue,
  onSearchChange,
  visualType,
  onVisualTypeChange,
  isBusy = false,
  onResetFilters,
}: AdminShopItemsFiltersProps) => {
  const t = useTranslations()
  const hasActiveFilter = (searchValue?.trim()?.length ?? 0) > 0 || visualType !== undefined

  const handleVisualTypeChange = (value: string) => {
    if (value === 'all') {
      onVisualTypeChange(undefined)
    } else {
      onVisualTypeChange(Number(value) as ShopItemVisualType)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-3 w-full md:flex-row md:items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('search_shop_items')}
            aria-label={t('search_shop_items')}
            className={cn('pl-9 pr-9', isBusy && 'animate-pulse')}
          />
        </div>

        <Select
          value={visualType !== undefined ? String(visualType) : 'all'}
          onValueChange={handleVisualTypeChange}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder={t('filter_by_type')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_types')}</SelectItem>
            <SelectItem value={String(ShopItemVisualType.AvatarFrame)}>
              {t('shop_item_visual_avatar_frame')}
            </SelectItem>
            <SelectItem value={String(ShopItemVisualType.ChatFrame)}>
              {t('shop_item_visual_chat_frame')}
            </SelectItem>
            <SelectItem value={String(ShopItemVisualType.NameBadge)}>
              {t('shop_item_visual_name_badge')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

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
  )
}
