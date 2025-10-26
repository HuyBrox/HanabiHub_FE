import axiosClient from "@/api/axioxClient";

// Types
export interface NotificationRequest {
  title: string;
  message: string;
  type: "system" | "personal" | "maintenance" | "course" | "security" | "contest";
  recipientIds?: string[];
  recipients?: "all" | "specific";
}

export interface ScheduledNotificationRequest extends NotificationRequest {
  scheduledDate: string;
}

export interface NotificationHistory {
  id: string;
  title: string;
  message: string;
  type: string;
  recipients: string;
  recipientCount: number;
  sentBy: string;
  status: "sent" | "pending" | "failed";
  sentAt: string;
}

export interface NotificationStats {
  total: number;
  system: number;
  personal: number;
  totalRecipients: number;
}

export interface NotificationHistoryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}

// API Functions
export const notificationApi = {
  // Send system notification to all users
  sendSystemNotification: async (data: Omit<NotificationRequest, 'recipientIds' | 'recipients'>) => {
    return axiosClient.post('/notifications/send-system', {
      ...data,
      type: "system"
    });
  },

  // Send notification to specific users
  sendSpecificNotification: async (data: Omit<NotificationRequest, 'recipients'>) => {
    return axiosClient.post('/notifications/send-specific', {
      ...data,
      type: "personal"
    });
  },

  // Schedule notification
  scheduleNotification: async (data: ScheduledNotificationRequest) => {
    return axiosClient.post('/notifications/schedule', data);
  },

  // Get notification history
  getNotificationHistory: async (params: NotificationHistoryParams = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.type) queryParams.append('type', params.type);

    return axiosClient.get(`/notifications/history?${queryParams.toString()}`);
  },

  // Get notification statistics
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

