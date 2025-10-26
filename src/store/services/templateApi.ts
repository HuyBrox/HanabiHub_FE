import axiosClient from "@/api/axioxClient";

// Types
export interface TemplateItem {
  _id: string;
  name: string;
  title: string;
  message: string;
  type: "system" | "personal" | "achievement" | "maintenance" | "security" | "course";
  usageCount: number;
  createdAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  title: string;
  message: string;
  type: string;
}

export interface TemplateStats {
  total: number;
  system: number;
  personal: number;
  totalUsage: number;
}

// API Functions using axiosClient (with cookie authentication)
export const templateApi = {
  // Get templates list
  getTemplatesList: async (params: { search?: string; type?: string } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.type) queryParams.append('type', params.type);

    const response: any = await axiosClient.get(`/templates?${queryParams.toString()}`);
    
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

  // Create template
  createTemplate: async (data: CreateTemplateRequest) => {
    return axiosClient.post('/templates', data);
  },

  // Update template
  updateTemplate: async (id: string, data: CreateTemplateRequest) => {
    return axiosClient.put(`/templates/${id}`, data);
  },

  // Delete template
  deleteTemplate: async (id: string) => {
    return axiosClient.delete(`/templates/${id}`);
  },

  // Use template
  useTemplate: async (id: string) => {
    return axiosClient.post(`/templates/${id}/use`);
  },

  // Get template stats
  getTemplateStats: async () => {
    return axiosClient.get('/templates/stats');
  },

  // Export templates
  exportTemplates: async (format: 'excel' | 'csv' = 'excel') => {
    return axiosClient.get(`/templates/export?format=${format}`, {
      responseType: 'blob'
    });
  }
};
