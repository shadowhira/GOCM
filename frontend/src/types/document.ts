import { FileType, ParentType, SourceType } from "./constants";
import type { ClassMemberResponse } from "./class";

// Request types
export interface SaveMetadataRequest {
  publicUrl: string;
  fileName: string;
  fileType: FileType;
  parentType: ParentType;
  uploadedByClassMemberId: number;
  classId?: number;
}

// Response types
export interface AttachmentResponse {
  id: number;
  publicUrl: string;
  fileName: string;
  fileType: FileType;
  updatedAt: Date;
  parentType: ParentType;
  filePath: string;
}

// Upload result from Supabase
export interface UploadResult {
  publicUrl: string;
  fileName: string;
  filePath: string;
}

// Document Response (from DocumentResponse.cs)
export interface DocumentResponse {
  id: number;
  publicUrl?: string;
  filePath: string;
  fileName: string;
  fileType: FileType;
  parentType: ParentType;
  uploadedBy: ClassMemberResponse;
  createdAt: Date;
  updatedAt: Date;
}

// Document Collection Item (from DocumentCollectionItem.cs)
export interface DocumentCollectionItemResponse extends DocumentResponse {
  manualDocumentUrl?: string;
  manualFileName?: string;
  addedAt: string;
  sourceType: SourceType;
}

// Document Collection (from DocumentCollection.cs)
export interface DocumentCollectionResponse {
  id: number;
  name: string;
  description?: string;
  owner: {
    id: number;
    userName?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  documents: DocumentCollectionItemResponse[];
}

// Document Collection Item (from DocumentCollectionItem.cs)
export interface DocumentCollectionItemResponse extends DocumentResponse {
  manualDocumentUrl?: string;
  manualFileName?: string;
  addedAt: string;
  sourceType: SourceType;
}

// Document Collection (from DocumentCollection.cs)
export interface DocumentCollectionResponse {
  id: number;
  name: string;
  description?: string;
  owner: {
    id: number;
    userName?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  documents: DocumentCollectionItemResponse[];
}

// Document Collection Item (from DocumentCollectionItem.cs)
export interface DocumentCollectionItemResponse extends DocumentResponse {
  manualDocumentUrl?: string;
  manualFileName?: string;
  addedAt: string;
  sourceType: SourceType;
}

// Document Collection (from DocumentCollection.cs)
export interface DocumentCollectionResponse {
  id: number;
  name: string;
  description?: string;
  owner: {
    id: number;
    userName?: string;
    email?: string;
  };
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  documents: DocumentCollectionItemResponse[];
}

// Paginated Document Response
export interface PaginatedDocumentResponse {
  items: DocumentResponse[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Request types
export interface GetPaginatedDocumentsRequest {
  classId: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface UploadDocumentRequest {
  file: File;
  classId: number;
  parentType?: ParentType; // optional when uploading from Class Documents
}
