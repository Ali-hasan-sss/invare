"use client";

import React from "react";
import {
  Avatar as MuiAvatar,
  AvatarProps as MuiAvatarProps,
} from "@mui/material";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends Omit<MuiAvatarProps, "size"> {
  size?: "small" | "medium" | "large" | "xlarge";
  src?: string;
  alt?: string;
  children?: React.ReactNode;
  fallback?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  size = "medium",
  src,
  alt,
  children,
  fallback,
  className,
  sx,
  ...props
}) => {
  const sizeClasses = {
    small: "w-8 h-8 text-sm",
    medium: "w-10 h-10 text-base",
    large: "w-12 h-12 text-lg",
    xlarge: "w-16 h-16 text-xl",
  };

  const sizeSx = {
    small: { width: 32, height: 32, fontSize: "0.875rem" },
    medium: { width: 40, height: 40, fontSize: "1rem" },
    large: { width: 48, height: 48, fontSize: "1.125rem" },
    xlarge: { width: 64, height: 64, fontSize: "1.25rem" },
  };

  const getIconSize = () => {
    switch (size) {
      case "small":
        return 16;
      case "medium":
        return 20;
      case "large":
        return 24;
      case "xlarge":
        return 32;
      default:
        return 20;
    }
  };

  const displayContent = () => {
    if (children) return children;
    return <User size={getIconSize()} className="text-white" />;
  };

  return (
    <MuiAvatar
      src={src}
      alt={alt}
      className={cn(
        sizeClasses[size],
        "bg-gradient-to-br from-purple-600 to-blue-500 text-white font-medium shadow-md hover:shadow-lg transition-shadow cursor-pointer",
        className
      )}
      sx={{
        ...sizeSx[size],
        ...sx,
      }}
      {...props}
    >
      {!src && displayContent()}
    </MuiAvatar>
  );
};

export { Avatar };
