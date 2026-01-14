export type ShopItemModalMode = 'none' | 'create' | 'edit' | 'delete'

export interface ShopItemHashState {
  mode: ShopItemModalMode
  shopItemId?: number
}
