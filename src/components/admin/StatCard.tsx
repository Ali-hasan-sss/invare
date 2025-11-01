"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "../ui/Card";
import { cn } from "../../lib/utils";
import { useTranslation } from "../../hooks/useTranslation";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  loading = false,
}) => {
  const { currentLanguage } = useTranslation();
  const isRTL = currentLanguage.dir === "rtl";

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div
        className={cn(
          "flex items-center justify-between",
          isRTL ? "flex-row-reverse" : ""
        )}
      >
        <div className={cn("flex-1", isRTL ? "text-right" : "text-left")}>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            {title}
          </p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
          ) : (
            <div
              className={cn(
                "flex items-baseline gap-2",
                isRTL ? "flex-row-reverse" : ""
              )}
            >
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {value}
              </p>
              {trend && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  )}
                >
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
          )}
        </div>
        <div className={cn("rounded-full p-4", color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </Card>
  );
};
