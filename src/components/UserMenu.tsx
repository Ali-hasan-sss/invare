"use client";

import React from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from "@mui/material";
import {
  User,
  LogOut,
  ShoppingBag,
  Gavel,
  MessageCircle,
  Tag,
  LayoutDashboard,
  Heart,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ anchorEl, open, onClose }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleProfileClick = () => {
    router.push("/profile");
    onClose();
  };

  const handleInterestsClick = () => {
    router.push("/profile?tab=interests");
    onClose();
  };

  const handlePurchasesClick = () => {
    router.push("/user/purchases");
    onClose();
  };

  const handleAuctionsClick = () => {
    router.push("/user/auctions");
    onClose();
  };

  const handleChatsClick = () => {
    router.push("/user/chat");
    onClose();
  };

  const handleMyListingsClick = () => {
    router.push("/user/listings");
    onClose();
  };

  const handleDashboardClick = () => {
    router.push("/user/dashboard");
    onClose();
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!user) return null;

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      disableScrollLock={true}
      slotProps={{
        paper: {
          style: {
            minWidth: "200px",
            position: "fixed",
          },
          className:
            "bg-white dark:bg-gray-800 text-black dark:text-white shadow-lg",
        },
      }}
    >
      {/* User Info Header */}
      <Box className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
        <Box className="flex items-center space-x-3 rtl:space-x-reverse">
          <Avatar
            size="medium"
            src={user.avatar}
            fallback={user.firstName + " " + user.lastName}
            alt={user.firstName}
          />
          <Box>
            <div className="font-medium text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </div>
          </Box>
        </Box>
      </Box>

      {/* Menu Items */}
      <MenuItem
        onClick={handleDashboardClick}
        className="hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <ListItemIcon className="text-gray-600 dark:text-gray-300">
          <LayoutDashboard size={20} />
        </ListItemIcon>
        <ListItemText primary={t("user.dashboard") || "لوحة التحكم"} />
      </MenuItem>

      <MenuItem
        onClick={handlePurchasesClick}
        className="hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <ListItemIcon className="text-gray-600 dark:text-gray-300">
          <ShoppingBag size={20} />
        </ListItemIcon>
        <ListItemText primary={t("user.myPurchases") || "مشترياتي"} />
      </MenuItem>

      <MenuItem
        onClick={handleAuctionsClick}
        className="hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <ListItemIcon className="text-gray-600 dark:text-gray-300">
          <Gavel size={20} />
        </ListItemIcon>
        <ListItemText primary={t("user.myAuctions") || "مزاداتي"} />
      </MenuItem>
      <MenuItem
        onClick={handleMyListingsClick}
        className="hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <ListItemIcon className="text-gray-600 dark:text-gray-300">
          <Tag size={20} />
        </ListItemIcon>
        <ListItemText primary={t("user.myListings") || "عروضي"} />
      </MenuItem>
      <MenuItem
        onClick={handleChatsClick}
        className="hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <ListItemIcon className="text-gray-600 dark:text-gray-300">
          <MessageCircle size={20} />
        </ListItemIcon>
        <ListItemText primary={t("chat.myChats") || "محادثاتي"} />
      </MenuItem>

      <MenuItem
        onClick={handleProfileClick}
        className="hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <ListItemIcon className="text-gray-600 dark:text-gray-300">
          <User size={20} />
        </ListItemIcon>
        <ListItemText primary={t("user.profile")} />
      </MenuItem>

      <MenuItem
        onClick={handleInterestsClick}
        className="hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <ListItemIcon className="text-gray-600 dark:text-gray-300">
          <Heart size={20} />
        </ListItemIcon>
        <ListItemText primary={t("profile.interests") || "اهتماماتي"} />
      </MenuItem>

      <Divider className="my-1" />

      <MenuItem
        onClick={handleLogout}
        className="hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <ListItemIcon className="text-red-600 dark:text-red-400">
          <LogOut size={20} />
        </ListItemIcon>
        <ListItemText
          primary={t("user.logout")}
          className="text-red-600 dark:text-red-400"
        />
      </MenuItem>
    </Menu>
  );
};

export default UserMenu;
