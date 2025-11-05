"use client";

import React from "react";
import { IconButton, Badge } from "@mui/material";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationBellProps {
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onClick }) => {
  const { unreadCount } = useNotifications();

  return (
    <IconButton
      onClick={onClick}
      className="text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20 relative"
      aria-label="notifications"
    >
      <Badge
        badgeContent={unreadCount}
        color="error"
        max={99}
        sx={{
          "& .MuiBadge-badge": {
            fontSize: "0.75rem",
            height: "18px",
            minWidth: "18px",
            padding: "0 4px",
          },
        }}
      >
        <Bell className="w-5 h-5" />
      </Badge>
    </IconButton>
  );
};

export default NotificationBell;
