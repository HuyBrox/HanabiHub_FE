// API Helper Utilities

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Handle API response and extract data
 */
export const handleApiResponse = <T>(response: any): T => {
  if (response?.success) {
    return response.data;
  }
  throw new Error(response?.error || response?.message || 'API request failed');
};

/**
 * Handle paginated API response
 */
export const handlePaginatedResponse = <T>(response: any): PaginatedResponse<T> => {
  if (response?.success) {
    return {
      success: true,
      data: response.data || [],
      pagination: response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    };
  }
  throw new Error(response?.error || response?.message || 'API request failed');
};

/**
 * Build query string from parameters
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(key, item.toString()));
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });
  
  return queryParams.toString();
};

/**
 * Format date for API
 */
export const formatDateForApi = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString();
};

/**
 * Parse API date to local format
 */
export const parseApiDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format time ago
 */
export const formatTimeAgo = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return "Vừa xong";
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} giờ trước`;
  } else if (diffInHours < 168) {
    const days = Math.floor(diffInHours / 24);
    return `${days} ngày trước`;
  } else {
    const weeks = Math.floor(diffInHours / 168);
    return `${weeks} tuần trước`;
  }
};

/**
 * Validate required fields
 */
export const validateRequiredFields = (data: Record<string, any>, requiredFields: string[]): string[] => {
  const missingFields: string[] = [];
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missingFields.push(field);
    }
  });
  
  return missingFields;
};

/**
 * Debounce function for search
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Retry API call with exponential backoff
 */
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

/**
 * Common error messages
 */
export const errorMessages = {
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền thực hiện hành động này.',
  NOT_FOUND: 'Không tìm thấy dữ liệu.',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  TIMEOUT: 'Yêu cầu quá thời gian chờ. Vui lòng thử lại.',
  UNKNOWN: 'Đã xảy ra lỗi không xác định.'
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: any): string => {
  if (error?.response?.status) {
    switch (error.response.status) {
      case 400:
        return errorMessages.VALIDATION_ERROR;
      case 401:
        return errorMessages.UNAUTHORIZED;
      case 403:
        return errorMessages.FORBIDDEN;
      case 404:
        return errorMessages.NOT_FOUND;
      case 500:
        return errorMessages.SERVER_ERROR;
      default:
        return errorMessages.UNKNOWN;
    }
  }
  
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return errorMessages.NETWORK_ERROR;
  }
  
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return errorMessages.TIMEOUT;
  }
  
  return error?.message || errorMessages.UNKNOWN;
};


