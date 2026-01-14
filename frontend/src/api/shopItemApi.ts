import httpClient from '@/lib/axios'
import type {
  ShopItem,
  CreateShopItemRequest,
  UpdateShopItemRequest,
  GetPaginatedShopItemsRequest,
  PaginatedShopItemsResponse,
  UploadShopItemIconResponse,
} from '@/types/shopItem'

export const shopItemApi = {
  /**
   * Get all shop items
   * GET /api/ShopItem/All
   */
  getAll: (): Promise<ShopItem[]> =>
    httpClient.get('/ShopItem/All'),

  /**
   * Get paginated shop items list
   * GET /api/ShopItem/List
   */
  getList: (params: GetPaginatedShopItemsRequest): Promise<PaginatedShopItemsResponse> =>
    httpClient.get('/ShopItem/List', { params }),

  /**
   * Get shop item by ID
   * GET /api/ShopItem/{id}
   */
  getById: (id: number): Promise<ShopItem> =>
    httpClient.get(`/ShopItem/${id}`),

  /**
   * Create new shop item
   * POST /api/ShopItem
   */
  create: (data: CreateShopItemRequest): Promise<void> =>
    httpClient.post('/ShopItem', data),

  /**
   * Update shop item
   * PUT /api/ShopItem/{id}
   */
  update: (id: number, data: UpdateShopItemRequest): Promise<void> =>
    httpClient.put(`/ShopItem/${id}`, data),

  /**
   * Delete shop item
   * DELETE /api/ShopItem/{id}
   */
  remove: (id: number): Promise<void> =>
    httpClient.delete(`/ShopItem/${id}`),

  /**
   * Upload shop item icon
   * POST /api/ShopItem/UploadIcon
   */
  uploadIcon: (file: File): Promise<UploadShopItemIconResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    return httpClient.post('/ShopItem/UploadIcon', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
