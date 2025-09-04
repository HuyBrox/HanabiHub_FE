"use client";

import type React from "react";

import { cn } from "@/lib/utils";

interface ShimmerProps {
  className?: string;
  children?: React.ReactNode;
}

export function Shimmer({ className, children }: ShimmerProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700",
        "bg-[length:200%_100%] animate-shimmer",
        className
      )}
      style={{
        animation: "shimmer 2s infinite linear",
      }}
    >
      {children}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}

//file này tạo hiệu ứng shimmer cho các thành phần UI (shimmer là một hiệu ứng chuyển động mượt mà, thường được sử dụng để tạo cảm giác tải dữ liệu)
