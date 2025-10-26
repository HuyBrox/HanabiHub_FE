import axiosClient from "@/api/axioxClient";

// Types
export interface NotificationRequest {
  title: string;
  message: string;
  type: "system" | "personal" | "maintenance" | "course" | "security" | "contest";
  recipientIds?: string[];
}

export interface NotificationHistory {
  _id: string;
  title: string;
  message: string;
  type: string;
  recipients: string | number;
  recipientCount: number;
  sentBy: string;
  sentAt: string;
  status: "sent" | "pending";
}

export interface NotificationStats {
  total: number;
  system: number;
  personal: number;
  totalRecipients: number;
}

// API Functions using axiosClient (with cookie authentication)
export const notificationApi = {
  // Send system notification
  sendSystemNotification: async (data: NotificationRequest) => {
    // Transform frontend format to backend format
    const payload = {
      title: data.title,
      content: data.message, // Backend expects "content" not "message"
    };
    return axiosClient.post('/notifications/send-system', payload);
  },

  // Send specific notification
  sendSpecificNotification: async (data: NotificationRequest) => {
    // Transform frontend format to backend format
    const payload = {
      title: data.title,
      content: data.message, // Backend expects "content" not "message"
      userIds: data.recipientIds, // Backend expects "userIds" not "recipientIds"
    };
    return axiosClient.post('/notifications/send-specific', payload);
  },

  // Get notification history
  getNotificationHistory: async (params: { page?: number; limit?: number; search?: string; type?: string } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.type) queryParams.append('type', params.type);

    const response: any = await axiosClient.get(`/notifications/history?${queryParams.toString()}`);
    
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

  // Get notification stats
  getNotificationStats: async () => {
    return axiosClient.get('/notifications/stats');
  },

  // Export notification history
  exportNotificationHistory: async (format: 'excel' | 'csv' = 'excel') => {
    return axiosClient.get(`/notifications/export?format=${format}`, {
      responseType: 'blob'
    });
  }
};