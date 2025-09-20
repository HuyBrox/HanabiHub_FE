// Middleware xử lý auto refresh token và logout khi unauthorized
import {
  createListenerMiddleware,
  isRejectedWithValue,
} from "@reduxjs/toolkit";
import type { MiddlewareAPI, Middleware } from "@reduxjs/toolkit";
import { authApi } from "../services/authApi";
import { logout } from "../slices/authSlice";

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
          // Thử refresh token không đồng bộ
          api
            .dispatch(authApi.endpoints.refreshToken.initiate() as any)
            .unwrap()
            .catch(() => {
              // Refresh fail thì logout
              api.dispatch(logout());
            });
        } else {
          // Refresh token fail thì logout
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
    console.log("Login successful:", action.payload);
  },
});

// Listener cho logout thành công
authListenerMiddleware.startListening({
  matcher: authApi.endpoints.logout.matchFulfilled,
  effect: async (action, listenerApi) => {
    // Cleanup data sau khi logout
    listenerApi.dispatch(logout());
  },
});
