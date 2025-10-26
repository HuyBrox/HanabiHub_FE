// Cấu hình Redux store chính của app
import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./services/userApi";
import { authApi } from "./services/authApi";
import { messageApi } from "./services/messageApi";
import { flashcardApi } from "./services/flashcardApi";
import authReducer from "./slices/authSlice";
import {
  authMiddleware, // để tự động refresh token
  authListenerMiddleware, // để lắng nghe các sự kiện auth(login, logout)
} from "./middleware/authMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
    [flashcardApi.reducerPath]: flashcardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(messageApi.middleware)
      .concat(flashcardApi.middleware)
      .concat(authMiddleware)
      .prepend(authListenerMiddleware.middleware),
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
