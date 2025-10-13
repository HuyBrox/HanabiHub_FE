import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { ThemeProvider } from "@/components/common";
import { LanguageProvider } from "@/lib/language-context";
import { AuthInitializer } from "@/hooks/useAuthInit"; // để khởi tạo auth khi app load lên, nếu có session hợp lệ thì sẽ tự động login
import RtkProvider from "./providers";
import { NotificationProvider } from "@/components/notification";
import IncomingCallPopup from "@/components/IncomingCallPopup";
import NoSSR from "@/components/NoSSR";

export const metadata: Metadata = {
  title: "JapanLearn - Learn Japanese Easily",
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
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  // Remove browser extension attributes that cause hydration mismatch
  const removeExtensionAttributes = () => {
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      // Remove common browser extension attributes
      const attrsToRemove = [
        'bis_skin_checked',
        'bis_register',
        '__processed_',
        'cz-shortcut-listen',
        'data-bis_',
        'data-extension-'
      ];
      
      attrsToRemove.forEach(attr => {
        if (el.hasAttribute(attr)) {
          el.removeAttribute(attr);
        }
      });
    });
  };
  
  // Run immediately and on DOM changes
  removeExtensionAttributes();
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeExtensionAttributes);
  }
  
  const observer = new MutationObserver(removeExtensionAttributes);
  observer.observe(document.documentElement, { 
    attributes: true, 
    childList: true, 
    subtree: true,
    attributeFilter: ['bis_skin_checked', 'bis_register', '__processed_', 'cz-shortcut-listen']
  });
})();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <NoSSR fallback={
          <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        }>
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
        </NoSSR>
      </body>
    </html>
  );
}
