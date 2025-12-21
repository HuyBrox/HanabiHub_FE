// Cß║Ñu h├¼nh Redux store ch├¡nh cß╗ºa app
import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./services/userApi";
import { authApi } from "./services/authApi";
import { messageApi } from "./services/messageApi";
import { flashcardApi } from "./services/flashcardApi";
import authReducer from "./slices/authSlice";
import {
  authMiddleware, // ─æß╗â tß╗▒ ─æß╗Öng refresh token
  authListenerMiddleware, // ─æß╗â lß║»ng nghe c├íc sß╗▒ kiß╗çn auth(login, logout)
} from "./middleware/authMiddleware";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [userApi.reducerPath]: userApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [messageApi.reducerPath]: messageApi.reducer,
    [flashcardApi.reducerPath]: flashcardApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(authApi.middleware)
      .concat(messageApi.middleware)
      .concat(flashcardApi.middleware)
      .concat(authMiddleware)
      .prepend(authListenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
