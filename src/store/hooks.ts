// Typed hooks cho Redux store
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// Hook dispatch với type safety
export const useAppDispatch = () => useDispatch<AppDispatch>();
// Hook selector với type safety
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
