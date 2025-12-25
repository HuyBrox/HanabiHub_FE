/**
 * API Configuration
 * Uses environment variables from .env file
 * 
 * Required .env variables:
 * - NEXT_PUBLIC_API_URL: Backend API base URL (default: http://localhost:8080/api/v1)
 * - NEXT_PUBLIC_BACKEND_HEALTH_CHECK: Health check endpoint (default: http://localhost:8080/testServer)
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  HEALTH_CHECK: process.env.NEXT_PUBLIC_BACKEND_HEALTH_CHECK || "http://localhost:8080/testServer",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

/**
 * API Endpoints
 * All endpoints are relative to API_CONFIG.BASE_URL
 */
export const API_ENDPOINTS = {
  // Notifications
  NOTIFICATIONS: {
    SEND_SYSTEM: '/notifications/send-system',
    SEND_SPECIFIC: '/notifications/send-specific',
    SCHEDULE: '/notifications/schedule',
    HISTORY: '/notifications/history',
    STATS: '/notifications/stats',
    MY: '/notifications/my', // User's own notifications
    MARK_AS_READ: (id: string) => `/notifications/${id}/read`,
    UPDATE: (id: string) => `/notifications/${id}`,
    DELETE: (id: string) => `/notifications/${id}`,
    SCHEDULED: '/notifications/scheduled',
    SCHEDULED_UPDATE: (id: string) => `/notifications/scheduled/${id}`,
    SCHEDULED_CANCEL: (id: string) => `/notifications/scheduled/${id}`,
    SCHEDULED_STATS: '/notifications/scheduled/stats',
  },
  
  // News
  NEWS: {
    CREATE: '/news',
    LIST: '/news',
    GET_BY_ID: (id: string) => `/news/${id}`,
    UPDATE: (id: string) => `/news/${id}`,
    DELETE: (id: string) => `/news/${id}`,
    STATS: '/news/stats',
  },
  
  // Reports
  REPORTS: {
    LIST: '/reports',
    GET_BY_ID: (id: string) => `/reports/${id}`,
    APPROVE: (id: string) => `/reports/${id}/approve`,
    REJECT: (id: string) => `/reports/${id}/reject`,
    STATS: '/reports/stats',
  },
  
  // Templates
  TEMPLATES: {
    CREATE: '/templates',
    LIST: '/templates',
    GET_BY_ID: (id: string) => `/templates/${id}`,
    UPDATE: (id: string) => `/templates/${id}`,
    DELETE: (id: string) => `/templates/${id}`,
    USE: (id: string) => `/templates/${id}/use`,
    STATS: '/templates/stats',
  },
  
  // Users
  USERS: {
    SEARCH: '/users/search',
    STATS: '/users/stats'
  },
  
  // Export
  EXPORT: {
    NEWS: '/export/news',
    REPORTS: '/export/reports',
    NOTIFICATIONS: '/export/notifications',
    TEMPLATES: '/export/templates',
  }
};

/**
 * Health Check Function
 * Checks if backend server is running
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_CONFIG.HEALTH_CHECK);
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}; 