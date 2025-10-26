import axiosClient from "@/api/axioxClient";

// Types
export interface UserItem {
  _id: string;
  fullname: string;
  username: string;
  email: string;
  role: "admin" | "premium" | "basic";
  avatar?: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface UserStats {
  total: number;
  admin: number;
  premium: number;
  basic: number;
}

// API Functions
export const userApi = {
  // Get users list for admin (notification recipients)
  getUsersList: async (params: UserListParams = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);

    const response: any = await axiosClient.get(`/user/search?${queryParams.toString()}`);
    
    // Transform backend response to frontend expected format
    if (response.success && response.data) {
      const { users, total, page, limit } = response.data;
      return {
        success: true,
        data: users || [],
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

  // Search users for admin (notification recipients)
  searchUsers: async (params: UserListParams = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);

    const response: any = await axiosClient.get(`/user/search?${queryParams.toString()}`);
    
    // Transform backend response to frontend expected format
    if (response.success && response.data) {
      const { users, total, page, limit } = response.data;
      return {
        success: true,
        data: users || [],
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

  // Get user statistics
  getUserStats: async () => {
    return axiosClient.get('/user/stats');
  }
};