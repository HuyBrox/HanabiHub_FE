import axios, { AxiosInstance } from "axios";
import { API_CONFIG } from "@/config/api";

const axiosClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true, // Enable cookies
});

// Use cookies for authentication (backend uses httpOnly cookies)
axiosClient.interceptors.request.use((config) => {
  console.log("🔍 Request URL:", config.url);
  console.log("🍪 Using cookies for authentication");
  // Backend uses httpOnly cookies, no need for Authorization header
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error);
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log("❌ 401 Unauthorized - Session expired or invalid");
      // For cookie-based auth, we don't need to clear localStorage
      // The backend will handle cookie expiration
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
