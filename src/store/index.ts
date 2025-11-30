// src/store/index.ts
// Cấu hình Redux store chính của app
import { configureStore } from "@reduxjs/toolkit";

import { userApi } from "./services/userApi";
import { authApi } from "./services/authApi";
import { messageApi } from "./services/messageApi";
import { flashcardApi } from "./services/flashcardApi";
import { courseApi } from "./services/courseApi";

import { activityApi } from "./services/activityApi";
import { learningInsightsApi } from "./services/learningInsightsApi";
import { aiChatApi } from "./services/aiChatApi";
import { dashboardApi } from "./services/admin/dashboardApi";

/* 👇 THÊM MỚI: Users Admin API */
import { usersAdminApi } from "./services/admin/usersAdminApi";

import authReducer from "./slices/authSlice";
import {
  authMiddleware,              // để tự động refresh token
  authListenerMiddleware,      // để lắng nghe sự kiện auth(login, logout)
} from "./middleware/authMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,

    // reducers từ main
    [userApi.reducerPath]: userApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
    [flashcardApi.reducerPath]: flashcardApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [activityApi.reducerPath]: activityApi.reducer,
    [learningInsightsApi.reducerPath]: learningInsightsApi.reducer,
    [aiChatApi.reducerPath]: aiChatApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,

    // reducer NHÁNH CỦA M
    [usersAdminApi.reducerPath]: usersAdminApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(authApi.middleware)
      .concat(messageApi.middleware)
      .concat(flashcardApi.middleware)
      .concat(courseApi.middleware)

      // middlewares từ main
      .concat(activityApi.middleware)
      .concat(learningInsightsApi.middleware)
      .concat(aiChatApi.middleware)
      .concat(dashboardApi.middleware)

      // middleware NHÁNH CỦA M
      .concat(usersAdminApi.middleware)

      // auth middleware giữ nguyên thứ tự
      .concat(authMiddleware)
      .prepend(authListenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
