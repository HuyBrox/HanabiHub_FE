"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AdminFooterProps {
  className?: string;
}

export function AdminFooter({ className }: AdminFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("border-t bg-white px-6 py-4", className)}>
      <div className="flex items-center justify-between text-sm text-slate-600">
        <div className="flex items-center space-x-4">
          <span>&copy; {currentYear} JapanLearn Admin Panel</span>
          <span>•</span>
          <span>Version 1.0.0</span>
        </div>

        <div className="flex items-center space-x-4">
          <a
            href="/admin/help"
            className="hover:text-slate-900 transition-colors"
          >
            Help
          </a>
          <span>•</span>
          <a
            href="/admin/support"
            className="hover:text-slate-900 transition-colors"
          >
            Support
          </a>
          <span>•</span>
          <a
            href="/admin/docs"
            className="hover:text-slate-900 transition-colors"
          >
            Documentation
          </a>
        </div>
      </div>
    </footer>
  );
}
