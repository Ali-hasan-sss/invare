"use client";

import { useState, useEffect } from "react";

export type ThemeMode = "light" | "dark" | "system";

export const useTheme = () => {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Initialize theme from localStorage or default to system
    if (typeof window !== "undefined") {
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
    }
  }, []);

  useEffect(() => {
    // Update document class when theme changes
    if (typeof window !== "undefined") {
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [isDark]);

  useEffect(() => {
    // Listen for system theme changes
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        if (mode === "system") {
          setIsDark(e.matches);
        }
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [mode]);

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);

    if (typeof window !== "undefined") {
      localStorage.setItem("theme-mode", newMode);

      if (newMode === "system") {
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setIsDark(systemPrefersDark);
      } else {
        const shouldBeDark = newMode === "dark";
        setIsDark(shouldBeDark);
      }
    }
  };

  return {
    mode,
    isDark,
    setThemeMode,
  };
};
