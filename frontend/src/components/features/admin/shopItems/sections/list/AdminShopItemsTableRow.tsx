'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { Pencil, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ShopItem } from '@/types/shopItem'
import { ShopItemTier, ShopItemVisualType } from '@/types/shopItem'

interface AdminShopItemsTableRowProps {
  item: ShopItem
  onEdit: (shopItemId: number) => void
  onDelete: (shopItemId: number) => void
}

export const AdminShopItemsTableRow = ({ item, onEdit, onDelete }: AdminShopItemsTableRowProps) => {
  const t = useTranslations()
  const normalizedName = item.name.trim()
  const visualTypeLabel = (() => {
    switch (item.visualType) {
      case ShopItemVisualType.AvatarFrame:
        return t('shop_item_visual_avatar_frame')
      case ShopItemVisualType.ChatFrame:
        return t('shop_item_visual_chat_frame')
      case ShopItemVisualType.NameBadge:
      default:
        return t('shop_item_visual_name_badge')
    }
  })()

  const tierLabel = (() => {
    switch (item.tier) {
      case ShopItemTier.Advanced:
        return t('shop_item_tier_advanced')
      case ShopItemTier.Elite:
        return t('shop_item_tier_elite')
      case ShopItemTier.Legendary:
        return t('shop_item_tier_legendary')
      case ShopItemTier.Basic:
      default:
        return t('shop_item_tier_basic')
    }
  })()

  return (
    <TableRow className="hover:bg-muted/40">
      <TableCell className="pl-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            {item.iconUrl ? (
              <AvatarImage src={item.iconUrl} alt={normalizedName || 'Shop item'} />
            ) : (
              <AvatarFallback className="bg-secondary-100 text-secondary-700">
                {normalizedName ? normalizedName.charAt(0).toUpperCase() : 'S'}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="font-medium text-foreground">{normalizedName || t('undefined')}</p>
            <p className="text-xs text-muted-foreground">ID: {item.id}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs uppercase">
                {visualTypeLabel}
              </Badge>
              <Badge variant="secondary" className="text-xs font-semibold">
                {tierLabel}
              </Badge>
              {item.isDefault ? (
                <Badge variant="success" className="text-xs font-semibold uppercase">
                  {t('default_label')}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {item.description?.trim() || t('undefined')}
        </p>
      </TableCell>
      <TableCell className="text-right">
        <Badge variant="accent" className="justify-end text-xs">
          {item.costInPoints} {t('points')}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-sm font-medium text-foreground">
          {t('usage_duration_value', { count: item.usageDurationDays })}
        </span>
      </TableCell>
      <TableCell className="pr-6 text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            aria-label={t('edit_shop_item')}
            onClick={() => onEdit(item.id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={t('delete_shop_item')}
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
