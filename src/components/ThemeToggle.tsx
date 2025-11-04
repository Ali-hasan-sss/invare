"use client";

import React, { useState, useEffect } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

type ThemeMode = "light" | "dark" | "system";

const ThemeToggle: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const [mode, setMode] = useState<ThemeMode>("system");
  const [isDark, setIsDark] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Initialize theme
  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === "undefined") return;

    const savedMode =
      (localStorage.getItem("theme-mode") as ThemeMode) || "system";
    setMode(savedMode);

    if (savedMode === "system") {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDark(systemPrefersDark);
    } else {
      setIsDark(savedMode === "dark");
    }
  }, []);

  // Update document class when theme changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (mode === "system") {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [mode]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem("theme-mode", newMode);

    if (newMode === "system") {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setIsDark(systemPrefersDark);
    } else {
      setIsDark(newMode === "dark");
    }

    handleClose();
  };

  const getCurrentIcon = () => {
    if (mode === "system") {
      return <Monitor className="w-5 h-5" />;
    }
    return isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />;
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        className="text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/20"
        aria-label="theme switcher"
      >
        {getCurrentIcon()}
        <ChevronDown className="w-4 h-4 ml-1" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: currentLanguage.dir === "rtl" ? "left" : "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: currentLanguage.dir === "rtl" ? "left" : "right",
        }}
        disableScrollLock={true}
        slotProps={{
          paper: {
            style: {
              position: "fixed",
            },
            className: "bg-white dark:bg-gray-800 text-black dark:text-white",
          },
        }}
        className="mt-2"
      >
        <MenuItem onClick={() => handleThemeChange("light")}>
          <ListItemIcon>
            <Sun className="w-5 h-5 text-black dark:text-white" />
          </ListItemIcon>
          <ListItemText primary={t("theme.light")} />
        </MenuItem>

        <MenuItem onClick={() => handleThemeChange("dark")}>
          <ListItemIcon>
            <Moon className="w-5 h-5 text-black dark:text-white" />
          </ListItemIcon>
          <ListItemText primary={t("theme.dark")} />
        </MenuItem>

        <MenuItem onClick={() => handleThemeChange("system")}>
          <ListItemIcon>
            <Monitor className="w-5 h-5 text-black dark:text-white" />
          </ListItemIcon>
          <ListItemText primary={t("theme.system")} />
        </MenuItem>
      </Menu>
    </>
  );
};

export default ThemeToggle;
