import axiosClient from "@/api/axioxClient";

// Types
export interface TemplateItem {
  id: string;
  name: string;
  title: string;
  message: string;
  type: "system" | "personal" | "achievement" | "maintenance" | "security" | "course" | "contest";
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  title: string;
  message: string;
  type: "system" | "personal" | "achievement" | "maintenance" | "security" | "course" | "contest";
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {}

export interface TemplateListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}

export interface TemplateStats {
  total: number;
  system: number;
  personal: number;
  totalUsage: number;
}

// API Functions
export const templateApi = {
  // Create new template
  createTemplate: async (data: CreateTemplateRequest) => {
    return axiosClient.post('/templates', data);
  },

  // Get templates list with pagination and filters
  getTemplatesList: async (params: TemplateListParams = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.type) queryParams.append('type', params.type);

    return axiosClient.get(`/templates?${queryParams.toString()}`);
  },

  // Get template by ID
  getTemplateById: async (id: string) => {
    return axiosClient.get(`/templates/${id}`);
  },

  // Update template
  updateTemplate: async (id: string, data: UpdateTemplateRequest) => {
    return axiosClient.put(`/templates/${id}`, data);
  },

  // Delete template
  deleteTemplate: async (id: string) => {
    return axiosClient.delete(`/templates/${id}`);
  },

  // Use template (increment usage count)
  useTemplate: async (id: string) => {
    return axiosClient.post(`/templates/${id}/use`);
  },

  // Get template statistics
  getTemplateStats: async () => {
    return axiosClient.get('/templates/stats');
  },

  // Export templates data
  exportTemplates: async (format: 'excel' | 'csv' = 'excel') => {
    return axiosClient.get(`/templates/export?format=${format}`, {
      responseType: 'blob'
    });
  }
};

