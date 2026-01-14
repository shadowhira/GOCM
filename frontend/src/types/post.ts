// Post related types based on backend API

import type { AttachmentResponse } from './document'
import type { ClassMemberResponse } from './class'

export enum PostStatus {
  DRAFT = 0,
  PUBLISHED = 1
}

// Base response types
export type PostCreatedBy = ClassMemberResponse

export interface PostResponse {
  id: number
  title: string
  content: string
  createdAt: string
  updatedAt: string | null
  createdBy: ClassMemberResponse
  documents: AttachmentResponse[]
  comments: unknown[]
  classes: unknown[]
  status: PostStatus
  commentCount: number
}

// Request types
export interface CreatePostRequest {
  title: string
  content: string
  documentIds?: number[]
  classIds: number[]
  status?: PostStatus
  createdByClassMemberId: number
}

export interface UpdatePostRequest {
  id: number
  title: string
  content: string
  documentIds?: number[]
  status?: PostStatus
}

export interface GetPaginatedPostsRequest {
  pageNumber?: number
  pageSize?: number
  status?: PostStatus
  createdById?: number
  classId?: number
}

// Frontend display types
export interface PostCardData {
  id: number
  title: string
  content: string
  createdAt: string
  updatedAt: string | null
  author: {
    id: number
    name: string
    email: string
  }
  attachmentCount: number
  commentCount: number
  status: PostStatus
}
