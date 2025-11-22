"use client";

import React, { useState } from "react";
import { Menu as MenuIcon } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";
import UserMenu from "@/components/UserMenu";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface AdminNavbarProps {
  onMenuClick: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ onMenuClick }) => {
  const { t, currentLanguage } = useTranslation();
  const { user } = useAuth();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(
    null
  );
  const isRTL = currentLanguage.dir === "rtl";

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav
        dir={currentLanguage.dir}
        className="hidden lg:block sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              "flex h-16 items-center",
              isRTL ? "flex-row-reverse justify-between" : "justify-between"
            )}
          >
            {/* Title */}
            <div className="flex items-center">
              <h1
                className={cn(
                  "text-xl font-bold text-gray-900 dark:text-white",
                  isRTL ? "text-right" : "text-left"
                )}
              >
                {t("admin.title")}
              </h1>
            </div>

            {/* Actions */}
            <div
              className={cn(
                "flex items-center",
                isRTL ? "flex-row-reverse gap-2" : "gap-2"
              )}
            >
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Menu */}
              {user && (
                <button
                  onClick={handleUserMenuOpen}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg",
                    "hover:bg-gray-100 dark:hover:bg-gray-700",
                    "transition-colors duration-200",
                    isRTL ? "flex-row-reverse gap-2" : "gap-2"
                  )}
                >
                  <Avatar
                    size="small"
                    src={user.avatar}
                    fallback={user.firstName + " " + user.lastName}
                    alt={user.firstName}
                  />
                  <div
                    className={cn(
                      "hidden md:block",
                      isRTL ? "text-right" : "text-left"
                    )}
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav
        dir={currentLanguage.dir}
        className="lg:hidden sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="px-4">
          <div
            className={cn(
              "flex h-16 items-center",
              isRTL ? "flex-row-reverse justify-between" : "justify-between"
            )}
          >
            {/* Menu Button & Title */}
            <div
              className={cn(
                "flex items-center",
                isRTL ? "flex-row-reverse gap-3" : "gap-3"
              )}
            >
              <button
                type="button"
                onClick={onMenuClick}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <MenuIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>
              <h1
                className={cn(
                  "text-lg font-semibold text-gray-900 dark:text-white",
                  isRTL ? "text-right" : "text-left"
                )}
              >
                {t("admin.title")}
              </h1>
            </div>

            {/* Actions */}
            <div
              className={cn(
                "flex items-center",
                isRTL ? "flex-row-reverse gap-2" : "gap-2"
              )}
            >
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Avatar */}
              {user && (
                <button
                  onClick={handleUserMenuOpen}
                  className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Avatar
                    size="small"
                    src={user.avatar}
                    fallback={user.firstName + " " + user.lastName}
                    alt={user.firstName}
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* User Menu Dropdown */}
      <UserMenu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
      />
    </>
  );
};
