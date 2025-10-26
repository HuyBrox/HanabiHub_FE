// Common Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Notifications
export interface NotificationRequest {
  title: string;
  content: string;
  type: 'system' | 'specific';
  recipients?: string[]; // User IDs for specific notifications
}

export interface NotificationHistoryParams extends PaginationParams {
  type?: 'system' | 'specific';
}

export interface NotificationStats {
  total: number;
  system: number;
  specific: number;
  totalRecipients: number;
}

// News
export interface NewsItem {
  _id: string;
  title: string;
  content: string;
  author: string;
  status: 'draft' | 'published';
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsRequest {
  title: string;
  content: string;
  status: 'draft' | 'published';
}

export interface UpdateNewsRequest extends Partial<CreateNewsRequest> {}

export interface NewsListParams extends PaginationParams {
  status?: 'draft' | 'published';
  author?: string;
}

export interface NewsStats {
  total: number;
  published: number;
  draft: number;
  totalViews: number;
}

// Reports
export interface ReportItem {
  _id: string;
  reason: string;
  category: 'spam' | 'content' | 'harassment' | 'scam' | 'copyright';
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected';
  reporter: string;
  reported: string;
  createdAt: string;
}

export interface ReportActionRequest {
  note: string;
}

export interface ReportListParams extends PaginationParams {
  status?: 'pending' | 'approved' | 'rejected';
  category?: string;
  priority?: string;
}

export interface ReportStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  highPriority: number;
}

// Templates
export interface TemplateItem {
  _id: string;
  name: string;
  title: string;
  content: string;
  type: 'system' | 'specific';
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  title: string;
  content: string;
  type: 'system' | 'specific';
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {}

export interface TemplateListParams extends PaginationParams {
  type?: 'system' | 'specific';
}

export interface TemplateStats {
  total: number;
  system: number;
  specific: number;
  totalUsage: number;
}

// Users (for recipient selection)
export interface UserItem {
  _id: string;
  email: string;
  username: string;
  fullname: string;
  role: 'admin' | 'premium' | 'basic';
  avatar?: string;
}

export interface UserListParams extends PaginationParams {
  role?: 'admin' | 'premium' | 'basic';
}

export interface UserStats {
  total: number;
  admin: number;
  premium: number;
  basic: number;
}