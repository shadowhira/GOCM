'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import type { ShopItem } from '@/types/shopItem'

interface ShopItemDeleteDialogProps {
  open: boolean
  shopItem?: ShopItem
  onCancel: () => void
  onConfirm: () => void
  isDeleting?: boolean
}

export const ShopItemDeleteDialog = ({
  open,
  shopItem,
  onCancel,
  onConfirm,
  isDeleting = false,
}: ShopItemDeleteDialogProps) => {
  const t = useTranslations()

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('confirm_delete_shop_item')}</DialogTitle>
          <DialogDescription>
            {t('delete_shop_item_warning')}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium text-foreground">{shopItem?.name ?? '—'}</p>
          <p className="text-sm text-muted-foreground">
            {t('cost_in_points')}: {shopItem?.costInPoints ?? '—'}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('usage_duration_days')}: {shopItem ? t('usage_duration_value', { count: shopItem.usageDurationDays }) : '—'}
          </p>
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isDeleting}>
            {t('cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('delete_shop_item')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
