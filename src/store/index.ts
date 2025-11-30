<<<<<<< HEAD
// src/store/index.ts
// Cấu hình Redux store chính của app
import { configureStore } from "@reduxjs/toolkit";

=======
// Cấu hình Redux store chính của app
import { configureStore } from "@reduxjs/toolkit";
>>>>>>> main
import { userApi } from "./services/userApi";
import { authApi } from "./services/authApi";
import { messageApi } from "./services/messageApi";
import { flashcardApi } from "./services/flashcardApi";
import { courseApi } from "./services/courseApi";
<<<<<<< HEAD

//rứa ren mấy cái ni báo lỗi đc
/* 👇 THÊM MỚI: Users Admin API */
import { usersAdminApi } from "./services/admin/usersAdminApi";

import authReducer from "./slices/authSlice";
import {
  authMiddleware,              // để tự động refresh token
  authListenerMiddleware,      // để lắng nghe các sự kiện auth(login, logout)
=======
import { activityApi } from "./services/activityApi";
import { learningInsightsApi } from "./services/learningInsightsApi";
import { aiChatApi } from "./services/aiChatApi";
import { dashboardApi } from "./services/admin/dashboardApi";
import authReducer from "./slices/authSlice";
import {
  authMiddleware, // để tự động refresh token
  authListenerMiddleware, // để lắng nghe các sự kiện auth(login, logout)
>>>>>>> main
} from "./middleware/authMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
<<<<<<< HEAD

=======
>>>>>>> main
    [userApi.reducerPath]: userApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
    [flashcardApi.reducerPath]: flashcardApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
<<<<<<< HEAD


    /* 👇 THÊM MỚI */
    [usersAdminApi.reducerPath]: usersAdminApi.reducer,
=======
    [activityApi.reducerPath]: activityApi.reducer,
    [learningInsightsApi.reducerPath]: learningInsightsApi.reducer,
    [aiChatApi.reducerPath]: aiChatApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
>>>>>>> main
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(authApi.middleware)
      .concat(messageApi.middleware)
      .concat(flashcardApi.middleware)
      .concat(courseApi.middleware)
<<<<<<< HEAD

      /* 👇 THÊM MỚI */
      .concat(usersAdminApi.middleware)

      // auth middlewares giữ nguyên thứ tự như cũ
=======
      .concat(activityApi.middleware)
      .concat(learningInsightsApi.middleware)
      .concat(aiChatApi.middleware)
      .concat(dashboardApi.middleware)
>>>>>>> main
      .concat(authMiddleware)
      .prepend(authListenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
