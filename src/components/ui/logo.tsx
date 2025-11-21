"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  onClick?: () => void;
  href?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo: React.FC<LogoProps> = ({
  className,
  onClick,
  href = "/",
  size = "md",
}) => {
  const { currentLanguage } = useTranslation();
  const isRTL = currentLanguage.code === "ar";

  // Size configurations
  const sizeConfig = {
    sm: {
      image: 22,
      text: "text-sm",
      subtext: "text-xs",
      gap: "gap-2",
    },
    md: {
      image: 30,
      text: "text-base",
      subtext: "text-xs",
      gap: "gap-3",
    },
    lg: {
      image: 40,
      text: "text-xl",
      subtext: "text-sm",
      gap: "gap-4",
    },
  };

  const config = sizeConfig[size];

  const logoContent = (
    <div
      className={cn(
        "flex items-center",
        config.gap,
        isRTL ? "flex-row-reverse" : "flex-row",
        className
      )}
      onClick={onClick}
    >
      {/* Logo Text */}
      <div className="flex flex-col">
        <span
          className={cn(
            "font-bold text-gray-900 dark:text-white leading-tight",
            config.text,
            "font-arabic"
          )}
          style={{
            fontFamily: '"Tajawal", "Segoe UI", "Tahoma", "Arial", sans-serif',
          }}
        >
          انفير
        </span>
        <span
          className={cn(
            "font-medium text-gray-600 dark:text-gray-400 leading-tight",
            config.subtext,
            "font-english"
          )}
          style={{
            fontFamily:
              '"Space Grotesk", "Inter", "Segoe UI", "Arial", sans-serif',
            letterSpacing: "-0.01em",
          }}
        >
          invare
        </span>
      </div>
      {/* Logo Image */}
      <div className="flex-shrink-0">
        <Image
          src="/images/logo.png"
          alt="انفير - Invare Logo"
          width={config.image}
          height={config.image}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );

  if (onClick) {
    return (
      <div className="cursor-pointer hover:opacity-80 transition-opacity">
        {logoContent}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="cursor-pointer hover:opacity-80 transition-opacity"
    >
      {logoContent}
    </Link>
  );
};

export default Logo;
