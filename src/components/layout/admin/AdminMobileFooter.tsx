"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
} from "lucide-react";

interface AdminMobileFooterProps {
  className?: string;
}

const mobileMenuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminMobileFooter({ className }: AdminMobileFooterProps) {
  const pathname = usePathname();

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 border-t bg-white lg:hidden",
      className
    )}>
      <div className="grid grid-cols-5 h-16">
        {mobileMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors",
                isActive
                  ? "text-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
