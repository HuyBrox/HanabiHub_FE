"use client";

import type React from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { AppSidebar } from "@/components/layout";
import { MobileHeader } from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";
import { SearchProvider, useSearch } from "@/contexts/SearchContext";
import { JapaneseInputModeProvider } from "@/contexts/JapaneseInputModeContext";
import { useGlobalJapaneseInput } from "@/hooks/useGlobalJapaneseInput";
import { SearchComponent } from "@/components/search/SearchComponent";
import { usePathname } from "next/navigation";

// Lazy load ChatDock - component nặng, không cần thiết ngay khi page load
const ChatDock = dynamic(
  () => import("@/components/chat").then((mod) => ({ default: mod.ChatDock })),
  {
    ssr: false, // Không render trên server
    loading: () => null, // Không hiển thị loading, render khi ready
  }
);

function LayoutContent({
  children,
  auth,
}: Readonly<{
  children: React.ReactNode;
  auth: React.ReactNode;
}>) {
  const { isAuthenticated, isInitialized } = useAuth();
  const { isSearchOpen } = useSearch();
  const pathname = usePathname();

  // Check if we're on a caller or receiver call page (not random call)
  const isCallPage =
    pathname?.startsWith("/call/caller") ||
    pathname?.startsWith("/call/receiver");

  // Apply Japanese input mode globally to all inputs
  useGlobalJapaneseInput();

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-background">
      {!isCallPage && <MobileHeader />}
      {!isCallPage && <AppSidebar />}
      {/* Search Component - hiển thị bên cạnh sidebar trên desktop */}
      {!isCallPage && (
        <div
          className={cn(
            "hidden lg:flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out overflow-hidden",
            isSearchOpen ? "w-80 opacity-100" : "w-0 opacity-0"
          )}
          style={{
            transition:
              "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out",
          }}
        >
          {isSearchOpen && <SearchComponent />}
        </div>
      )}
      {/* Search Component - hiển thị full screen overlay trên mobile */}
      {!isCallPage && isSearchOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background">
          <SearchComponent />
        </div>
      )}
      <main
        className={cn("flex-1 overflow-auto", isCallPage && "overflow-hidden")}
      >
        {children}
      </main>
      {/* Chỉ hiển thị ChatDock khi đã đăng nhập và không phải call page */}
      {/* Chỉ render sau khi auth đã được khởi tạo để tránh hydration mismatch */}
      {isInitialized && isAuthenticated && !isCallPage && <ChatDock />}
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
      <JapaneseInputModeProvider>
        <LayoutContent auth={auth}>{children}</LayoutContent>
      </JapaneseInputModeProvider>
    </SearchProvider>
  );
}
