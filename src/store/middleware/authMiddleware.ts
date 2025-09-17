import {
  createListenerMiddleware,
  isRejectedWithValue,
} from "@reduxjs/toolkit";
import type { MiddlewareAPI, Middleware } from "@reduxjs/toolkit";
import { authApi } from "../services/authApi";
import { logout } from "../slices/authSlice";

/**
 * Middleware để tự động refresh token khi gặp lỗi 401
 */
export const authMiddleware: Middleware =
  (api: MiddlewareAPI) => (next) => (action) => {
    // Check if this is a rejected action with a 401 status
    if (isRejectedWithValue(action)) {
      const payload = action.payload as any;
      if (payload?.status === 401) {
        // Chỉ tự động refresh nếu không phải là lỗi từ refresh token endpoint
        const endpointName = (action.meta as any)?.arg?.endpointName;
        if (!endpointName?.includes("refreshToken")) {
          // Thử refresh token - không await để không block
          api
            .dispatch(authApi.endpoints.refreshToken.initiate() as any)
            .unwrap()
            .catch(() => {
              // Nếu refresh token fail, logout user
              api.dispatch(logout());
            });
        } else {
          // Nếu refresh token fail, logout user
          api.dispatch(logout());
        }
      }
    }

    return next(action);
  };

/**
 * Listener middleware để handle authentication events
 */
export const authListenerMiddleware = createListenerMiddleware();

// Listener for successful login
authListenerMiddleware.startListening({
  matcher: authApi.endpoints.login.matchFulfilled,
  effect: async (action, listenerApi) => {
    // Có thể thêm logic sau khi login thành công
    console.log("Login successful:", action.payload);
  },
});

// Listener for successful logout
authListenerMiddleware.startListening({
  matcher: authApi.endpoints.logout.matchFulfilled,
  effect: async (action, listenerApi) => {
    // Clear any cached data or perform cleanup
    listenerApi.dispatch(logout());
  },
});
