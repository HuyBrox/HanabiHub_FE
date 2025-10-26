// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  HEALTH_CHECK: process.env.NEXT_PUBLIC_BACKEND_HEALTH_CHECK || "http://localhost:8080/testServer",
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// API Endpoints
export const API_ENDPOINTS = {
  // Notifications
  NOTIFICATIONS: {
    SEND_SYSTEM: '/notifications/send-system',
    SEND_SPECIFIC: '/notifications/send-specific',
    SCHEDULE: '/notifications/schedule',
    HISTORY: '/notifications/history',
    STATS: '/notifications/stats',
    EXPORT: '/notifications/export'
  },
  
  // News
  NEWS: {
    CREATE: '/news',
    LIST: '/news',
    GET_BY_ID: (id: string) => `/news/${id}`,
    UPDATE: (id: string) => `/news/${id}`,
    DELETE: (id: string) => `/news/${id}`,
    STATS: '/news/stats',
    EXPORT: '/news/export'
  },
  
  // Reports
  REPORTS: {
    LIST: '/reports',
    GET_BY_ID: (id: string) => `/reports/${id}`,
    APPROVE: (id: string) => `/reports/${id}/approve`,
    REJECT: (id: string) => `/reports/${id}/reject`,
    STATS: '/reports/stats',
    EXPORT: '/reports/export'
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
    EXPORT: '/templates/export'
  },
  
  // Users
  USERS: {
    SEARCH: '/users/search',
    STATS: '/users/stats'
  }
};

// Health Check Function
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(API_CONFIG.HEALTH_CHECK);
    return response.ok;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

