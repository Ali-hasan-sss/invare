"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { ToastProvider } from "@/components/ui/Toast";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { usePathname } from "next/navigation";
import "./globals.css";

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { currentLanguage } = useAppSelector((state) => state.language);
  const { isDark } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") || false;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Initialize language and direction on mount
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("lang", currentLanguage.code);
      document.documentElement.setAttribute("dir", currentLanguage.dir);
    }
  }, [currentLanguage]);

  useEffect(() => {
    // Initialize theme on mount
    if (typeof window !== "undefined") {
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [isDark]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Don't show main Header and Footer in admin routes - AdminLayout has its own navbar
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16">{children}</main>
      <Footer />
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Basic Meta Tags */}
        <title>انفير - منصة مزادات إعادة التدوير</title>
        <meta
          name="description"
          content="انفير - منصة المزادات الرائدة لإعادة التدوير في الشرق الأوسط. اكتشف أفضل المواد المعاد تدويرها وشارك في المزادات الحية."
        />
        <meta
          name="keywords"
          content="مزادات, إعادة التدوير, مواد معاد تدويرها, مزادات حية, بيئة, استدامة, الشرق الأوسط"
        />
        <meta name="author" content="انفير" />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="انفير - منصة مزادات إعادة التدوير" />
        <meta
          property="og:description"
          content="منصة المزادات الرائدة لإعادة التدوير في الشرق الأوسط. اكتشف أفضل المواد المعاد تدويرها وشارك في المزادات الحية."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://invare.com" />
        <meta property="og:image" content="/images/logo.png" />
        <meta property="og:site_name" content="انفير" />
        <meta property="og:locale" content="ar_SA" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="انفير - منصة مزادات إعادة التدوير"
        />
        <meta
          name="twitter:description"
          content="منصة المزادات الرائدة لإعادة التدوير في الشرق الأوسط. اكتشف أفضل المواد المعاد تدويرها وشارك في المزادات الحية."
        />
        <meta name="twitter:image" content="/images/logo.png" />

        {/* Favicon */}
        <link rel="icon" href="/images/logo.png" type="image/png" />
        <link rel="shortcut icon" href="/images/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/logo.png" />

        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Theme Color */}
        <meta name="theme-color" content="#007bff" />
        <meta name="msapplication-TileColor" content="#007bff" />

        {/* Additional Meta Tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="انفير" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://invare.com" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-colors duration-200">
        <Provider store={store}>
          <ToastProvider>
            <AuthProvider>
              <RootLayoutContent>{children}</RootLayoutContent>
            </AuthProvider>
          </ToastProvider>
        </Provider>
      </body>
    </html>
  );
}
