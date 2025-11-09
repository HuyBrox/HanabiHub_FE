"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/layout";
import { ChatDock } from "@/components/chat";
import { MobileHeader } from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";
import { SearchProvider, useSearch } from "@/contexts/SearchContext";
import { SearchComponent } from "@/components/search/SearchComponent";

function LayoutContent({
  children,
  auth,
}: Readonly<{
  children: React.ReactNode;
  auth: React.ReactNode;
}>) {
  const { isAuthenticated } = useAuth();
  const { isSearchOpen } = useSearch();

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background">
      <MobileHeader />
      <AppSidebar />
      {/* Search Component - hiển thị bên cạnh sidebar trên desktop */}
      <div
        className={cn(
          "hidden lg:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out overflow-hidden",
          isSearchOpen ? "w-80 opacity-100" : "w-0 opacity-0"
        )}
        style={{
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out",
        }}
      >
        {isSearchOpen && <SearchComponent />}
      </div>
      {/* Search Component - hiển thị full screen overlay trên mobile */}
      {isSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background">
          <SearchComponent />
        </div>
      )}
      <main className="flex-1 overflow-auto">{children}</main>
      {/* Chỉ hiển thị ChatDock khi đã đăng nhập */}
      {isAuthenticated && <ChatDock />}
      {auth}
    </div>
  );
}

export default function UserLayout({
  children,
  auth,
}: Readonly<{
  children: React.ReactNode;
  auth: React.ReactNode;
}>) {
  return (
    <SearchProvider>
      <LayoutContent auth={auth}>{children}</LayoutContent>
    </SearchProvider>
  );
}
