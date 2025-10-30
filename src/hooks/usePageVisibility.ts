"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if the page/tab is currently visible to the user.
 * Uses the Page Visibility API to pause timers when user switches tabs.
 *
 * @returns {boolean} - true if page is visible, false if hidden
 */
export const usePageVisibility = (): boolean => {
  const [isVisible, setIsVisible] = useState<boolean>(
    typeof document !== "undefined" ? !document.hidden : true
  );

  useEffect(() => {
    // Check if Page Visibility API is supported
    if (typeof document === "undefined" || typeof document.hidden === "undefined") {
      // Server-side or unsupported browser - assume always visible
      return;
    }

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    // Listen for visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return isVisible;
};


