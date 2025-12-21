"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetCurrentUserQuery } from "../store/services/authApi";
import { loginStart, loginSuccess, logout } from "../store/slices/authSlice";
import { RootState } from "../store";
// Update the import path to the correct relative location
import { LoadingPage } from "../components/loading";

// Hook ─æß╗â kh├┤i phß╗Ñc authentication state khi app khß╗ƒi ─æß╗Öng v├á theo d├╡i session
export const useAuthInit = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Gß╗ìi API ─æß╗â lß║Ñy th├┤ng tin user hiß╗çn tß║íi (nß║┐u c├│ token trong cookie)
  const { data, isSuccess, isError, isLoading, refetch, error } =
    useGetCurrentUserQuery();

  // Set loading state khi bß║»t ─æß║ºu check auth
  useEffect(() => {
    if (isLoading) {
      dispatch(loginStart());
    }
  }, [isLoading, dispatch]);

  useEffect(() => {
    if (isSuccess && data?.success && data.data) {
      // Backend trß║ú vß╗ü user object trß╗▒c tiß║┐p trong data
      dispatch(loginSuccess(data.data));
      console.log("Γ£à Auth state restored from /user/profile:", data.data);
    } else if (isError) {
      // Nß║┐u API fail, logout
      const errorStatus = (error as any)?.status;
      if (errorStatus === 401 || errorStatus === 403) {
        console.log("≡ƒöô Session expired, logging out...");
        dispatch(logout());
      } else {
        console.log(
          "Γ¥î No valid session found - token may be expired or invalid"
        );
        dispatch(logout());
      }
    }
  }, [isSuccess, isError, data, dispatch, error]);

  // Theo d├╡i khi user quay lß║íi tab ─æß╗â check session
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        // User quay lß║íi tab v├á ─æang authenticated, check lß║íi session
        console.log("≡ƒæü∩╕Å User returned to tab, checking session...");
        refetch();
      }
    };

    const handleFocus = () => {
      if (isAuthenticated) {
        // User focus v├áo window v├á ─æang authenticated, check lß║íi session
        console.log("≡ƒÄ» Window focused, checking session...");
        refetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetch, isAuthenticated]);

  // Periodic check session mß╗ùi 10 ph├║t nß║┐u ─æang authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      console.log("ΓÅ░ Periodic session check...");
      refetch();
    }, 10 * 60 * 1000); // 10 ph├║t

    return () => clearInterval(interval);
  }, [refetch, isAuthenticated]);

  return { isLoading };
};

/**
 * Component wrapper ─æß╗â init auth state
 */
export const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isLoading } = useAuthInit();

  // Hiß╗ân thß╗ï loading khi ─æang kiß╗âm tra auth state
  if (isLoading) {
    return <LoadingPage />;
  }

  return <>{children}</>;
};
