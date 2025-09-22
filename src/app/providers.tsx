"use client";
import { Provider } from "react-redux";
import { store } from "@/store";
import { SocketProvider } from "@/providers/SocketProvider";

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
