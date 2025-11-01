import React from "react";
import { cn } from "../../lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
}

const variantStyles = {
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  warning:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
);
Badge.displayName = "Badge";
