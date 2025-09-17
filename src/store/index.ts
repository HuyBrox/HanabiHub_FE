import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./services/userApi";
import { authApi } from "./services/authApi";
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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(authApi.middleware)
      .concat(authMiddleware)
      .prepend(authListenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
