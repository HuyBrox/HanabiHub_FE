import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/lib/language-context";
import { ChatDock } from "@/components/chat-dock";
import { MobileHeader } from "@/components/mobile-header";

export const metadata: Metadata = {
  title: "JapanLearn - Learn Japanese Easily",
  description:
    "Master Japanese with interactive courses, flashcards, and AI practice",
  generator: "v0.app",
};

export default function RootLayout({
  children,
  auth,
}: Readonly<{
  children: React.ReactNode;
  auth: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        {/* Script chống flash theme & language */}
        <script
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
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <div className="flex flex-col lg:flex-row h-screen bg-background">
              <MobileHeader />
              <AppSidebar />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
            <ChatDock />
            {auth}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
