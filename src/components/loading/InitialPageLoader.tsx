"use client";

import { useEffect, useState } from "react";
import { LoadingPage } from "./LoadingPage";

/**
 * Component hiển thị loading khi trang đang hydrate (lần đầu load hoặc reload)
 * Không block rendering - chỉ overlay lên trên
 * Tự động ẩn khi React đã hydrate xong và DOM đã sẵn sàng
 *
 * Logic:
 * - Hiển thị ngay khi component mount (hydration phase)
 * - Ẩn sau khi React đã hydrate xong (sau 2 frame để đảm bảo DOM render)
 * - Timeout tối đa 1 giây để tránh hiển thị quá lâu
 */
export function InitialPageLoader() {
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    // Chờ React hydrate xong
    // Sử dụng double requestAnimationFrame để đảm bảo DOM đã render xong
    const handleHydrationComplete = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsHydrating(false);
        });
      });
    };

    // Nếu document đã ready, hydrate ngay
    if (typeof window !== "undefined" && document.readyState === "complete") {
      handleHydrationComplete();
    } else if (typeof window !== "undefined") {
      // Đợi load event hoặc readyState change
      const checkReady = () => {
        if (document.readyState === "complete") {
          handleHydrationComplete();
        }
      };

      window.addEventListener("load", handleHydrationComplete);
      document.addEventListener("readystatechange", checkReady);

      // Fallback: đợi tối đa 1 giây để tránh hiển thị quá lâu
      const timeout = setTimeout(() => {
        setIsHydrating(false);
      }, 1000);

      return () => {
        window.removeEventListener("load", handleHydrationComplete);
        document.removeEventListener("readystatechange", checkReady);
        clearTimeout(timeout);
      };
    } else {
      // SSR: không hiển thị
      setIsHydrating(false);
    }
  }, []);

  // Chỉ hiển thị khi đang hydrate
  if (!isHydrating) {
    return null;
  }

  return <LoadingPage />;
}

