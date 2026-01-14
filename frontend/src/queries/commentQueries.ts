import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { commentApi } from '@/api/commentApi'
import type {
  CreateCommentRequest,
  UpdateCommentRequest,
  GetPaginatedCommentsRequest,
} from '@/types/comment'

// Query keys
export const commentKeys = {
  all: ['comments'] as const,
  lists: () => [...commentKeys.all, 'list'] as const,
  list: (params: GetPaginatedCommentsRequest) => [...commentKeys.lists(), params] as const,
  replies: (parentId: number) => [...commentKeys.lists(), 'replies', parentId] as const,
  details: () => [...commentKeys.all, 'detail'] as const,
  detail: (id: number) => [...commentKeys.details(), id] as const,
}

// Queries
export const useGetCommentList = (params: GetPaginatedCommentsRequest) => {
  return useQuery({
    queryKey: commentKeys.list(params),
    queryFn: () => commentApi.getList(params),
    enabled: !!params.postId,
  })
}

export const useGetInfiniteCommentList = (params: Omit<GetPaginatedCommentsRequest, 'pageNumber'>) => {
  return useInfiniteQuery({
    queryKey: [...commentKeys.lists(), 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      commentApi.getList({ ...params, pageNumber: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const hasMore = lastPage.pageIndex < lastPage.totalPages
      return hasMore ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
    enabled: !!params.postId,
  })
}

export const useGetInfiniteCommentReplies = (
  params: { postId: number; parentCommentId: number; pageSize?: number },
  options?: { enabled?: boolean }
) => {
  return useInfiniteQuery({
    queryKey: [...commentKeys.replies(params.parentCommentId), params.postId, params.pageSize],
    queryFn: ({ pageParam = 1 }) =>
      commentApi.getList({
        postId: params.postId,
        parentCommentId: params.parentCommentId,
        pageNumber: pageParam,
        pageSize: params.pageSize,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const hasMore = lastPage.pageIndex < lastPage.totalPages
      return hasMore ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
    enabled: (options?.enabled ?? true) && Boolean(params.postId && params.parentCommentId),
  })
}

export const useGetCommentById = (
  id: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: commentKeys.detail(id),
    queryFn: () => commentApi.getById(id),
    enabled: !!id && (options?.enabled ?? true),
  })
}

// Lightweight count fetcher using paginated list totalItems
export const useGetCommentCount = (
  postId: number,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...commentKeys.lists(), 'count', postId],
    queryFn: () => commentApi.getList({ postId, pageNumber: 1, pageSize: 1 }),
    enabled: !!postId && (options?.enabled ?? true),
    select: (res) => res.totalItems,
    // Short stale time to keep count fresh; rely on mutation invalidation
    staleTime: 5_000,
  })
}

// Mutations
export const useCreateComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCommentRequest) => commentApi.create(data),
    onSuccess: () => {
      // Invalidate all comment-related queries including count
      queryClient.invalidateQueries({
        predicate: (query) => Array.isArray(query.queryKey) &&
          query.queryKey[0] === 'comments'
      })
    },
  })
}

export const useUpdateComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateCommentRequest) => commentApi.update(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: commentKeys.detail(variables.id) })
      queryClient.invalidateQueries({
        predicate: (query) => Array.isArray(query.queryKey) &&
          query.queryKey[0] === 'comments'
      })
    },
  })
}

export const useDeleteComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => commentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => Array.isArray(query.queryKey) &&
          query.queryKey[0] === 'comments'
      })
    },
  })
}
