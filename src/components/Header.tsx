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
  LayoutGrid,
  Search,
  ChevronDown,
  LogIn,
  LogOut,
  User,
  Settings,
  ShoppingBag,
  Gavel,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppSelector } from "@/store/hooks";
import { useMaterialsList } from "@/hooks/useMaterials";
import { useMaterialCategoriesList } from "@/hooks/useMaterialCategories";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ClientOnly from "./ClientOnly";
import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import UserMenu from "@/components/UserMenu";

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useAppSelector((state) => state.language);
  const { user, isAuthenticated, logout: logoutUser } = useAuth();
  const {
    materials,
    isLoading: materialsLoading,
    getMaterials,
  } = useMaterialsList();
  const {
    categories,
    isLoading: categoriesLoading,
    getCategories,
  } = useMaterialCategoriesList();
  const router = useRouter();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  // Desktop menu states

  const [supportAnchor, setSupportAnchor] = React.useState<null | HTMLElement>(
    null
  );
  const [materialsAnchor, setMaterialsAnchor] =
    React.useState<null | HTMLElement>(null);

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Materials and categories loading state
  const [categoriesFetched, setCategoriesFetched] = React.useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<
    string | null
  >(null);
  const [categorySubmenuAnchor, setCategorySubmenuAnchor] =
    React.useState<null | HTMLElement>(null);

  // Mobile drawer materials state
  const [mobileCategoriesFetched, setMobileCategoriesFetched] =
    React.useState(false);
  const [mobileShowCategories, setMobileShowCategories] = React.useState(false);
  const [mobileSelectedCategoryId, setMobileSelectedCategoryId] =
    React.useState<string | null>(null);
  const [mobileShowMaterials, setMobileShowMaterials] = React.useState(false);

  // User menu state
  const [userMenuAnchor, setUserMenuAnchor] =
    React.useState<null | HTMLElement>(null);

  // Desktop menu handlers

  const handleSupportClick = (event: React.MouseEvent<HTMLElement>) => {
    setSupportAnchor(event.currentTarget);
  };
  const handleMaterialsClick = (event: React.MouseEvent<HTMLElement>) => {
    setMaterialsAnchor(event.currentTarget);

    // Fetch categories if not already fetched
    if (!categoriesFetched && !categoriesLoading) {
      getCategories();
      setCategoriesFetched(true);
    }
  };

  const handleCategoryClick = (
    event: React.MouseEvent<HTMLElement>,
    categoryId: string
  ) => {
    event.stopPropagation();
    setCategorySubmenuAnchor(event.currentTarget);
    setSelectedCategoryId(categoryId);

    // Fetch materials for this category
    getMaterials({ categoryId });
  };

  const handleClose = () => {
    setSupportAnchor(null);
    setMaterialsAnchor(null);
    setCategorySubmenuAnchor(null);
    setSelectedCategoryId(null);
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  // Mobile drawer handlers
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileMaterialsClick = () => {
    // Fetch categories if not already fetched
    if (!mobileCategoriesFetched && !categoriesLoading) {
      getCategories();
      setMobileCategoriesFetched(true);
    }
    // Toggle categories visibility
    setMobileShowCategories(!mobileShowCategories);
    setMobileShowMaterials(false);
    setMobileSelectedCategoryId(null);
  };

  const handleMobileCategoryClick = (categoryId: string) => {
    setMobileSelectedCategoryId(categoryId);
    setMobileShowMaterials(true);
    // Fetch materials for this category
    getMaterials({ categoryId });
  };

  const handleMobileBackToCategories = () => {
    setMobileShowMaterials(false);
    setMobileSelectedCategoryId(null);
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
          className="text-gray-600 dark:text-gray-300"
        >
          <X size={24} />
        </IconButton>
      </Box>

      {/* Search Bar */}
      <Box className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Box className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-2 shadow-sm">
          <IconButton className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
            <LayoutGrid size={20} />
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
            onClick={handleMobileMaterialsClick}
          >
            <MuiListItemText primary={t("navigation.materials")} />
            <ChevronDown
              size={16}
              className={`transition-transform ${
                mobileShowCategories ? "rotate-180" : ""
              }`}
            />
          </ListItemButton>
        </ListItem>

        {/* Categories in mobile */}
        {mobileShowCategories && (
          <Box className="ml-4 mb-2">
            {/* Loading state */}
            {categoriesLoading && (
              <Box className="flex items-center py-2 px-3 text-gray-500 dark:text-gray-400">
                <Box className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2" />
                {t("common.loading")}...
              </Box>
            )}

            {/* Categories list */}
            {categories.length > 0 &&
              !categoriesLoading &&
              !mobileShowMaterials &&
              categories.map((category) => (
                <ListItem key={category.id} disablePadding>
                  <ListItemButton
                    className="rounded-lg mb-1 py-2"
                    onClick={() => handleMobileCategoryClick(category.id)}
                  >
                    <MuiListItemText
                      primary={category.name}
                      className="text-sm"
                    />
                    <ChevronDown size={14} className="transform -rotate-90" />
                  </ListItemButton>
                </ListItem>
              ))}

            {/* Materials view */}
            {mobileShowMaterials && mobileSelectedCategoryId && (
              <Box>
                {/* Back button */}
                <ListItem disablePadding>
                  <ListItemButton
                    className="rounded-lg mb-2 py-2"
                    onClick={handleMobileBackToCategories}
                  >
                    <ChevronDown
                      size={14}
                      className="transform rotate-90 mr-2"
                    />
                    <MuiListItemText
                      primary={t("common.back")}
                      className="text-sm text-purple-600 dark:text-purple-400"
                    />
                  </ListItemButton>
                </ListItem>

                {/* Materials loading */}
                {materialsLoading && (
                  <Box className="flex items-center py-2 px-3 text-gray-500 dark:text-gray-400">
                    <Box className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2" />
                    {t("common.loading")}...
                  </Box>
                )}

                {/* Materials list */}
                {materials.length > 0 &&
                  !materialsLoading &&
                  materials.map((material) => (
                    <ListItem key={material.id} disablePadding>
                      <ListItemButton
                        className="rounded-lg mb-1 py-2"
                        onClick={() => {
                          router.push(`/listings/${material.id}`);
                          handleDrawerToggle();
                        }}
                      >
                        <Box>
                          <MuiListItemText
                            primary={material.name}
                            className="text-sm"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {material.unitOfMeasure}
                          </span>
                        </Box>
                      </ListItemButton>
                    </ListItem>
                  ))}

                {/* No materials found */}
                {materials.length === 0 && !materialsLoading && (
                  <Box className="py-2 px-3 text-gray-500 dark:text-gray-400 text-sm">
                    {t("common.noDataFound")}
                  </Box>
                )}
              </Box>
            )}

            {/* No categories found */}
            {categories.length === 0 &&
              !categoriesLoading &&
              mobileCategoriesFetched && (
                <Box className="py-2 px-3 text-gray-500 dark:text-gray-400 text-sm">
                  {t("common.noDataFound")}
                </Box>
              )}
          </Box>
        )}
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

      {/* Auth Section */}
      <Box className="p-4 border-t border-gray-200 dark:border-gray-700">
        {isAuthenticated && user ? (
          <div className="space-y-3">
            {/* User Info */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Avatar
                size="medium"
                src={user.avatar}
                fallback={user.firstName + " " + user.lastName}
                alt={user.firstName}
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </div>
              </div>
            </div>

            {/* User Menu Items */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => {
                  router.push("/user/purchases");
                  handleDrawerToggle();
                }}
              >
                <ShoppingBag size={16} className="ltr:mr-2 rtl:ml-2" />
                {t("user.myPurchases")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => {
                  router.push("/user/auctions");
                  handleDrawerToggle();
                }}
              >
                <Gavel size={16} className="ltr:mr-2 rtl:ml-2" />
                {t("user.myAuctions")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => {
                  router.push("/profile");
                  handleDrawerToggle();
                }}
              >
                <User size={16} className="ltr:mr-2 rtl:ml-2" />
                {t("user.profile")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => {
                  router.push("/settings");
                  handleDrawerToggle();
                }}
              >
                <Settings size={16} className="ltr:mr-2 rtl:ml-2" />
                {t("user.settings")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={async () => {
                  try {
                    await logoutUser();
                    handleDrawerToggle();
                    router.push("/");
                  } catch (error) {
                    console.error("Logout error:", error);
                  }
                }}
              >
                <LogOut size={16} className="ltr:mr-2 rtl:ml-2" />
                {t("user.logout")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
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
          </div>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        className="backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50 z-50"
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
              {/* Listings Link */}
              <ClientOnly
                fallback={
                  <div className="flex items-center text-gray-700 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors cursor-pointer">
                    <span>{t("listings.allListings")}</span>
                  </div>
                }
              >
                <Link
                  href="/listings"
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"
                >
                  <span>{t("listings.allListings")}</span>
                </Link>
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
                <LayoutGrid size={20} />
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
                {/* Auth buttons or User menu */}
                <ClientOnly
                  fallback={
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="primary"
                        className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-4 py-2 rounded-md shadow-md"
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
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="primary"
                        className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-4 py-2 rounded-md shadow-md"
                        sx={{ color: "white !important" }}
                        onClick={() => router.push("/auth/register")}
                      >
                        {t("auth.register")}
                      </Button>
                      <Link
                        href="/auth/login"
                        className="flex items-center text-gray-700 dark:text-gray-300 hover:text-brand-blue dark:hover:text-brand-blue transition-colors"
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
              className: "dark:bg-gray-800 dark:text-white",
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
          {/* Loading state */}
          {categoriesLoading && (
            <MenuItem disabled>
              <ListItemText
                primary={
                  <Box className="flex items-center">
                    <Box className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2" />
                    {t("common.loading")}...
                  </Box>
                }
              />
            </MenuItem>
          )}

          {/* Categories list */}
          {categories.length > 0 &&
            !categoriesLoading &&
            categories.map((category) => (
              <MenuItem
                key={category.id}
                onClick={(event) => handleCategoryClick(event, category.id)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
              >
                <ListItemText
                  primary={category.name}
                  className="text-gray-700 dark:text-gray-300"
                />
                <ChevronDown
                  size={16}
                  className="transform -rotate-90 text-gray-400"
                />
              </MenuItem>
            ))}

          {/* No categories found */}
          {categories.length === 0 &&
            !categoriesLoading &&
            categoriesFetched && (
              <MenuItem disabled>
                <ListItemText
                  primary={t("common.noDataFound")}
                  className="text-gray-500 dark:text-gray-400"
                />
              </MenuItem>
            )}
        </Menu>

        {/* Category Submenu */}
        <Menu
          anchorEl={categorySubmenuAnchor}
          open={Boolean(categorySubmenuAnchor)}
          onClose={() => {
            setCategorySubmenuAnchor(null);
            setSelectedCategoryId(null);
          }}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
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
                minWidth: "200px",
              },
              className: "dark:bg-gray-800 dark:text-white",
            },
          }}
        >
          {/* Loading state for materials */}
          {materialsLoading && (
            <MenuItem disabled>
              <ListItemText
                primary={
                  <Box className="flex items-center">
                    <Box className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2" />
                    {t("common.loading")}...
                  </Box>
                }
              />
            </MenuItem>
          )}

          {/* Materials for selected category */}
          {materials.length > 0 &&
            !materialsLoading &&
            selectedCategoryId &&
            materials.map((material) => (
              <MenuItem
                key={material.id}
                onClick={() => {
                  router.push(`/listings/${material.id}`);
                  handleClose();
                }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ListItemText
                  primary={material.name}
                  secondary={material.unitOfMeasure}
                  className="text-gray-700 dark:text-gray-300"
                />
              </MenuItem>
            ))}

          {/* No materials found for category */}
          {materials.length === 0 &&
            !materialsLoading &&
            selectedCategoryId && (
              <MenuItem disabled>
                <ListItemText
                  primary={t("common.noDataFound")}
                  className="text-gray-500 dark:text-gray-400"
                />
              </MenuItem>
            )}
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
    </>
  );
};

export default Header;
