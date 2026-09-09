import api from "@/lib/api";

/**
 * Content Management Service Layer (Skeleton / Placeholder)
 * TODO: Implement API caller methods for CRUD and pagination/search
 */

export interface ContentItem {
  content_id?: number;
  title: string;
  description?: string;
  category?: string;
  status?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ContentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export const contentService = {
  /**
   * Fetch contents with search & pagination
   * TODO: Connect to BE /api/contents
   */
  getContents: async (params?: ContentQueryParams) => {
    // TODO: return api.get('/api/contents', { params });
    console.log("TODO: Fetch contents with params:", params);
    return Promise.resolve({ data: [] });
  },

  /**
   * Fetch content detail by ID
   * TODO: Connect to BE /api/contents/:id
   */
  getContentById: async (id: number | string) => {
    // TODO: return api.get(`/api/contents/${id}`);
    console.log("TODO: Fetch content detail:", id);
    return Promise.resolve({ data: null });
  },

  /**
   * Create new content
   * TODO: Connect to BE /api/contents
   */
  createContent: async (data: ContentItem) => {
    // TODO: return api.post('/api/contents', data);
    console.log("TODO: Create content:", data);
    return Promise.resolve({ success: true });
  },

  /**
   * Update existing content
   * TODO: Connect to BE /api/contents/:id
   */
  updateContent: async (id: number | string, data: Partial<ContentItem>) => {
    // TODO: return api.put(`/api/contents/${id}`, data);
    console.log("TODO: Update content:", id, data);
    return Promise.resolve({ success: true });
  },

  /**
   * Delete content
   * TODO: Connect to BE /api/contents/:id
   */
  deleteContent: async (id: number | string) => {
    // TODO: return api.delete(`/api/contents/${id}`);
    console.log("TODO: Delete content:", id);
    return Promise.resolve({ success: true });
  },
};
