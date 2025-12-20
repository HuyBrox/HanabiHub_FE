import type React from "react";
import { AdminSidebar, AdminFooter, AdminMobileFooter } from "@/components/layout/admin";
import { NotificationProvider } from "@/components/notification/NotificationProvider";
import { AdminProtectedRoute } from "@/components/auth/AdminProtectedRoute";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <AdminProtectedRoute>
      <NotificationProvider>
        <div className="min-h-screen bg-slate-50">
        {/* Desktop Layout */}
        <div className="hidden lg:flex h-screen">
          <AdminSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
            <AdminFooter />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="min-h-screen pb-16">
            <main className="p-4">
              {children}
            </main>
          </div>
          <AdminMobileFooter />
        </div>
      </div>
      </NotificationProvider>
    </AdminProtectedRoute>
  );
}
