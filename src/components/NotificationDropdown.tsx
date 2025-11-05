"use client";

import React, { useEffect } from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Badge,
} from "@mui/material";
import { Bell, Check, CheckCheck, Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useNotifications } from "@/hooks/useNotifications";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface NotificationDropdownProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  anchorEl,
  open,
  onClose,
}) => {
  const { t, currentLanguage } = useTranslation();
  const router = useRouter();
  const isRTL = currentLanguage.code === "ar";
  const {
    notifications,
    unreadCount,
    isLoading,
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useNotifications();

  // Fetch notifications when menu opens
  useEffect(() => {
    if (open) {
      getNotifications();
    }
  }, [open, getNotifications]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAllNotificationsAsRead();
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      // Less than a minute
      if (diffInSeconds < 60) {
        return t("common.justNow") || "الآن";
      }

      // Less than an hour
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${t("common.minutesAgo") || "دقائق"} ${
          t("common.ago") || "مضت"
        }`;
      }

      // Less than a day
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${t("common.hoursAgo") || "ساعات"} ${
          t("common.ago") || "مضت"
        }`;
      }

      // Format full date
      return date.toLocaleDateString(
        currentLanguage.code === "ar" ? "ar-SA" : "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return dateString;
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: isRTL ? "left" : "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: isRTL ? "left" : "right",
      }}
      disableScrollLock={true}
      slotProps={{
        paper: {
          style: {
            minWidth: "320px",
            maxWidth: "400px",
            maxHeight: "500px",
            position: "fixed",
          },
          className:
            "bg-white dark:bg-gray-800 text-black dark:text-white shadow-lg",
        },
      }}
    >
      {/* Header */}
      <Box className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {t("notifications.title") || "الإشعارات"}
        </h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <CheckCheck className="h-4 w-4" />
            <span>{t("notifications.markAllRead") || "تحديد الكل كمقروء"}</span>
          </button>
        )}
      </Box>

      {/* Notifications List */}
      <Box className="max-h-[400px] overflow-y-auto">
        {isLoading && notifications.length === 0 ? (
          <Box className="p-4 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400 mx-auto" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t("notifications.loading") || "جاري التحميل..."}
            </p>
          </Box>
        ) : notifications.length === 0 ? (
          <Box className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("notifications.noNotifications") || "لا توجد إشعارات"}
            </p>
          </Box>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              className={cn(
                "hover:bg-gray-50 dark:hover:bg-gray-700",
                !notification.read && "bg-blue-50 dark:bg-blue-900/20"
              )}
              onClick={() => {
                if (!notification.read) {
                  markNotificationAsRead(notification.id);
                }
                onClose();
              }}
            >
              <Box className="flex-1 min-w-0">
                <Box
                  className={cn(
                    "flex items-start justify-between mb-1",
                    isRTL ? "flex-row-reverse" : ""
                  )}
                >
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {notification.title}
                  </h4>
                  {!notification.read && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2" />
                  )}
                </Box>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(notification.createdAt)}
                </p>
              </Box>
              <ListItemIcon
                className={cn("min-w-0 ml-2", isRTL && "mr-2 ml-0")}
              >
                {!notification.read && (
                  <button
                    onClick={(e) => handleMarkAsRead(notification.id, e)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title={t("notifications.markAsRead") || "تحديد كمقروء"}
                  >
                    <Check className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </button>
                )}
              </ListItemIcon>
            </MenuItem>
          ))
        )}
      </Box>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Divider />
          <Box className="px-4 py-2 text-center">
            <button
              onClick={() => {
                router.push("/user/notifications");
                onClose();
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {t("notifications.viewAll") || "عرض الكل"}
            </button>
          </Box>
        </>
      )}
    </Menu>
  );
};

export default NotificationDropdown;
