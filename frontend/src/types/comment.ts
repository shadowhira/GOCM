import type { AttachmentResponse } from './document'
import type { ClassMemberResponse } from './class'

// Response types
export interface CommentReplyPreview {
  id: number
  content: string
  createdAt: string
  updatedAt: string | null
  createdBy: ClassMemberResponse
  document: AttachmentResponse | null
}

export interface CommentResponse {
  id: number
  content: string
  createdAt: string
  updatedAt: string | null
  createdBy: ClassMemberResponse
  parentCommentId: number | null
  document: AttachmentResponse | null
  replyCount: number
  latestReplies: CommentReplyPreview[]
}

// Request types
export interface CreateCommentRequest {
  postId: number
  content: string
  parentCommentId?: number
  createdByClassMemberId: number
  documentId?: number
}

export interface UpdateCommentRequest {
  id: number
  content: string
  documentId?: number // null: không thay đổi, 0: xóa document
}

export interface GetPaginatedCommentsRequest {
  postId: number
  pageNumber?: number
  pageSize?: number
  parentCommentId?: number
}

// Paginated response
export interface PaginatedCommentResponse {
  items: CommentResponse[]
  totalItems: number
  pageIndex: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}
