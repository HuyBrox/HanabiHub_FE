"use client";

import type React from "react";

/**
 * Layout for receiver page - hides ChatDock and other UI elements
 */
export default function ReceiverLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}


