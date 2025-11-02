"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHomeIcon?: boolean;
  separator?: React.ReactNode;
  variant?: "default" | "minimal" | "elevated";
  size?: "sm" | "md" | "lg";
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className,
  showHomeIcon = true,
  separator = (
    <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
  ),
  variant = "default",
  size = "md",
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "minimal":
        return "bg-transparent border-0 px-0 py-2";
      case "elevated":
        return "bg-white dark:bg-gray-800 shadow-lg border-gray-200 dark:border-gray-700";
      default:
        return "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-2 text-xs";
      case "lg":
        return "px-5 py-4 text-base";
      default:
        return "px-4 py-3 text-sm";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return 12;
      case "lg":
        return 18;
      default:
        return 14;
    }
  };
  return (
    <nav
      className={cn(
        "flex items-center space-x-1 rtl:space-x-reverse rounded-lg backdrop-blur-sm border",
        getSizeClasses(),
        getVariantClasses(),
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1 rtl:space-x-reverse">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center">
              {/* Separator */}
              {!isFirst && <span className="mx-2 rtl:mx-2">{separator}</span>}

              {/* Breadcrumb Item */}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-1 rtl:space-x-reverse hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 px-2 py-1 rounded-md",
                    isFirst && showHomeIcon && "pl-1"
                  )}
                >
                  {isFirst && showHomeIcon && (
                    <Home
                      size={getIconSize()}
                      className="mr-1 rtl:ml-1 rtl:mr-0"
                    />
                  )}
                  {item.icon && !isFirst && (
                    <span className="mr-1 rtl:ml-1 rtl:mr-0">{item.icon}</span>
                  )}
                  <span className="font-medium">{item.label}</span>
                </Link>
              ) : item.onClick && !isLast ? (
                <button
                  onClick={item.onClick}
                  className={cn(
                    "flex items-center space-x-1 rtl:space-x-reverse hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 px-2 py-1 rounded-md",
                    isFirst && showHomeIcon && "pl-1"
                  )}
                >
                  {isFirst && showHomeIcon && (
                    <Home
                      size={getIconSize()}
                      className="mr-1 rtl:ml-1 rtl:mr-0"
                    />
                  )}
                  {item.icon && !isFirst && (
                    <span className="mr-1 rtl:ml-1 rtl:mr-0">{item.icon}</span>
                  )}
                  <span className="font-medium">{item.label}</span>
                </button>
              ) : (
                <span
                  className={cn(
                    "flex items-center space-x-1 rtl:space-x-reverse text-gray-900 dark:text-gray-100 font-semibold px-2 py-1",
                    isFirst && showHomeIcon && "pl-1"
                  )}
                  aria-current="page"
                >
                  {isFirst && showHomeIcon && (
                    <Home
                      size={getIconSize()}
                      className="mr-1 rtl:ml-1 rtl:mr-0"
                    />
                  )}
                  {item.icon && !isFirst && (
                    <span className="mr-1 rtl:ml-1 rtl:mr-0">{item.icon}</span>
                  )}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export { Breadcrumbs };
