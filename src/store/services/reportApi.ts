import axiosClient from "@/api/axioxClient";

// Types
export interface ReportItem {
  _id: string;
  reason: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  priority: "low" | "medium" | "high";
  reporter: {
    name: string;
    email: string;
  };
  reportedUser: {
    name: string;
    email: string;
  };
  adminNote?: string;
  createdAt: string;
}

export interface ReportStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  highPriority: number;
}

// API Functions using axiosClient (with cookie authentication)
export const reportApi = {
  // Get reports list
  getReportsList: async (params: { page?: number; limit?: number; search?: string; status?: string } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);

    const response: any = await axiosClient.get(`/reports?${queryParams.toString()}`);
    
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

  // Approve report
  approveReport: async (id: string, data: { adminNote: string }) => {
    return axiosClient.put(`/reports/${id}/approve`, data);
  },

  // Reject report
  rejectReport: async (id: string, data: { adminNote: string }) => {
    return axiosClient.put(`/reports/${id}/reject`, data);
  },

  // Get report stats
  getReportStats: async () => {
    return axiosClient.get('/reports/stats');
  },

  // Export reports
  exportReports: async (format: 'excel' | 'csv' = 'excel') => {
    return axiosClient.get(`/reports/export?format=${format}`, {
      responseType: 'blob'
    });
  }
};