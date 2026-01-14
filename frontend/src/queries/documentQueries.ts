import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentApi } from "@/api/documentApi";
import type {
  GetPaginatedDocumentsRequest,
  UploadDocumentRequest,
} from "@/types/document";

// ============ QUERY KEYS ============
export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (params: GetPaginatedDocumentsRequest) =>
    [...documentKeys.lists(), params] as const,
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (id: number) => [...documentKeys.details(), id] as const,
  byClass: (classId: number) =>
    [...documentKeys.all, "class", classId] as const,
} as const;

// ============ QUERIES (GET) ============

/**
 * Lấy toàn bộ danh sách document
 */
export const useGetAllDocuments = () => {
  return useQuery({
    queryKey: documentKeys.all,
    queryFn: () => documentApi.getAll(),
  });
};

/**
 * Lấy danh sách document có phân trang
 */
export const useGetDocumentList = (params: GetPaginatedDocumentsRequest) => {
  return useQuery({
    queryKey: documentKeys.list(params),
    queryFn: () => documentApi.getList(params),
    enabled: !!params.classId,
  });
};

/**
 * Lấy thông tin chi tiết document theo ID
 */
export const useGetDocumentById = (id: number) => {
  return useQuery({
    queryKey: documentKeys.detail(id),
    queryFn: () => documentApi.getById(id),
    enabled: !!id,
  });
};

/**
 * Lấy danh sách document theo classId
 */
export const useGetDocumentsByClassId = (classId: number) => {
  return useQuery({
    queryKey: documentKeys.byClass(classId),
    queryFn: () => documentApi.getByClassId(classId),
    enabled: !!classId,
  });
};

// ============ MUTATIONS (POST/DELETE) ============

/**
 * Upload document
 */
export const useUploadDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadDocumentRequest) => documentApi.upload(data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
      queryClient.invalidateQueries({
        queryKey: documentKeys.byClass(variables.classId),
      });
      queryClient.invalidateQueries({
        queryKey: documentKeys.list({ classId: variables.classId }),
      });
    },
  });
};

/**
 * Xóa document
 */
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => documentApi.remove(id),
    onSuccess: () => {
      // Invalidate all document queries
      queryClient.invalidateQueries({ queryKey: documentKeys.all });
    },
  });
};
