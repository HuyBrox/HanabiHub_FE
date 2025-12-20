"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Redirect page from /admin to /admin/dashboard
 * Since there's no content at /admin, redirect to dashboard
 */
export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
        <p className="text-sm text-muted-foreground">Đang chuyển hướng đến trang quản lý...</p>
      </div>
    </div>
  );
}

