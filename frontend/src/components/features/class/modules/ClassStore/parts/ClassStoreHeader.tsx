'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { PackagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClassStoreHeaderProps {
  classDisplayName?: string
  currentPoints?: number | null
  canManageStore: boolean
  canPurchaseItems: boolean
  onAddClick?: () => void
  showAddButton?: boolean
  addButtonDisabled?: boolean
  className?: string
}

export const ClassStoreHeader = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  classDisplayName,
  currentPoints,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canManageStore,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canPurchaseItems,
  onAddClick,
  showAddButton,
  addButtonDisabled,
  className,
}: ClassStoreHeaderProps) => {
  const t = useTranslations()
  const pointsLabel = typeof currentPoints === 'number'
    ? t('class_store_points_balance', { points: currentPoints })
    : undefined

  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-start md:justify-between', className)}>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('sidebar_store')}</h1>
        </div>
        {pointsLabel ? (
          <p className="text-sm font-medium text-primary-600">
            {pointsLabel}
          </p>
        ) : null}
      </div>

      {showAddButton ? (
        <Button
          type="button"
          onClick={onAddClick}
          disabled={addButtonDisabled}
          className="w-full md:w-auto"
        >
          <PackagePlus className="h-4 w-4" />
          <span>{t('class_store_add_items_button')}</span>
        </Button>
      ) : null}
    </div>
  )
}
