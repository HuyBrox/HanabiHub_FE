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
import { InitialPageLoader } from "@/components/loading";

export const metadata: Metadata = {
  title: "HanabiHub - Nền tảng học tiếng Nhật thông minh",
  description:
    "Luyện nói tiếng Nhật cùng AI, theo dõi tiến độ học, và trò chuyện với giáo viên ảo Hanabi.",
  generator: "v0.app",
  openGraph: {
    title: "HanabiHub - Nền tảng học tiếng Nhật thông minh",
    description:
      "Luyện nói tiếng Nhật cùng AI, theo dõi tiến độ học, và trò chuyện với giáo viên ảo Hanabi.",
    url: "https://hanabi-hub.vercel.app/",
    siteName: "HanabiHub",
    images: [
      {
        url: "https://hanabi-hub.vercel.app/images/logos/logohanabi.png",
        width: 1200,
        height: 630,
        alt: "HanabiHub Logo",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HanabiHub - AI Japanese Learning Platform",
    description:
      "Thực hành hội thoại, luyện ngữ pháp, và học cùng AI Hanabi.",
    images: ["https://hanabi-hub.vercel.app/images/logos/logohanabi.png"],
  },
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
        <InitialPageLoader />
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
