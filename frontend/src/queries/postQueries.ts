import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { postApi } from '@/api/postApi'
import type {
  CreatePostRequest,
  UpdatePostRequest,
  GetPaginatedPostsRequest,
} from '@/types/post'

// Query keys
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (params: GetPaginatedPostsRequest) => [...postKeys.lists(), params] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: number) => [...postKeys.details(), id] as const,
}

// Queries
export const useGetAllPosts = () => {
  return useQuery({
    queryKey: postKeys.all,
    queryFn: () => postApi.getAll(),
  })
}

export const useGetPostList = (params: GetPaginatedPostsRequest) => {
  return useQuery({
    queryKey: postKeys.list(params),
    queryFn: () => postApi.getList(params),
  })
}

export const useGetInfinitePostList = (params: Omit<GetPaginatedPostsRequest, 'pageNumber'>) => {
  return useInfiniteQuery({
    queryKey: [...postKeys.lists(), 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      postApi.getList({ ...params, pageNumber: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      // Kiểm tra còn trang tiếp theo không (pageIndex bắt đầu từ 1)
      const hasMore = lastPage.pageIndex < lastPage.totalPages
      return hasMore ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
  })
}

export const useGetPostById = (id: number) => {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postApi.getById(id),
    enabled: !!id,
  })
}

// Mutations
export const useCreatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePostRequest) => postApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}

export const useUpdatePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdatePostRequest) => postApi.update(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: postKeys.lists() })
    },
  })
}

export const useDeletePost = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => postApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}
