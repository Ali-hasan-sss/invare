"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Tag,
  ShoppingBag,
  Gavel,
  MessageCircle,
  LayoutDashboard,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage.code === "ar";

  const menuItems = [
    {
      id: "dashboard",
      label: t("user.dashboard") || "لوحة التحكم",
      icon: LayoutDashboard,
      path: "/user/dashboard",
    },
    {
      id: "listings",
      label: t("user.myListings") || "عروضي",
      icon: Tag,
      path: "/user/listings",
    },
    {
      id: "purchases",
      label: t("user.myPurchases") || "مشترياتي",
      icon: ShoppingBag,
      path: "/user/purchases",
    },
    {
      id: "auctions",
      label: t("user.myAuctions") || "مزاداتي",
      icon: Gavel,
      path: "/user/auctions",
    },
    {
      id: "chats",
      label: t("chat.myChats") || "محادثاتي",
      icon: MessageCircle,
      path: "/user/chat",
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0",
        className
      )}
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {t("user.dashboard") || "لوحة التحكم"}
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                isRTL ? "flex-row-reverse" : "flex-row"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
