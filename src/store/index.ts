// src/store/index.ts
// Cấu hình Redux store chính của app
import { configureStore } from "@reduxjs/toolkit";

import { userApi } from "./services/userApi";
import { authApi } from "./services/authApi";
import { messageApi } from "./services/messageApi";
import { flashcardApi } from "./services/flashcardApi";
import { courseApi } from "./services/courseApi";

//rứa ren mấy cái ni báo lỗi đc
/* 👇 THÊM MỚI: Users Admin API */
import { usersAdminApi } from "./services/admin/usersAdminApi";

import authReducer from "./slices/authSlice";
import {
  authMiddleware,              // để tự động refresh token
  authListenerMiddleware,      // để lắng nghe các sự kiện auth(login, logout)
} from "./middleware/authMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,

    [userApi.reducerPath]: userApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
    [flashcardApi.reducerPath]: flashcardApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,


    /* 👇 THÊM MỚI */
    [usersAdminApi.reducerPath]: usersAdminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(authApi.middleware)
      .concat(messageApi.middleware)
      .concat(flashcardApi.middleware)
      .concat(courseApi.middleware)

      /* 👇 THÊM MỚI */
      .concat(usersAdminApi.middleware)

      // auth middlewares giữ nguyên thứ tự như cũ
      .concat(authMiddleware)
      .prepend(authListenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
