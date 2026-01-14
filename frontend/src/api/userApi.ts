import httpClient from "@/lib/axios";
import type { UserResponse } from "@/types/auth";
import type { ApiMessageResponse } from "@/types/auth";
import type {
  UserResponse as AdminUserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  GetPaginatedUsersRequest,
  PaginatedUsersResponse,
  UpdateUserProfileRequest,
  UploadAvatarResponse,
  ChangePasswordRequest,
} from "@/types/user";

export const userApi = {
  // User profile endpoints (for authenticated users)
  updateProfile: (data: UpdateUserProfileRequest): Promise<UserResponse> =>
    httpClient.patch("/User/me", data),
    
  uploadAvatar: (file: File): Promise<UploadAvatarResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    return httpClient.post("/User/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  uploadAvatarForUser: (userId: number, file: File): Promise<UploadAvatarResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    return httpClient.post(`/User/${userId}/avatar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Admin endpoints for user management
  getAll: (): Promise<AdminUserResponse[]> =>
    httpClient.get('/User/All'),

  getList: (params: GetPaginatedUsersRequest): Promise<PaginatedUsersResponse> =>
    httpClient.get('/User/List', { params }),

  getById: (id: number): Promise<AdminUserResponse> =>
    httpClient.get(`/User/${id}`),

  create: (data: CreateUserRequest): Promise<void> =>
    httpClient.post('/User', data),

  update: (data: UpdateUserRequest): Promise<void> =>
    httpClient.put('/User', data),

  remove: (id: number): Promise<void> =>
    httpClient.delete(`/User/${id}`),

  changePassword: (data: ChangePasswordRequest): Promise<ApiMessageResponse> =>
    httpClient.post('/User/me/change-password', data),
};
