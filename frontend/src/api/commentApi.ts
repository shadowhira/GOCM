import httpClient from '@/lib/axios'
import type {
  CommentResponse,
  PaginatedCommentResponse,
  CreateCommentRequest,
  UpdateCommentRequest,
  GetPaginatedCommentsRequest,
} from '@/types/comment'

export const commentApi = {
  // GET /api/Comment/List
  getList: (params: GetPaginatedCommentsRequest): Promise<PaginatedCommentResponse> => 
    httpClient.get('/Comment/List', { params }),

  // GET /api/Comment/{id}
  getById: (id: number): Promise<CommentResponse> => 
    httpClient.get(`/Comment/${id}`),

  // POST /api/Comment
  create: (data: CreateCommentRequest): Promise<void> => 
    httpClient.post('/Comment', data),

  // PUT /api/Comment
  update: (data: UpdateCommentRequest): Promise<void> => 
    httpClient.put('/Comment', data),

  // DELETE /api/Comment/{id}
  delete: (id: number): Promise<void> => 
    httpClient.delete(`/Comment/${id}`),
}
