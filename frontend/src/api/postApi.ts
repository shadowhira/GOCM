import httpClient from '@/lib/axios'
import type {
  PostResponse,
  CreatePostRequest,
  UpdatePostRequest,
  GetPaginatedPostsRequest,
} from '@/types/post'

// NOTE: Tạo bài đăng yêu cầu JSON chứa danh sách documentIds đã upload trước.
// File phải được upload trước qua documentApi.upload(classId, ParentType.POST) để lấy documentIds.

export interface PaginatedPostResponse {
  items: PostResponse[]
  totalItems: number
  pageIndex: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export const postApi = {
  // GET /api/Post/All
  getAll: (): Promise<PostResponse[]> => 
    httpClient.get('/Post/All'),

  // GET /api/Post/List
  getList: (params?: GetPaginatedPostsRequest): Promise<PaginatedPostResponse> => 
    httpClient.get('/Post/List', { params }),

  // GET /api/Post/{id}
  getById: (id: number): Promise<PostResponse> => 
    httpClient.get(`/Post/${id}`),

  // POST /api/Post (JSON body)
  create: (data: CreatePostRequest): Promise<void> => 
    httpClient.post('/Post', data),

  // PUT /api/Post
  update: (data: UpdatePostRequest): Promise<void> => 
    httpClient.put('/Post', data),

  // DELETE /api/Post/{id}
  delete: (id: number): Promise<void> => 
    httpClient.delete(`/Post/${id}`),
}
