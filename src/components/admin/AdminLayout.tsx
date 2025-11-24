"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  Building2,
  LayoutDashboard,
  X,
  Globe,
  Package,
  Image,
  List,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";
import { AdminNavbar } from "./AdminNavbar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { t, currentLanguage } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const isRTL = currentLanguage.dir === "rtl";

  // Check admin access on client side
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Redirect to login if not authenticated
      router.push("/auth/login");
      return;
    }

    // Strictly check if user is admin (must be exactly true)
    if (user.isAdmin !== true) {
      // Redirect to home page if not admin
      console.log("Access denied - User is not admin:", {
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        isAdminType: typeof user.isAdmin,
      });
      router.push("/");
      return;
    }

    // User is authenticated and is admin
    setIsChecking(false);
  }, [user, isAuthenticated, router]);

  const navigation = [
    {
      name: t("admin.dashboard"),
      href: "/admin",
      icon: LayoutDashboard,
      current: pathname === "/admin",
    },
    {
      name: t("admin.users"),
      href: "/admin/users",
      icon: Users,
      current: pathname.startsWith("/admin/users"),
    },
    {
      name: t("admin.companies"),
      href: "/admin/companies",
      icon: Building2,
      current: pathname.startsWith("/admin/companies"),
    },
    {
      name: t("admin.countries"),
      href: "/admin/countries",
      icon: Globe,
      current: pathname.startsWith("/admin/countries"),
    },
    {
      name: t("admin.materials"),
      href: "/admin/materials",
      icon: Package,
      current: pathname.startsWith("/admin/materials"),
    },
    {
      name: t("admin.listings"),
      href: "/admin/listings",
      icon: List,
      current: pathname.startsWith("/admin/listings"),
    },
  ];

  // Show loading or nothing while checking
  if (isChecking || !isAuthenticated || !user || user.isAdmin !== true) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {t("common.loading") || "جاري التحميل..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Navbar */}
      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={cn(
            "fixed inset-y-0 flex w-full max-w-xs flex-col bg-white dark:bg-gray-800",
            isRTL ? "right-0" : "left-0"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700",
              isRTL ? "flex-row-reverse" : ""
            )}
          >
            <h2
              className={cn(
                "text-lg font-semibold text-gray-900 dark:text-white",
                isRTL ? "text-right flex-1" : "text-left flex-1"
              )}
            >
              {t("admin.menu")}
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isRTL ? "flex-row-reverse" : "",
                    item.current
                      ? "bg-[#3E54AC] text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span
                    className={cn("flex-1", isRTL ? "text-right" : "text-left")}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:z-20 lg:flex lg:w-64 lg:flex-col lg:pt-16",
          isRTL ? "lg:right-0" : "lg:left-0"
        )}
      >
        <div
          className={cn(
            "flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 px-6 py-6",
            isRTL
              ? "border-l border-gray-200 dark:border-gray-700"
              : "border-r border-gray-200 dark:border-gray-700"
          )}
        >
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isRTL ? "flex-row-reverse" : "",
                        item.current
                          ? "bg-[#3E54AC] text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span
                        className={cn(
                          "flex-1",
                          isRTL ? "text-right" : "text-left"
                        )}
                      >
                        {item.name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className={cn("pt-16 lg:pt-0", isRTL ? "lg:pr-64" : "lg:pl-64")}>
        {/* Page content */}
        <main className="py-10 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};
