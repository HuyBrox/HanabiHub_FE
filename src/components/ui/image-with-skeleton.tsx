"use client";
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Dùng cho avatar hoặc ảnh nhỏ, không dùng cho ảnh lớn/banner
export function ImageWithSkeleton({
  src,
  alt,
  className,
  ...props
}: {
  src: string;
  alt: string;
  className?: string;
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <div
      className={className}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {!loaded && <Skeleton className="absolute inset-0 w-full h-full" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={
          "w-full h-full object-cover transition-opacity duration-500 " +
          (loaded ? "opacity-100" : "opacity-0")
        }
        style={{ position: "relative", zIndex: 1 }}
        loading="lazy"
        {...props}
      />
    </div>
  );
}
