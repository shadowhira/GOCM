export enum ShopItemVisualType {
  AvatarFrame = 0,
  ChatFrame = 1,
  NameBadge = 2,
}

export enum ShopItemTier {
  Basic = 0,
  Advanced = 1,
  Elite = 2,
  Legendary = 3,
}

export interface ShopItem {
  id: number
  name: string
  description?: string
  costInPoints: number
  iconUrl: string
  usageDurationDays: number
  visualType: ShopItemVisualType
  tier: ShopItemTier
  isDefault: boolean
  configJson?: string
  createdAt?: string
  updatedAt?: string | null
}

export interface CreateShopItemRequest {
  name: string
  description?: string
  costInPoints: number
  iconUrl?: string
  usageDurationDays: number
  visualType: ShopItemVisualType
  tier: ShopItemTier
  isDefault?: boolean
  configJson?: string
}

export interface UpdateShopItemRequest extends CreateShopItemRequest {
  id: number
}

export interface GetPaginatedShopItemsRequest {
  pageNumber?: number
  pageSize?: number
  keyword?: string
}

export interface PaginatedShopItemsResponse {
  items: ShopItem[]
  totalItems: number
  pageIndex: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface UploadShopItemIconResponse {
  iconUrl: string
}
