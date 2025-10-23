"use client";

import type React from "react";

/**
 * Layout for caller page - hides ChatDock and other UI elements
 */
export default function CallerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}


