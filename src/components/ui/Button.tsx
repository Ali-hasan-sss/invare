"use client";

import React from "react";
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
} from "@mui/material";
import { cn } from "@/lib/utils";

interface ButtonProps extends Omit<MuiButtonProps, "variant" | "size"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const getVariantStyles = () => {
      switch (variant) {
        case "primary":
          return "bg-brand-blue hover:bg-brand-blue/90 text-white shadow-md hover:shadow-lg";
        case "secondary":
          return "bg-secondary-100 hover:bg-secondary-200 text-secondary-900 dark:bg-secondary-800 dark:hover:bg-secondary-700 dark:text-secondary-100";
        case "outline":
          return "border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white dark:border-brand-blue dark:text-brand-blue dark:hover:bg-brand-blue dark:hover:text-white";
        case "ghost":
          return "text-brand-blue hover:bg-brand-blue/10 dark:text-brand-blue dark:hover:bg-brand-blue/20";
        case "destructive":
          return "bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg";
        default:
          return "bg-brand-blue hover:bg-brand-blue/90 text-white shadow-md hover:shadow-lg";
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case "sm":
          return "px-3 py-1.5 text-sm";
        case "md":
          return "px-4 py-2 text-base";
        case "lg":
          return "px-6 py-3 text-lg";
        default:
          return "px-4 py-2 text-base";
      }
    };

    return (
      <MuiButton
        ref={ref}
        className={cn(
          "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/50 disabled:opacity-50 disabled:cursor-not-allowed",
          getVariantStyles(),
          getSizeStyles(),
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <CircularProgress
            size={size === "sm" ? 16 : size === "lg" ? 24 : 20}
            className="mr-2"
            color="inherit"
          />
        )}
        {children}
      </MuiButton>
    );
  }
);

Button.displayName = "Button";

export { Button };
