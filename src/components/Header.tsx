"use client";

import React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  InputBase,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText as MuiListItemText,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import {
  Grid,
  Search,
  ChevronDown,
  LogIn,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppSelector } from "@/store/hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ClientOnly from "./ClientOnly";
import Image from "next/image";

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useAppSelector((state) => state.language);
  const router = useRouter();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  // Desktop menu states
  const [auctionsAnchor, setAuctionsAnchor] =
    React.useState<null | HTMLElement>(null);
  const [supportAnchor, setSupportAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const [materialsAnchor, setMaterialsAnchor] =
    React.useState<null | HTMLElement>(null);

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Desktop menu handlers
  const handleAuctionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAuctionsAnchor(event.currentTarget);
  };
  const handleSupportClick = (event: React.MouseEvent<HTMLElement>) => {
    setSupportAnchor(event.currentTarget);
  };
  const handleMaterialsClick = (event: React.MouseEvent<HTMLElement>) => {
    setMaterialsAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAuctionsAnchor(null);
    setSupportAnchor(null);
    setMaterialsAnchor(null);
  };

  // Mobile drawer handlers
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Mobile drawer content
  const drawer = (
    <Box className="w-80 h-full bg-white dark:bg-gray-900">
      <Box className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
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
          className="text-gray-600 dark:text-gray-300"
        >
          <X size={24} />
        </IconButton>
      </Box>

      {/* Search Bar */}
      <Box className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Box className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-2 shadow-sm">
          <IconButton className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
            <Grid size={20} />
          </IconButton>
          <Box className="flex items-center border-l border-gray-300 dark:border-gray-600 mx-2 pl-2 flex-1">
            <InputBase
              placeholder={t("navigation.allCategories")}
              className="text-gray-700 dark:text-gray-200 flex-1"
              inputProps={{ "aria-label": "all categories" }}
            />
            <ChevronDown
              size={16}
              className="text-gray-500 dark:text-gray-400"
            />
          </Box>
        </Box>

        <Box className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-2 shadow-sm mt-2">
          <InputBase
            placeholder={t("common.search")}
            className="text-gray-700 dark:text-gray-200 flex-1"
            inputProps={{ "aria-label": "search" }}
          />
          <IconButton className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-md">
            <Search size={20} />
          </IconButton>
        </Box>
      </Box>

      {/* Navigation Links */}
      <List className="p-4">
        <ListItem disablePadding>
          <ListItemButton className="rounded-lg mb-2">
            <MuiListItemText primary={t("navigation.auctions")} />
            <ChevronDown size={16} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton className="rounded-lg mb-2">
            <MuiListItemText primary={t("navigation.support")} />
            <ChevronDown size={16} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton className="rounded-lg mb-2">
            <MuiListItemText primary={t("navigation.materials")} />
            <ChevronDown size={16} />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Language and Theme Controls */}
      <Box className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("common.language")}
          </span>
          <LanguageSwitcher />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("common.theme")}
          </span>
          <ThemeToggle />
        </div>
      </Box>

      {/* Auth Buttons */}
      <Box className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        <Button
          variant="primary"
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-4 py-2 rounded-md shadow-md"
          sx={{ color: "white !important" }}
          onClick={() => {
            router.push("/auth/register");
            handleDrawerToggle();
          }}
        >
          {t("auth.register")}
        </Button>
        <Button
          variant="outline"
          className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={() => {
            router.push("/auth/login");
            handleDrawerToggle();
          }}
        >
          <LogIn size={16} className="ltr:mr-2 rtl:ml-2" />
          {t("common.login")}
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        className=" backdrop-blur-md"
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
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box className="flex items-center space-x-6 rtl:space-x-reverse">
              <ClientOnly
                fallback={
                  <div className="flex items-center text-gray-700 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors cursor-pointer">
                    <span>المزادات</span>
                    <ChevronDown size={16} className="mr-1" />
                  </div>
                }
              >
                <Box
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors cursor-pointer"
                  onClick={handleAuctionsClick}
                >
                  <span>{t("navigation.auctions")}</span>
                  <ChevronDown size={16} className="mr-1" />
                </Box>
              </ClientOnly>

              <ClientOnly
                fallback={
                  <div className="flex items-center text-gray-700 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors cursor-pointer">
                    <span>الدعم</span>
                    <ChevronDown size={16} className="mr-1" />
                  </div>
                }
              >
                <Box
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors cursor-pointer"
                  onClick={handleSupportClick}
                >
                  <span>{t("navigation.support")}</span>
                  <ChevronDown size={16} className="mr-1" />
                </Box>
              </ClientOnly>

              <ClientOnly
                fallback={
                  <div className="flex items-center text-gray-700 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors cursor-pointer">
                    <span>المواد</span>
                    <ChevronDown size={16} className="mr-1" />
                  </div>
                }
              >
                <Box
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors cursor-pointer"
                  onClick={handleMaterialsClick}
                >
                  <span>{t("navigation.materials")}</span>
                  <ChevronDown size={16} className="mr-1" />
                </Box>
              </ClientOnly>
            </Box>
          )}

          {/* Desktop Search Bar */}
          {!isMobile && (
            <Box className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 shadow-sm flex-1 max-w-md mx-4">
              <IconButton className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
                <Grid size={20} />
              </IconButton>
              <Box className="flex items-center border-l border-gray-300 dark:border-gray-600 mx-2 pl-2">
                <ClientOnly
                  fallback={
                    <InputBase
                      placeholder="جميع الفئات"
                      className="text-gray-700 dark:text-gray-200 w-32"
                      inputProps={{ "aria-label": "all categories" }}
                    />
                  }
                >
                  <InputBase
                    placeholder={t("navigation.allCategories")}
                    className="text-gray-700 dark:text-gray-200 w-32"
                    inputProps={{ "aria-label": "all categories" }}
                  />
                </ClientOnly>
                <ChevronDown
                  size={16}
                  className="text-gray-500 dark:text-gray-400"
                />
              </Box>
              <Box className="search-input-container border-l border-gray-300 dark:border-gray-600 mx-2 pl-2">
                <ClientOnly
                  fallback={
                    <InputBase
                      placeholder="بحث"
                      className="text-gray-700 dark:text-gray-200 flex-1"
                      inputProps={{ "aria-label": "search" }}
                    />
                  }
                >
                  <InputBase
                    placeholder={t("common.search")}
                    className="text-gray-700 dark:text-gray-200 flex-1"
                    inputProps={{ "aria-label": "search" }}
                  />
                </ClientOnly>
                <IconButton className="search-icon p-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 rounded-md flex-shrink-0">
                  <Search size={20} />
                </IconButton>
              </Box>
            </Box>
          )}

          {/* Right Section: User/Utility Controls */}
          <Box className="flex items-center space-x-2 rtl:space-x-reverse">
            {isMobile ? (
              <IconButton
                onClick={handleDrawerToggle}
                className="text-gray-600 dark:text-gray-300"
              >
                <MenuIcon size={24} />
              </IconButton>
            ) : (
              <>
                <ClientOnly fallback={<div className="w-8 h-8" />}>
                  <LanguageSwitcher />
                </ClientOnly>
                <ClientOnly fallback={<div className="w-8 h-8" />}>
                  <ThemeToggle />
                </ClientOnly>
                <ClientOnly
                  fallback={
                    <Button
                      variant="primary"
                      className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-4 py-2 rounded-md shadow-md"
                      sx={{ color: "white !important" }}
                    >
                      إنشاء حساب
                    </Button>
                  }
                >
                  <Button
                    variant="primary"
                    className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-4 py-2 rounded-md shadow-md"
                    sx={{ color: "white !important" }}
                    onClick={() => router.push("/auth/register")}
                  >
                    {t("auth.register")}
                  </Button>
                </ClientOnly>
                <ClientOnly
                  fallback={
                    <Link
                      href="/auth/login"
                      className="flex items-center text-gray-700 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"
                    >
                      تسجيل الدخول
                      <LogIn size={16} className="ltr:ml-1 rtl:mr-1" />
                    </Link>
                  }
                >
                  <Link
                    href="/auth/login"
                    className="flex items-center text-gray-700 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"
                  >
                    {t("common.login")}
                    <LogIn size={16} className="ltr:ml-1 rtl:mr-1" />
                  </Link>
                </ClientOnly>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Desktop Dropdown Menus */}
      <ClientOnly fallback={null}>
        <Menu
          anchorEl={auctionsAnchor}
          open={Boolean(auctionsAnchor)}
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
              className: "dark:bg-gray-800 dark:text-white",
            },
          }}
        >
          <MenuItem onClick={handleClose}>
            <ListItemText primary={t("navigation.liveAuctions")} />
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemText primary={t("navigation.upcomingAuctions")} />
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemText primary={t("navigation.endedAuctions")} />
          </MenuItem>
        </Menu>

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
              className: "dark:bg-gray-800 dark:text-white",
            },
          }}
        >
          <MenuItem onClick={handleClose}>
            <ListItemText primary={t("navigation.helpCenter")} />
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemText primary={t("navigation.contactUs")} />
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemText primary={t("navigation.faq")} />
          </MenuItem>
        </Menu>

        <Menu
          anchorEl={materialsAnchor}
          open={Boolean(materialsAnchor)}
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
              className: "dark:bg-gray-800 dark:text-white",
            },
          }}
        >
          <MenuItem onClick={handleClose}>
            <ListItemText primary={t("navigation.availableMaterials")} />
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemText primary={t("navigation.requestMaterials")} />
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <ListItemText primary={t("navigation.trackOrders")} />
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
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 320 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
