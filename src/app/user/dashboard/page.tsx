"use client";

import React from "react";
import { useTranslation } from "../../../hooks/useTranslation";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";
import { Card } from "../../../components/ui/Card";
import {
  Tag,
  ShoppingBag,
  Gavel,
  MessageCircle,
  LayoutDashboard,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../../components/ui/Button";
import { useAppSelector } from "../../../store/hooks";
import { Badge } from "@mui/material";

export default function DashboardPage() {
  const { t, currentLanguage } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const isRTL = currentLanguage.code === "ar";
  const unreadChatsCount = useAppSelector((state) => state.chat.unreadChatsCount);

  const dashboardItems = [
    {
      id: "listings",
      title: t("user.myListings") || "عروضي",
      description: t("user.manageListings") || "إدارة عروضك",
      icon: Tag,
      path: "/user/listings",
      color:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    },
    {
      id: "purchases",
      title: t("user.myPurchases") || "مشترياتي",
      description: t("user.viewPurchases") || "عرض مشترياتك",
      icon: ShoppingBag,
      path: "/user/purchases",
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    },
    {
      id: "auctions",
      title: t("user.myAuctions") || "مزاداتي",
      description: t("user.viewAuctions") || "عرض مزاداتك",
      icon: Gavel,
      path: "/user/auctions",
      color:
        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    },
    {
      id: "chats",
      title: t("chat.myChats") || "محادثاتي",
      description: t("chat.viewChats") || "عرض محادثاتك",
      icon: MessageCircle,
      path: "/user/chat",
      color:
        "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
    },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 mb-2">
          <LayoutDashboard className="h-8 w-8 text-purple-600" />
          {t("user.dashboard") || "لوحة التحكم"}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t("user.welcomeBack") || "مرحباً"} {user?.firstName || ""}
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {dashboardItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(item.path)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        item.color
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    {item.id === "chats" && unreadChatsCount > 0 && (
                      <Badge
                        badgeContent={unreadChatsCount}
                        color="error"
                        max={99}
                        sx={{
                          "& .MuiBadge-badge": {
                            fontSize: "0.75rem",
                            height: "20px",
                            minWidth: "20px",
                            padding: "0 6px",
                          },
                        }}
                      />
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {item.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("mt-2", isRTL ? "mr-auto" : "ml-auto")}
                >
                  {isRTL ? (
                    <ArrowLeft className="h-5 w-5" />
                  ) : (
                    <ArrowRight className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
