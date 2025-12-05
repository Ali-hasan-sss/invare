"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppSelector } from "@/store/hooks";
import {
  Tag,
  ShoppingBag,
  Gavel,
  MessageCircle,
  LayoutDashboard,
} from "lucide-react";
import { Badge } from "@mui/material";

const BottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage.code === "ar";
  const unreadChatsCount = useAppSelector(
    (state) => state.chat.unreadChatsCount
  );

  const menuItems = [
    {
      id: "dashboard",
      label: t("user.dashboard") || "الرئيسية",
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-around items-center h-16">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0 flex-1 relative",
                isActive
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive && "text-purple-600 dark:text-purple-400"
                  )}
                />
                {item.id === "chats" && unreadChatsCount > 0 && (
                  <Badge
                    badgeContent={unreadChatsCount}
                    color="error"
                    max={99}
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      "& .MuiBadge-badge": {
                        fontSize: "0.65rem",
                        height: "16px",
                        minWidth: "16px",
                        padding: "0 3px",
                      },
                    }}
                  />
                )}
              </div>
              <span className="text-xs truncate w-full">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
