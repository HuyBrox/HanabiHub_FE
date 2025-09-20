"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export function HeroCTA() {
  const { isAuthenticated } = useAuth();

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
