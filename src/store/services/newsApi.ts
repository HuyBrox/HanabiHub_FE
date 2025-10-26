import axiosClient from "@/api/axioxClient";

// Types
export interface NewsItem {
  _id: string;
  title: string;
  content: string;
  author: string | { _id: string; fullname: string; username: string };
  status: "published" | "draft";
  views?: number;
  likes?: number;
  comments?: number;
  category?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsRequest {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export interface UpdateNewsRequest {
  title?: string;
  content?: string;
  status?: "published" | "draft";
}

export interface NewsStats {
  total: number;
  published: number;
  draft: number;
  totalViews: number;
}

// API Functions using axiosClient (with cookie authentication)
export const newsApi = {
  // Get news list
  getNewsList: async (params: { page?: number; limit?: number; search?: string; status?: string } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);

    const response: any = await axiosClient.get(`/news?${queryParams.toString()}`);
    
    // Transform backend response to frontend expected format
    if (response.success && response.data) {
      const { items, total, page, limit } = response.data;
      return {
        success: true,
        data: items || [],
        pagination: {
          page: page || 1,
          limit: limit || 20,
          total: total || 0,
          totalPages: Math.ceil((total || 0) / (limit || 20))
        }
      };
    }
    
    return response;
  },

  // Create news
  createNews: async (data: CreateNewsRequest) => {
    return axiosClient.post('/news', data);
  },

  // Update news
  updateNews: async (id: string, data: UpdateNewsRequest) => {
    return axiosClient.put(`/news/${id}`, data);
  },

  // Delete news
  deleteNews: async (id: string) => {
    return axiosClient.delete(`/news/${id}`);
  },

  // Get news stats
  getNewsStats: async () => {
    return axiosClient.get('/news/stats');
  },

  // Export news
  exportNews: async (format: 'excel' | 'csv' = 'excel') => {
    return axiosClient.get(`/news/export?format=${format}`, {
      responseType: 'blob'
    });
  }
};