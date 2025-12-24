import type React from "react";
import { AdminSidebar, AdminFooter, AdminMobileFooter } from "@/components/layout/admin";
<<<<<<< HEAD
import { ExtensionCleanup } from "@/components/common";
=======
import { NotificationProvider } from "@/components/notification/NotificationProvider";
import { AdminProtectedRoute } from "@/components/auth/AdminProtectedRoute";
>>>>>>> 5c598a91ed3562e345d6032cdca31af3830a9821

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
<<<<<<< HEAD
    <>
      <ExtensionCleanup />
      <div className="min-h-screen bg-slate-50">
=======
    <AdminProtectedRoute>
      <NotificationProvider>
        <div className="min-h-screen bg-slate-50">
>>>>>>> 5c598a91ed3562e345d6032cdca31af3830a9821
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
<<<<<<< HEAD
    </>
=======
      </NotificationProvider>
    </AdminProtectedRoute>
>>>>>>> 5c598a91ed3562e345d6032cdca31af3830a9821
  );
}
