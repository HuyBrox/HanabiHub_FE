"use client";

import type React from "react";
import { AppSidebar } from "@/components/layout";
import { ChatDock } from "@/components/chat";
import { MobileHeader } from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";

export default function UserLayout({
  children,
  auth,
}: Readonly<{
  children: React.ReactNode;
  auth: React.ReactNode;
}>) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background">
      <MobileHeader />
      <AppSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
      {/* Chỉ hiển thị ChatDock khi đã đăng nhập */}
      {isAuthenticated && <ChatDock />}
      {auth}
    </div>
  );
}
