// Middleware xử lý auto refresh token và logout khi unauthorized
import {
  createListenerMiddleware,
  isRejectedWithValue,
  isFulfilled,
} from "@reduxjs/toolkit";
import type { MiddlewareAPI, Middleware } from "@reduxjs/toolkit";
import { authApi } from "../services/authApi";
import { logoutThunk, loginSuccess } from "../slices/authSlice";

// Track refresh attempts để tránh infinite loop
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 2;
const REFRESH_RETRY_DELAY = 1000; // 1 giây

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

          // Hàm retry với exponential backoff
          const attemptRefresh = (attempt: number) => {
            if (attempt >= MAX_REFRESH_ATTEMPTS) {
              console.log(`❌ Max refresh attempts (${MAX_REFRESH_ATTEMPTS}) reached, logging out`);
              api.dispatch(logoutThunk() as any);
              refreshAttempts = 0; // Reset counter
              return;
            }

            api
              .dispatch(authApi.endpoints.refreshToken.initiate() as any)
              .unwrap()
              .then((result: unknown) => {
                console.log(`✅ Token refreshed successfully on attempt ${attempt + 1}`);
                refreshAttempts = 0; // Reset sau khi thành công

                // Invalidate cache để retry request gốc
                const originalRequest = action.meta?.arg;
                if (originalRequest) {
                  api.dispatch(authApi.util.invalidateTags(["Auth"]));
                }
              })
              .catch((error: unknown) => {
                console.log(`⚠️ Refresh attempt ${attempt + 1} failed:`, error);

                // Retry với delay
                if (attempt + 1 < MAX_REFRESH_ATTEMPTS) {
                  const delay = REFRESH_RETRY_DELAY * Math.pow(2, attempt); // Exponential backoff
                  console.log(`🔄 Retrying in ${delay}ms...`);
                  setTimeout(() => attemptRefresh(attempt + 1), delay);
                } else {
                  console.log("❌ All refresh attempts failed, logging out");
                  api.dispatch(logoutThunk() as any);
                  refreshAttempts = 0; // Reset counter
                }
              });
          };

          attemptRefresh(refreshAttempts);
          refreshAttempts++;
        } else {
          // Refresh token endpoint itself failed
          console.log("❌ Refresh token endpoint failed, logging out");
          api.dispatch(logoutThunk() as any);
          refreshAttempts = 0; // Reset counter
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

// Listener cho logout thành công (không cần nữa vì dùng logoutThunk)
// authListenerMiddleware.startListening({
//   matcher: authApi.endpoints.logout.matchFulfilled,
//   effect: async (action, listenerApi) => {
//     console.log("✅ Logout successful");
//     listenerApi.dispatch(logoutThunk() as any);
//   },
// });
