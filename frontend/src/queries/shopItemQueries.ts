import { useQuery } from '@tanstack/react-query'
import { shopItemApi } from '@/api/shopItemApi'
import type { GetPaginatedShopItemsRequest } from '@/types/shopItem'

export const shopItemKeys = {
  all: () => ['shop-items'] as const,
  list: (params?: GetPaginatedShopItemsRequest) => [...shopItemKeys.all(), 'list', params] as const,
  detail: (id: number) => [...shopItemKeys.all(), 'detail', id] as const,
} as const

export const useGetAllShopItems = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: shopItemKeys.all(),
    queryFn: () => shopItemApi.getAll(),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5,
  })
}
