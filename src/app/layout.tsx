import type React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider, ExtensionCleanup } from "@/components/common";
import { LanguageProvider } from "@/lib/language-context";
import { AuthInitializer } from "@/hooks/useAuthInit"; // để khởi tạo auth khi app load lên, nếu có session hợp lệ thì sẽ tự động login
import RtkProvider from "./providers";
import { NotificationProvider } from "@/components/notification";
import IncomingCallPopup from "@/components/IncomingCallPopup";

export const metadata: Metadata = {
  title: "HanabiHub - Learn Japanese Easily",
  description:
    "Master Japanese with interactive courses, flashcards, and AI practice",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        {/* Theme & Language initialization - using Next.js Script for better hydration handling */}
      </head>
      <body suppressHydrationWarning>
        {/* ✅ Script chạy trước khi React hydrate để chống flash theme/language */}
        <Script
          id="theme-language-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    // Theme
    var theme = localStorage.getItem('theme');
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var cl = document.documentElement.classList;
    cl.remove('light', 'dark');
    if(theme === 'dark' || (!theme && systemDark)) cl.add('dark');
    else cl.add('light');
    // Language
    var lang = localStorage.getItem('language');
    if(lang === 'vi' || lang === 'en') window.__lang = lang;
    else window.__lang = 'en';
  } catch(e) {}
})();
            `,
          }}
        />
        <ExtensionCleanup />
        <RtkProvider>
          <AuthInitializer>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <LanguageProvider>
                <NotificationProvider>
                  {children}
                  <IncomingCallPopup />
                </NotificationProvider>
              </LanguageProvider>
            </ThemeProvider>
          </AuthInitializer>
        </RtkProvider>
      </body>
    </html>
  );
}
