"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setThemeMode, setSystemTheme } from "@/store/slices/themeSlice";

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { mode, isDark } = useAppSelector((state) => state.theme);

  useEffect(() => {
    // Initialize theme on mount
    const initializeTheme = () => {
      if (mode === "system") {
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        dispatch(setSystemTheme(systemPrefersDark));
      } else {
        dispatch(setThemeMode(mode));
      }
    };

    initializeTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (mode === "system") {
        dispatch(setSystemTheme(e.matches));
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [dispatch, mode]);

  useEffect(() => {
    // Update document class when theme changes
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return <>{children}</>;
};

export default ThemeProvider;
