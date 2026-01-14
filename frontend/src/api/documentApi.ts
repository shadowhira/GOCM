import httpClient from "@/lib/axios";
import type {
  DocumentResponse,
  GetPaginatedDocumentsRequest,
  UploadDocumentRequest,
  PaginatedDocumentResponse,
} from "@/types/document";

export const documentApi = {
  // GET /api/Document/All - Lấy toàn bộ danh sách document
  getAll: (): Promise<DocumentResponse[]> => httpClient.get("/Document/All"),

  // GET /api/Document/List - Lấy danh sách document có phân trang
  getList: (
    params: GetPaginatedDocumentsRequest
  ): Promise<PaginatedDocumentResponse> =>
    httpClient.get("/Document/List", { params }),

  // GET /api/Document/{id} - Lấy thông tin chi tiết document theo ID
  getById: (id: number): Promise<DocumentResponse> =>
    httpClient.get(`/Document/${id}`),

  // GET /api/Document/Class/{classId} - Lấy danh sách document theo classId
  getByClassId: (classId: number): Promise<DocumentResponse[]> =>
    httpClient.get(`/Document/Class/${classId}`),

  // POST /api/Document - Upload document
  upload: (data: UploadDocumentRequest): Promise<DocumentResponse> => {
    const formData = new FormData();
    formData.append("File", data.file);
    formData.append("ClassId", data.classId.toString());
    if (typeof data.parentType !== 'undefined') {
      formData.append("ParentType", data.parentType.toString());
    }

    return httpClient.post("/Document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // DELETE /api/Document/{id} - Xóa document
  remove: (id: number): Promise<void> => httpClient.delete(`/Document/${id}`),
};
