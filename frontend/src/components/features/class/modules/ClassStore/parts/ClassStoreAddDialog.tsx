'use client'
import { useEffect, useMemo, useState, type KeyboardEvent } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import type { ShopItem } from '@/types/shopItem'
import { cn } from '@/lib/utils'

interface ClassStoreAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: ShopItem[]
  isSubmitting: boolean
  isLoadingItems: boolean
  onSubmit: (shopItemIds: number[]) => void
}

export const ClassStoreAddDialog = ({
  open,
  onOpenChange,
  items,
  isSubmitting,
  isLoadingItems,
  onSubmit,
}: ClassStoreAddDialogProps) => {
  const t = useTranslations()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<number[]>([])

  useEffect(() => {
    if (!open) {
      setSearch('')
      setSelected([])
    }
  }, [open])

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return items
    return items.filter((item) =>
      [item.name, item.description].some((value) =>
        value?.toLowerCase().includes(keyword)
      )
    )
  }, [items, search])

  const toggleItem = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    )
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, id: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggleItem(id)
    }
  }

  const handleSubmit = () => {
    if (selected.length === 0) return
    onSubmit(selected)
  }

  const isConfirmDisabled = selected.length === 0 || isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('class_store_add_dialog_title')}</DialogTitle>
          <DialogDescription>{t('class_store_add_dialog_description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('class_store_add_dialog_search_placeholder')}
          />

          <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
            <div className="divide-y divide-border">
              {isLoadingItems ? (
                <p className="p-4 text-sm text-muted-foreground">{t('class_store_add_dialog_loading')}</p>
              ) : filteredItems.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">{t('class_store_add_dialog_empty')}</p>
              ) : (
                filteredItems.map((item) => {
                  const isChecked = selected.includes(item.id)
                  return (
                    <div
                      key={item.id}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      onClick={() => toggleItem(item.id)}
                      onKeyDown={(event) => handleKeyDown(event, item.id)}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                        isChecked ? 'bg-primary-50/10' : ''
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleItem(item.id)}
                        onClick={(event) => event.stopPropagation()}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          {item.iconUrl ? (
                            <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-border/60 bg-card">
                              <Image
                                src={item.iconUrl}
                                alt={item.name || 'Shop item icon'}
                                fill
                                className="object-cover"
                                sizes="48px"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted text-base font-semibold text-muted-foreground">
                              {(item.name?.trim().charAt(0) || 'I').toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{item.name}</p>
                            {item.description ? (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <p className="mt-2 text-sm font-semibold text-primary-600">
                          {t('class_store_cost_badge', { points: item.costInPoints })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('class_store_usage_duration_meta', { days: item.usageDurationDays })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isConfirmDisabled}>
            {isSubmitting ? t('class_store_add_items_processing') : t('class_store_add_dialog_confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
