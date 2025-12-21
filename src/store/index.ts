// Cấu hình Redux store chính của app
import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./services/userApi";
import { authApi } from "./services/authApi";
import { messageApi } from "./services/messageApi";
import { flashcardApi } from "./services/flashcardApi";
<<<<<<< HEAD
import { courseApi } from "./services/courseApi";
import { activityApi } from "./services/activityApi";
import { learningInsightsApi } from "./services/learningInsightsApi";
import { newsApi } from "./services/newsApi";
import { notificationApi } from "./services/notificationApi";
import { scheduledNotificationApi } from "./services/scheduledNotificationApi";
import { templateApi } from "./services/templateApi";
import { reportApi } from "./services/reportApi";
=======
>>>>>>> origin/main
import authReducer from "./slices/authSlice";
import {
  authMiddleware, // để tự động refresh token
  authListenerMiddleware, // để lắng nghe các sự kiện auth(login, logout)
} from "./middleware/authMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [userApi.reducerPath]: userApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
    [flashcardApi.reducerPath]: flashcardApi.reducer,
<<<<<<< HEAD
    [courseApi.reducerPath]: courseApi.reducer,
    [activityApi.reducerPath]: activityApi.reducer,
    [learningInsightsApi.reducerPath]: learningInsightsApi.reducer,
    [newsApi.reducerPath]: newsApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [scheduledNotificationApi.reducerPath]: scheduledNotificationApi.reducer,
    [templateApi.reducerPath]: templateApi.reducer,
    [reportApi.reducerPath]: reportApi.reducer,
=======
>>>>>>> origin/main
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(authApi.middleware)
      .concat(messageApi.middleware)
      .concat(flashcardApi.middleware)
<<<<<<< HEAD
      .concat(courseApi.middleware)
      .concat(activityApi.middleware)
      .concat(learningInsightsApi.middleware)
      .concat(newsApi.middleware)
      .concat(notificationApi.middleware)
      .concat(scheduledNotificationApi.middleware)
      .concat(templateApi.middleware)
      .concat(reportApi.middleware)
=======
>>>>>>> origin/main
      .concat(authMiddleware)
      .prepend(authListenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
