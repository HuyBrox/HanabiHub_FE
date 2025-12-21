"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export function HeroCTA() {
  const { isAuthenticated, isInitialized } = useAuth();

  // Đợi auth state được khởi tạo xong để tránh hydration mismatch
  if (!isInitialized) {
    // Render placeholder giống với client để tránh mismatch
    return (
      <Link href="/login">
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
        >
          Start Learning Now
        </Button>
      </Link>
    );
  }

  // Không hiển thị nút nếu đã đăng nhập
  if (isAuthenticated) {
    return null;
  }

  return (
    <Link href="/login">
      <Button
        size="lg"
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
      >
        Start Learning Now
      </Button>
    </Link>
  );
}
