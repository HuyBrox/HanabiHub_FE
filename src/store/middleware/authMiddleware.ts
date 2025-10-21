// Middleware xử lý auto refresh token và logout khi unauthorized
import {
  createListenerMiddleware,
  isRejectedWithValue,
  isFulfilled,
} from "@reduxjs/toolkit";
import type { MiddlewareAPI, Middleware } from "@reduxjs/toolkit";
import { authApi } from "../services/authApi";
import { logout, loginSuccess } from "../slices/authSlice";

// Middleware tự động refresh token khi gặp lỗi 401
export const authMiddleware: Middleware =
  (api: MiddlewareAPI) => (next) => (action) => {
    // Kiểm tra action bị reject với status 401
    if (isRejectedWithValue(action)) {
      const payload = action.payload as any;
      if (payload?.status === 401) {
        // Chỉ refresh nếu không phải lỗi từ refresh token endpoint
        const endpointName = (action.meta as any)?.arg?.endpointName;
        if (!endpointName?.includes("refreshToken")) {
          console.log("🔄 Token expired, attempting refresh...");
          // Thử refresh token không đồng bộ
          api
            .dispatch(authApi.endpoints.refreshToken.initiate() as any)
            .unwrap()
            .then((result: unknown) => {
              console.log("✅ Token refreshed successfully");
              // Sau khi refresh thành công, retry request gốc
              const originalRequest = action.meta?.arg;
              if (originalRequest) {
                api.dispatch(authApi.util.invalidateTags(["Auth"]));
              }
            })
            .catch((error: unknown) => {
              console.log("❌ Token refresh failed:", error);
              // Refresh fail thì logout
              api.dispatch(logout());
            });
        } else {
          // Refresh token fail thì logout
          console.log("❌ Refresh token failed, logging out");
          api.dispatch(logout());
        }
      }
    }

    return next(action);
  };

// Listener middleware để handle các auth events
export const authListenerMiddleware = createListenerMiddleware();

// Listener cho login thành công
authListenerMiddleware.startListening({
  matcher: authApi.endpoints.login.matchFulfilled,
  effect: async (action, listenerApi) => {
    console.log("✅ Login successful:", action.payload);
    if (action.payload?.success && action.payload?.data?.user) {
      listenerApi.dispatch(loginSuccess(action.payload.data.user));
    }
  },
});

// Listener cho refresh token thành công
authListenerMiddleware.startListening({
  matcher: authApi.endpoints.refreshToken.matchFulfilled,
  effect: async (action, listenerApi) => {
    console.log("✅ Refresh token successful");
    if (action.payload?.success && action.payload?.data?.user) {
      listenerApi.dispatch(loginSuccess(action.payload.data.user));
    }
  },
});

// Listener cho getCurrentUser thành công
authListenerMiddleware.startListening({
  matcher: authApi.endpoints.getCurrentUser.matchFulfilled,
  effect: async (action, listenerApi) => {
    console.log("✅ Get current user successful");
    if (action.payload?.success && action.payload?.data) {
      listenerApi.dispatch(loginSuccess(action.payload.data));
    }
  },
});

// Listener cho logout thành công
authListenerMiddleware.startListening({
  matcher: authApi.endpoints.logout.matchFulfilled,
  effect: async (action, listenerApi) => {
    console.log("✅ Logout successful");
    // Cleanup data sau khi logout
    listenerApi.dispatch(logout());
  },
});
