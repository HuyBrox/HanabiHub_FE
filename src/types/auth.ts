// User interface - Match với backend model
export interface User {
  _id: string; // MongoDB ObjectId as string
  id?: string; // Optional alias for _id
  email: string;
  username: string;
  fullname: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  gender: string;
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  isActive: boolean;
  isAdmin: boolean;
  isOnline: boolean;
  posts: number;
  followers: string[]; // ObjectId array as strings
  following: string[]; // ObjectId array as strings
  course?: string; // ObjectId as string
  lastActiveAt: string; // Date as ISO string
  createdAt?: string; // Date as ISO string
  updatedAt?: string; // Date as ISO string
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: User;
  } | null;
  timestamp: string;
}

// User Profile API response - Backend trả về user object trực tiếp trong data
export interface UserProfileResponse {
  success: boolean;
  message: string;
  data: User | null; // ← Trực tiếp User object, không phải { user: User }
  timestamp: string;
}

// Auth state types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Component Props
export interface AuthFormProps {
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
  isModal?: boolean;
}

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "register";
}

export interface AuthPageProps {
  defaultMode?: "login" | "register";
}
