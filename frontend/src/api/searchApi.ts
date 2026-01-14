import httpClient from '@/lib/axios';
import type { 
  ClassResponse, 
  ClassMemberResponse 
} from '@/types/class';
import type { PostResponse } from '@/types/post';
import type { DocumentResponse } from '@/types/document';
import type { AssignmentResponse } from '@/types/assignment';

// Search API request types
export interface SearchClassesRequest {
  query: string;
  page?: number;
  pageSize?: number;
}

export interface SearchClassResourcesRequest {
  classId: number;
  query: string;
  type?: 'post' | 'document' | 'assignment' | 'member';
}

// Search API response types
export interface SearchClassesResponse {
  items: ClassResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SearchClassResourcesResponse {
  posts: PostResponse[];
  documents: DocumentResponse[];
  assignments: AssignmentResponse[];
  members: ClassMemberResponse[];
}

// Paginated response type for posts
interface PaginatedPostResponse {
  items: PostResponse[];
  totalItems: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const searchApi = {
  /**
   * Search public classes by name/description
   * For Dashboard context - only public classes
   * Currently using client-side filtering from getAll
   * TODO: Backend should implement dedicated search endpoint with isPublic filter
   */
  searchClasses: async (params: SearchClassesRequest): Promise<SearchClassesResponse> => {
    // Fetch user's classes and filter by query
    // In future, backend should have dedicated search endpoint
    const classes: ClassResponse[] = await httpClient.get('/Class/My');
    
    const query = params.query.toLowerCase().trim();
    const filtered = classes.filter((c: ClassResponse) => 
      c.name.toLowerCase().includes(query) || 
      c.description?.toLowerCase().includes(query)
    );

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return {
      items,
      total: filtered.length,
      page,
      pageSize,
    };
  },

  /**
   * Search resources within a class
   * For Class Detail context - posts, documents, assignments, members
   * Only fetches ONE type at a time to reduce API calls
   */
  searchClassResources: async (params: SearchClassResourcesRequest): Promise<SearchClassResourcesResponse> => {
    const { classId, query, type } = params;
    const q = query.toLowerCase().trim();
    
    // Default empty response
    const emptyResponse: SearchClassResourcesResponse = {
      posts: [],
      documents: [],
      assignments: [],
      members: [],
    };

    // Only fetch the requested type (or posts by default for 'all')
    // This reduces from 4 API calls to 1
    switch (type) {
      case 'post': {
        const response: PaginatedPostResponse = await httpClient.get('/Post/List', { 
          params: { classId, pageSize: 50 } 
        });
        const posts = response.items.filter((p: PostResponse) => 
          p.content?.toLowerCase().includes(q) || 
          p.title?.toLowerCase().includes(q)
        );
        return { ...emptyResponse, posts };
      }
      
      case 'document': {
        const docs: DocumentResponse[] = await httpClient.get(`/Document/Class/${classId}`);
        const documents = docs.filter((d: DocumentResponse) => 
          d.fileName?.toLowerCase().includes(q)
        );
        return { ...emptyResponse, documents };
      }
      
      case 'assignment': {
        const assigns: AssignmentResponse[] = await httpClient.get(`/Assignment/classes/${classId}/All`);
        const assignments = assigns.filter((a: AssignmentResponse) => 
          a.title?.toLowerCase().includes(q) ||
          a.content?.toLowerCase().includes(q)
        );
        return { ...emptyResponse, assignments };
      }
      
      case 'member': {
        const mems: ClassMemberResponse[] = await httpClient.get(`/Class/${classId}/Members`);
        const members = mems.filter((m: ClassMemberResponse) => 
          m.userName?.toLowerCase().includes(q) ||
          m.userEmail?.toLowerCase().includes(q)
        );
        return { ...emptyResponse, members };
      }
      
      default: {
        // For 'all' filter, default to searching posts first (most common use case)
        // User can switch filters to search other types
        const response: PaginatedPostResponse = await httpClient.get('/Post/List', { 
          params: { classId, pageSize: 50 } 
        });
        const posts = response.items.filter((p: PostResponse) => 
          p.content?.toLowerCase().includes(q)
        );
        return { ...emptyResponse, posts };
      }
    }
  },
};
