import axiosClient from "@/api/axioxClient";

// Types
export interface ReportItem {
  id: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  reportedUser: {
    id: string;
    name: string;
    email: string;
  };
  reason: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  category: "spam" | "content" | "harassment" | "fraud" | "copyright";
  priority: "low" | "medium" | "high";
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReportListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
  category?: string;
}

export interface ReportStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  highPriority: number;
}

export interface ReportActionRequest {
  adminNote: string;
}

// API Functions
export const reportApi = {
  // Get reports list with pagination and filters
  getReportsList: async (params: ReportListParams = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.category) queryParams.append('category', params.category);

    return axiosClient.get(`/reports?${queryParams.toString()}`);
  },

  // Get report by ID
  getReportById: async (id: string) => {
    return axiosClient.get(`/reports/${id}`);
  },

  // Approve report
  approveReport: async (id: string, data: ReportActionRequest) => {
    return axiosClient.put(`/reports/${id}/approve`, data);
  },

  // Reject report
  rejectReport: async (id: string, data: ReportActionRequest) => {
    return axiosClient.put(`/reports/${id}/reject`, data);
  },

  // Get report statistics
  getReportStats: async () => {
    return axiosClient.get('/reports/stats');
  },

  // Export reports data
  exportReports: async (format: 'excel' | 'csv' = 'excel') => {
    return axiosClient.get(`/reports/export?format=${format}`, {
      responseType: 'blob'
    });
  }
};

