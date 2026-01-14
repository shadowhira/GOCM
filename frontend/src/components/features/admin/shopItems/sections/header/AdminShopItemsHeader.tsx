'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingBag, PackagePlus } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AdminShopItemsHeaderProps {
  totalItems?: number
  onCreateItem: () => void
}

export const AdminShopItemsHeader = ({ totalItems = 0, onCreateItem }: AdminShopItemsHeaderProps) => {
  const t = useTranslations()

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary-50 p-3 text-primary-600">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
              {t('admin_shop_items')}
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              {t('shop_items_management')}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('total_shop_items')}: <span className="font-medium text-foreground">{totalItems}</span>
            </p>
          </div>
        </div>
        <Button onClick={onCreateItem} variant="primary" className="w-full gap-2 md:w-auto">
          <PackagePlus className="h-4 w-4" />
          {t('create_shop_item')}
        </Button>
      </CardContent>
    </Card>
  )
}
