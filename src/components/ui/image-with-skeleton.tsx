"use client";
import React from "react";
import Image from "next/image";
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
} & Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) {
  const [loaded, setLoaded] = React.useState(false);
  return (
    <div
      className={className}
      style={{ position: "relative", overflow: "hidden" }}
    >
      {!loaded && <Skeleton className="absolute inset-0 w-full h-full" />}
      <Image
        src={src}
        alt={alt}
        fill
        onLoad={() => setLoaded(true)}
        className={
          "object-cover transition-opacity duration-500 " +
          (loaded ? "opacity-100" : "opacity-0")
        }
        style={{ position: "relative", zIndex: 1 }}
        loading="lazy"
        unoptimized
        {...props}
      />
    </div>
  );
}
