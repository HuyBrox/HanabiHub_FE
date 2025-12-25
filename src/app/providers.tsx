"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import SocketProvider from "@/providers/SocketProvider"; // ✅ default import

export default function RtkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <SocketProvider>{children}</SocketProvider>
    </Provider>
  );
}
