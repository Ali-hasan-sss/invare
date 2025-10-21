"use client";

import React from "react";
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Globe, ChevronDown } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setLanguage } from "@/store/slices/languageSlice";

const LanguageSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentLanguage, availableLanguages } = useAppSelector(
    (state) => state.language
  );
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (languageCode: string) => {
    dispatch(setLanguage(languageCode));
    handleClose();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label="language switcher"
      >
        <Globe className="w-5 h-5 mr-1" />
        <span className="text-lg mr-1">{currentLanguage.flag}</span>
        <ChevronDown className="w-4 h-4" />
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
            className: "dark:bg-gray-800 dark:text-white",
          },
        }}
        className="mt-2"
      >
        {availableLanguages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={language.code === currentLanguage.code}
            className="min-w-[120px]"
          >
            <ListItemIcon>
              <span className="text-lg">{language.flag}</span>
            </ListItemIcon>
            <ListItemText primary={language.name} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
