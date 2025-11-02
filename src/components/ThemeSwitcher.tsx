"use client";

import React from "react";
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Sun, Moon, Monitor, ChevronDown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme } from "@/hooks/useTheme";

const ThemeSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { mode, isDark, setThemeMode } = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (themeMode: "light" | "dark" | "system") => {
    console.log("Changing theme to:", themeMode);
    setThemeMode(themeMode);
    handleClose();
  };

  const getCurrentIcon = () => {
    if (mode === "system") {
      return <Monitor className="w-5 h-5" />;
    }
    return isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />;
  };

  const getCurrentText = () => {
    if (mode === "system") {
      return t("theme.system");
    }
    return isDark ? t("theme.dark") : t("theme.light");
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        className="mt-2"
      >
        <MenuItem onClick={() => handleThemeChange("light")}>
          <ListItemIcon>
            <Sun className="w-5 h-5" />
          </ListItemIcon>
          <ListItemText primary={t("theme.light")} />
        </MenuItem>

        <MenuItem onClick={() => handleThemeChange("dark")}>
          <ListItemIcon>
            <Moon className="w-5 h-5" />
          </ListItemIcon>
          <ListItemText primary={t("theme.dark")} />
        </MenuItem>

        <MenuItem onClick={() => handleThemeChange("system")}>
          <ListItemIcon>
            <Monitor className="w-5 h-5" />
          </ListItemIcon>
          <ListItemText primary={t("theme.system")} />
        </MenuItem>
      </Menu>
    </>
  );
};

export default ThemeSwitcher;
