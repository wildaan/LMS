import api from "@/lib/api";

export interface ContentItem {
  content_id: number;
  content_uuid?: string;
  content_title: string;
  content_description?: string | null;
  content_category?: string | null;
  content_status?: number;
  content_create_date?: string | null;
  content_create_by?: string | null;
  content_update_date?: string | null;
  content_update_by?: string | null;
}

export interface ContentQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface ContentListResponse {
  success: boolean;
  message: string;
  data: {
    items: ContentItem[];
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
  };
}

export interface ContentDetailResponse {
  success: boolean;
  message: string;
  data: ContentItem;
}

export interface ContentPayload {
  content_title: string;
  content_description?: string;
  content_category?: string;
}

export const contentService = {
  getContents: async (params?: ContentQueryParams): Promise<ContentListResponse> => {
    const response = await api.get<ContentListResponse>("/api/content", { params });
    return response.data;
  },

  getContentById: async (id: number | string): Promise<ContentDetailResponse> => {
    const response = await api.get<ContentDetailResponse>(`/api/content/${id}`);
    return response.data;
  },

  createContent: async (data: ContentPayload): Promise<ContentDetailResponse> => {
    const response = await api.post<ContentDetailResponse>("/api/content", data);
    return response.data;
  },

  updateContent: async (id: number | string, data: ContentPayload): Promise<ContentDetailResponse> => {
    const response = await api.put<ContentDetailResponse>(`/api/content/${id}`, data);
    return response.data;
  },

  deleteContent: async (id: number | string): Promise<{ success: boolean; message: string; data: null }> => {
    const response = await api.delete<{ success: boolean; message: string; data: null }>(`/api/content/${id}`);
    return response.data;
  },
};
