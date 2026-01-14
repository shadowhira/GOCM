import httpClient from '@/lib/axios';
import type {
  GetPaginatedClassesRequest,
  CreateClassRequest,
  UpdateClassRequest,
  JoinClassRequest,
  ClassResponse,
  ClassMemberResponse,
  PaginatedClassResponse,
  ClassShopItemResponse,
  AddClassShopItemsRequest,
  PurchaseShopItemResponse,
  UpdateClassMemberRequest,
  ClassAppearanceSettingsResponse,
  UpdateClassAppearanceSettingsRequest,
  ClassMemberCosmeticResponse,
  EquipClassCosmeticRequest,
  UploadClassCoverResponse,
  InviteToClassRequest,
} from '@/types/class';

export const classApi = {
  // GET /api/Class/All - Lấy toàn bộ danh sách lớp (không phân trang)
  getAll: (): Promise<ClassResponse[]> => 
    httpClient.get('/Class/All'),

  // GET /api/Class/List - Lấy danh sách lớp có phân trang và filter
  getList: (params?: GetPaginatedClassesRequest): Promise<PaginatedClassResponse> => 
    httpClient.get('/Class/List', { params }),

  // GET /api/Class/{id} - Lấy thông tin chi tiết của một lớp theo ID
  getById: (id: number): Promise<ClassResponse> => 
    httpClient.get(`/Class/${id}`),

  // GET /api/Class/My - Lấy danh sách lớp của user hiện tại
  getMy: (): Promise<ClassResponse[]> => 
    httpClient.get('/Class/My'),

  // GET /api/Class/{id}/Members - Lấy danh sách thành viên trong lớp
  getMembers: (id: number): Promise<ClassMemberResponse[]> => 
    httpClient.get(`/Class/${id}/Members`),

  // GET /api/Class/{id}/AppearanceSettings - Lấy cấu hình hiển thị phần thưởng
  getAppearanceSettings: (id: number): Promise<ClassAppearanceSettingsResponse> =>
    httpClient.get(`/Class/${id}/AppearanceSettings`),

  // POST /api/Class - Tạo mới một lớp
  create: (data: CreateClassRequest): Promise<ClassResponse> => 
    httpClient.post('/Class', data),

  // PUT /api/Class/{id} - Cập nhật thông tin của lớp
  update: (id: number, data: UpdateClassRequest): Promise<void> => 
    httpClient.put(`/Class/${id}`, data),

  // PUT /api/Class/{id}/AppearanceSettings - Cập nhật cấu hình hiển thị phần thưởng
  updateAppearanceSettings: (id: number, data: UpdateClassAppearanceSettingsRequest): Promise<ClassAppearanceSettingsResponse> =>
    httpClient.put(`/Class/${id}/AppearanceSettings`, data),

  // DELETE /api/Class/{id} - Xóa một lớp theo ID
  remove: (id: number): Promise<void> => 
    httpClient.delete(`/Class/${id}`),

  // POST /api/Class/Join - Tham gia vào một lớp bằng join code
  join: (data: JoinClassRequest): Promise<ClassResponse> => 
    httpClient.post('/Class/Join', data),

  // DELETE /api/Class/{id}/Leave - Rời khỏi lớp
  leave: (id: number): Promise<void> => 
    httpClient.delete(`/Class/${id}/Leave`),

  // DELETE /api/Class/{id}/Members/{memberId} - Xóa thành viên khỏi lớp
  removeMember: (classId: number, memberId: number): Promise<void> =>
    httpClient.delete(`/Class/${classId}/Members/${memberId}`),

  // PUT /api/Class/{id}/Members/{memberId} - Cập nhật thông tin thành viên
  updateMember: (classId: number, memberId: number, data: UpdateClassMemberRequest): Promise<ClassMemberResponse> =>
    httpClient.put(`/Class/${classId}/Members/${memberId}`, data),

  // GET /api/Class/{id}/ShopItems - Lấy danh sách vật phẩm trong cửa hàng của lớp
  getShopItems: (classId: number): Promise<ClassShopItemResponse[]> =>
    httpClient.get(`/Class/${classId}/ShopItems`),

  // GET /api/Class/{id}/Cosmetics - Lấy trạng thái trang bị của lớp
  getCosmetics: (classId: number): Promise<ClassMemberCosmeticResponse[]> =>
    httpClient.get(`/Class/${classId}/Cosmetics`),

  // PUT /api/Class/{id}/Cosmetics/Equip - Trang bị hoặc tháo vật phẩm
  equipCosmetic: (classId: number, data: EquipClassCosmeticRequest): Promise<ClassMemberCosmeticResponse> =>
    httpClient.put(`/Class/${classId}/Cosmetics/Equip`, data),

  // POST /api/Class/{id}/ShopItems - Thêm vật phẩm vào cửa hàng của lớp
  addShopItems: (classId: number, data: AddClassShopItemsRequest): Promise<ClassShopItemResponse[]> =>
    httpClient.post(`/Class/${classId}/ShopItems`, data),

  // DELETE /api/Class/{id}/ShopItems/{classShopItemId} - Xóa vật phẩm khỏi cửa hàng lớp
  removeShopItem: (classId: number, classShopItemId: number): Promise<void> =>
    httpClient.delete(`/Class/${classId}/ShopItems/${classShopItemId}`),

  // POST /api/Class/{id}/ShopItems/{shopItemId}/Purchase - Mua vật phẩm bằng điểm
  purchaseShopItem: (classId: number, shopItemId: number): Promise<PurchaseShopItemResponse> =>
    httpClient.post(`/Class/${classId}/ShopItems/${shopItemId}/Purchase`),

  // POST /api/Class/{id}/Cover - Upload ảnh bìa cho lớp học
  uploadCover: (classId: number, file: File): Promise<UploadClassCoverResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return httpClient.post(`/Class/${classId}/Cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // POST /api/Class/{id}/Invite - Mời người dùng vào lớp qua email
  inviteToClass: (classId: number, data: InviteToClassRequest): Promise<void> =>
    httpClient.post(`/Class/${classId}/Invite`, data),
};