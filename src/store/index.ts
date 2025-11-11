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
import { postApi } from "./services/postApi";
import { commentApi } from "./services/commentApi";
import authReducer from "./slices/authSlice";
import {
  authMiddleware,
  authListenerMiddleware,
} from "./middleware/authMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [userApi.reducerPath]: userApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
    [flashcardApi.reducerPath]: flashcardApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [activityApi.reducerPath]: activityApi.reducer,
    [learningInsightsApi.reducerPath]: learningInsightsApi.reducer,
    [aiChatApi.reducerPath]: aiChatApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [postApi.reducerPath]: postApi.reducer,
    [commentApi.reducerPath]: commentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(authApi.middleware)
      .concat(messageApi.middleware)
      .concat(flashcardApi.middleware)
      .concat(courseApi.middleware)
      .concat(activityApi.middleware)
      .concat(learningInsightsApi.middleware)
      .concat(aiChatApi.middleware)
      .concat(dashboardApi.middleware)
      .concat(postApi.middleware)
      .concat(commentApi.middleware)
      .concat(authMiddleware)
      .prepend(authListenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
