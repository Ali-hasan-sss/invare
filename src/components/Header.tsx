"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText as MuiListItemText,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import { ChevronDown, LogIn, Menu as MenuIcon, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppSelector } from "@/store/hooks";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ClientOnly from "./ClientOnly";
import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import UserMenu from "@/components/UserMenu";
import NotificationDropdown from "@/components/NotificationDropdown";
import NotificationBell from "@/components/NotificationBell";

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useAppSelector((state) => state.language);
  const { user, isAuthenticated, logout: logoutUser } = useAuth();
  const router = useRouter();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  // Desktop menu states

  const [supportAnchor, setSupportAnchor] = React.useState<null | HTMLElement>(
    null
  );
  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // User menu state
  const [userMenuAnchor, setUserMenuAnchor] =
    React.useState<null | HTMLElement>(null);

  // Notification menu state
  const [notificationMenuAnchor, setNotificationMenuAnchor] =
    React.useState<null | HTMLElement>(null);

  // Desktop menu handlers

  const handleSupportClick = (event: React.MouseEvent<HTMLElement>) => {
    setSupportAnchor(event.currentTarget);
  };
  const handleClose = () => {
    setSupportAnchor(null);
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNotificationMenuClick = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setNotificationMenuAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationMenuAnchor(null);
  };

  // Mobile drawer handlers
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Mobile drawer content
  const drawer = (
    <Box className="w-80 h-full bg-white dark:bg-gray-900 overflow-x-hidden">
      <Box className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div
            className="flex items-center justify-center cursor-pointer"
            onClick={() => router.push("/")}
          >
            <Image
              src="/images/logo.png"
              alt="logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
        </div>
        <IconButton
          onClick={handleDrawerToggle}
          className="text-black dark:text-white"
        >
          <X size={24} />
        </IconButton>
      </Box>

      {/* Navigation Links */}
      <List className="p-4">
        {/* Listings link */}
        <ListItem disablePadding>
          <ListItemButton
            className="rounded-lg mb-2"
            onClick={() => {
              router.push("/listings");
              handleDrawerToggle();
            }}
          >
            <MuiListItemText primary={t("listings.allListings")} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton className="rounded-lg mb-2">
            <MuiListItemText primary={t("navigation.support")} />
            <ChevronDown size={16} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            className="rounded-lg mb-2"
            onClick={() => {
              router.push("/materials");
              handleDrawerToggle();
            }}
          >
            <MuiListItemText primary={t("navigation.materials")} />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Language and Theme Controls */}
      <Box className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-black dark:text-white">
            {t("common.language")}
          </span>
          <LanguageSwitcher />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-black dark:text-white">
            {t("common.theme")}
          </span>
          <ThemeToggle />
        </div>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        className="backdrop-blur-lg bg-gradient-to-br from-gray-900 via-secondary-900 to-accent-900 z-50 shadow-lg"
      >
        <Toolbar className="flex justify-between items-center py-2 px-4 sm:px-6 lg:px-8">
          {/* Logo Section */}
          <Box className="flex ">
            <div
              className="flex items-center justify-center cursor-pointer"
              onClick={() => router.push("/")}
            >
              <Image
                src="/images/logo.png"
                alt="logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box className="flex items-center space-x-6 rtl:space-x-reverse">
              {/* Listings Link */}
              <ClientOnly
                fallback={
                  <div className="flex items-center text-black dark:text-white hover:opacity-80 transition-colors cursor-pointer font-medium">
                    <span>{t("listings.allListings")}</span>
                  </div>
                }
              >
                <Link
                  href="/listings"
                  className="flex items-center text-black dark:text-white hover:opacity-80 transition-colors font-medium"
                >
                  <span>{t("listings.allListings")}</span>
                </Link>
              </ClientOnly>
              <ClientOnly
                fallback={
                  <div className="flex items-center text-black dark:text-white hover:opacity-80 transition-colors cursor-pointer font-medium">
                    <span>{t("navigation.materials")}</span>
                  </div>
                }
              >
                <Link
                  href="/materials"
                  className="flex items-center text-black dark:text-white hover:opacity-80 transition-colors font-medium"
                >
                  <span>{t("navigation.materials")}</span>
                </Link>
              </ClientOnly>
              <ClientOnly
                fallback={
                  <div className="flex items-center text-black dark:text-white hover:opacity-80 transition-colors cursor-pointer font-medium">
                    <span>الدعم</span>
                    <ChevronDown
                      size={16}
                      className="mr-1 text-black dark:text-white"
                    />
                  </div>
                }
              >
                <Box
                  className="flex items-center text-black dark:text-white hover:opacity-80 transition-colors cursor-pointer font-medium"
                  onClick={handleSupportClick}
                >
                  <span>{t("navigation.support")}</span>
                  <ChevronDown
                    size={16}
                    className="mr-1 text-black dark:text-white"
                  />
                </Box>
              </ClientOnly>
            </Box>
          )}

          {/* Right Section: User/Utility Controls */}
          <Box className="flex items-center space-x-2 rtl:space-x-reverse">
            {isMobile ? (
              <>
                {/* Mobile User Menu - Same as Desktop */}
                <ClientOnly fallback={null}>
                  {isAuthenticated && user ? (
                    <>
                      <div
                        className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-1.5 transition-colors"
                        onClick={handleUserMenuClick}
                      >
                        <Avatar
                          size="small"
                          src={user.avatar}
                          fallback={user.firstName + " " + user.lastName}
                          alt={user.firstName}
                          className="w-8 h-8"
                        />
                        <span className="text-black dark:text-white font-medium text-sm hidden sm:block">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                      {/* Notification Bell for Mobile */}
                      <NotificationBell onClick={handleNotificationMenuClick} />
                    </>
                  ) : (
                    <div className="flex items-center space-x-1 rtl:space-x-reverse">
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-gradient-to-r from-accent-600 to-secondary-500 hover:from-accent-700 hover:to-secondary-600 text-white px-2 py-1 text-xs rounded-md shadow-md"
                        sx={{ color: "white !important" }}
                        onClick={() => router.push("/auth/register")}
                      >
                        {t("auth.register")}
                      </Button>
                      <Link
                        href="/auth/login"
                        className="flex items-center text-black dark:text-white hover:opacity-80 transition-colors text-xs font-medium"
                      >
                        {t("common.login")}
                      </Link>
                    </div>
                  )}
                </ClientOnly>
                {/* Mobile Menu Button */}
                <IconButton
                  onClick={handleDrawerToggle}
                  className="text-black dark:text-white"
                >
                  <MenuIcon size={24} />
                </IconButton>
              </>
            ) : (
              <>
                <ClientOnly fallback={<div className="w-8 h-8" />}>
                  <LanguageSwitcher />
                </ClientOnly>
                <ClientOnly fallback={<div className="w-8 h-8" />}>
                  <ThemeToggle />
                </ClientOnly>
                {/* Auth buttons or User menu */}
                <ClientOnly
                  fallback={
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="primary"
                        className="bg-gradient-to-r from-accent-600 to-secondary-500 hover:from-accent-700 hover:to-secondary-600 text-white px-4 py-2 rounded-md shadow-md"
                        sx={{ color: "white !important" }}
                      >
                        إنشاء حساب
                      </Button>
                      <Link
                        href="/auth/login"
                        className="flex items-center text-gray-700 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"
                      >
                        تسجيل الدخول
                        <LogIn size={16} className="ltr:ml-1 rtl:mr-1" />
                      </Link>
                    </div>
                  }
                >
                  {isAuthenticated && user ? (
                    <>
                      {/* Notification Bell */}
                      <ClientOnly fallback={<div className="w-8 h-8" />}>
                        <NotificationBell
                          onClick={handleNotificationMenuClick}
                        />
                      </ClientOnly>
                      <div
                        className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors"
                        onClick={handleUserMenuClick}
                      >
                        <Avatar
                          size="medium"
                          src={user.avatar}
                          fallback={user.firstName + " " + user.lastName}
                          alt={user.firstName}
                        />
                        <span className="text-black dark:text-white font-medium">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="primary"
                        className="bg-gradient-to-r from-accent-600 to-secondary-500 hover:from-accent-700 hover:to-secondary-600 text-white px-4 py-2 rounded-md shadow-md"
                        sx={{ color: "white !important" }}
                        onClick={() => router.push("/auth/register")}
                      >
                        {t("auth.register")}
                      </Button>
                      <Link
                        href="/auth/login"
                        className="flex items-center text-black dark:text-white hover:opacity-80 transition-colors font-medium"
                      >
                        {t("common.login")}
                        <LogIn size={16} className="ltr:ml-1 rtl:mr-1" />
                      </Link>
                    </div>
                  )}
                </ClientOnly>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Desktop Dropdown Menus */}
      <ClientOnly fallback={null}>
        <Menu
          anchorEl={supportAnchor}
          open={Boolean(supportAnchor)}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          disableScrollLock={true}
          slotProps={{
            paper: {
              style: {
                maxHeight: "300px",
                overflow: "auto",
                position: "fixed",
              },
              className: "bg-white dark:bg-gray-800 text-black dark:text-white",
            },
          }}
        >
          <MenuItem
            onClick={() => {
              router.push("/help-center");
              handleClose();
            }}
          >
            <ListItemText primary={t("navigation.helpCenter")} />
          </MenuItem>
          <MenuItem
            onClick={() => {
              router.push("/contact");
              handleClose();
            }}
          >
            <ListItemText primary={t("navigation.contactUs")} />
          </MenuItem>
          <MenuItem
            onClick={() => {
              router.push("/faq");
              handleClose();
            }}
          >
            <ListItemText primary={t("navigation.faq")} />
          </MenuItem>
        </Menu>
      </ClientOnly>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 320,
            overflowX: "hidden",
          },
        }}
        PaperProps={{
          className: "dark:bg-gray-900 dark:text-white",
        }}
      >
        {drawer}
      </Drawer>

      {/* User Menu */}
      <UserMenu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
      />

      {/* Notification Dropdown */}
      {isAuthenticated && user && (
        <NotificationDropdown
          anchorEl={notificationMenuAnchor}
          open={Boolean(notificationMenuAnchor)}
          onClose={handleNotificationMenuClose}
        />
      )}
    </>
  );
};

export default Header;
