import axiosClient from "@/api/axioxClient";

// Types
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  author: string;
  status: "published" | "draft";
  views: number;
  likes: number;
  comments: number;
  category: string;
  tags: string[];
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsRequest {
  title: string;
  content: string;
  category: string;
  tags: string[];
  images?: string[];
}

export interface UpdateNewsRequest extends Partial<CreateNewsRequest> {
  status?: "published" | "draft";
}

export interface NewsListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
}

export interface NewsStats {
  total: number;
  published: number;
  draft: number;
  totalViews: number;
}

// API Functions
export const newsApi = {
  // Create new news article
  createNews: async (data: CreateNewsRequest) => {
    return axiosClient.post('/news', data);
  },

  // Get news list with pagination and filters
  getNewsList: async (params: NewsListParams = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.category) queryParams.append('category', params.category);

    return axiosClient.get(`/news?${queryParams.toString()}`);
  },

  // Get news by ID
  getNewsById: async (id: string) => {
    return axiosClient.get(`/news/${id}`);
  },

  // Update news article
  updateNews: async (id: string, data: UpdateNewsRequest) => {
    return axiosClient.put(`/news/${id}`, data);
  },

  // Delete news article
  deleteNews: async (id: string) => {
    return axiosClient.delete(`/news/${id}`);
  },

  // Get news statistics
  getNewsStats: async () => {
    return axiosClient.get('/news/stats');
  },

  // Export news data
  exportNews: async (format: 'excel' | 'csv' = 'excel') => {
    return axiosClient.get(`/news/export?format=${format}`, {
      responseType: 'blob'
    });
  }
};

