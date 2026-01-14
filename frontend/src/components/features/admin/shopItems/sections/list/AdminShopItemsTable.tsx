'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useTranslations } from 'next-intl'
import type { ShopItem } from '@/types/shopItem'
import { AdminShopItemsTableRow } from './AdminShopItemsTableRow'

interface AdminShopItemsTableProps {
  items: ShopItem[]
  onEdit: (shopItemId: number) => void
  onDelete: (shopItemId: number) => void
}

export const AdminShopItemsTable = ({ items, onEdit, onDelete }: AdminShopItemsTableProps) => {
  const t = useTranslations()

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-6">{t('item_name')}</TableHead>
              <TableHead>{t('item_description')}</TableHead>
              <TableHead className="w-32 text-right">{t('cost_in_points')}</TableHead>
              <TableHead className="w-52 text-right">{t('usage_duration_days')}</TableHead>
              <TableHead className="w-40 pr-6 text-right">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <AdminShopItemsTableRow key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
