"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Heart,
  Settings,
  MoreVertical,
  Eye,
} from "lucide-react";
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useTranslation } from "../../../hooks/useTranslation";
import { useUsers } from "../../../hooks/useUsers";
import { useMaterials } from "../../../hooks/useMaterials";
import { useCountries } from "../../../hooks/useCountries";
import { useRouter } from "next/navigation";
import {
  User,
  CreateUserData,
  UpdateUserData,
} from "../../../store/slices/usersSlice";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/Table";
import { UserFormDialog } from "../../../components/admin/UserFormDialog";
import { DeleteConfirmDialog } from "../../../components/admin/DeleteConfirmDialog";
import { UserFavoritesDialog } from "../../../components/admin/UserFavoritesDialog";
import { Toast } from "../../../components/ui/Toast";
import { cn } from "../../../lib/utils";
import { getErrorMessageKey } from "../../../lib/errorUtils";
import { getCountryFlag, getCountryName } from "../../../lib/countryUtils";

// Helper function to check if user is admin
const isAdminUser = (user: User): boolean => {
  // Check if user has admin role in roles array
  if (user.roles && user.roles.length > 0) {
    return user.roles.some(
      (role) =>
        role.name?.toLowerCase() === "admin" ||
        role.name?.toLowerCase() === "administrator"
    );
  }
  // Fallback: if roles array is not available, you might need to check roleIds
  // This would require knowing the admin role ID, which is typically stored in the backend
  return false;
};

export default function UsersManagement() {
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage.code === "ar";
  const router = useRouter();
  const {
    isLoading,
    error,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    clearError,
  } = useUsers();

  const { addUserFavoriteMaterials } = useMaterials();
  const { countries, getCountries } = useCountries();

  const [searchQuery, setSearchQuery] = useState("");
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [favoritesDialogOpen, setFavoritesDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{
    [key: string]: HTMLElement | null;
  }>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadedUsers, setLoadedUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const ITEMS_PER_PAGE = 10;
  const normalizedSearch = debouncedSearch.toLowerCase();
  const addUserToState = useCallback((user: User) => {
    setLoadedUsers((prev) => {
      const existingIndex = prev.findIndex((u) => u.id === user.id);
      if (existingIndex !== -1) {
        const cloned = [...prev];
        cloned[existingIndex] = user;
        return cloned;
      }
      return [user, ...prev];
    });
  }, []);

  const updateUserInState = useCallback((user: User) => {
    setLoadedUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
  }, []);

  const removeUserFromState = useCallback((id: string) => {
    setLoadedUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    getCountries();
  }, [getCountries]);

  const fetchUsersPage = useCallback(
    async (targetPage: number, replace = false) => {
      setIsFetchingMore(true);
      const result = await getUsers({
        page: targetPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
      });
      if (result.type.endsWith("/fulfilled")) {
        const data = (result.payload as User[]) || [];
        setLoadedUsers((prev) => {
          if (replace) {
            return data;
          }
          const existingIds = new Set(prev.map((u) => u.id));
          const merged = data.filter((u) => !existingIds.has(u.id));
          return [...prev, ...merged];
        });
        setHasMore(data.length === ITEMS_PER_PAGE);
      } else {
        setHasMore(false);
      }
      setIsFetchingMore(false);
    },
    [getUsers, debouncedSearch]
  );

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchUsersPage(1, true);
  }, [fetchUsersPage]);

  const handleLoadMore = useCallback(() => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchUsersPage(nextPage);
  }, [isFetchingMore, hasMore, page, fetchUsersPage]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node) return;
    if (!hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      }
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, [handleLoadMore, hasMore]);

  // Helper function to get translated error message
  const getErrorMessage = (errorMsg: string | null): string => {
    if (!errorMsg) return t("admin.error");

    const errorKey = getErrorMessageKey(errorMsg);
    return errorKey ? t(errorKey) : t("admin.error");
  };

  useEffect(() => {
    if (error) {
      setToast({ message: getErrorMessage(error), type: "error" });
      clearError();
    }
  }, [error, t]);

  const handleAddUser = () => {
    setSelectedUser(null);
    setUserFormOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setUserFormOpen(true);
    handleMenuClose(user.id);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    handleMenuClose(user.id);
  };

  const handleManageFavorites = (user: User) => {
    setSelectedUser(user);
    setFavoritesDialogOpen(true);
    handleMenuClose(user.id);
  };

  const handleViewDetails = (user: User) => {
    handleMenuClose(user.id);
    router.push(`/admin/users/${user.id}`);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    userId: string
  ) => {
    setMenuAnchor({ ...menuAnchor, [userId]: event.currentTarget });
  };

  const handleMenuClose = (userId: string) => {
    setMenuAnchor({ ...menuAnchor, [userId]: null });
  };

  const handleGoToAdminDashboard = (user: User) => {
    // Redirect to admin dashboard as the selected user
    // You might need to implement a way to impersonate/login as that user
    // For now, we'll just navigate to admin dashboard
    handleMenuClose(user.id);
    router.push("/admin");
  };

  const handleSubmitUser = async (
    data: CreateUserData | UpdateUserData,
    materialIds?: string[]
  ) => {
    try {
      if (selectedUser) {
        const result = await updateUser(
          selectedUser.id,
          data as UpdateUserData
        );
        if (result.type.endsWith("/rejected")) {
          throw new Error("Update failed");
        }
        const updatedUser = result.payload as User;
        if (updatedUser) {
          updateUserInState(updatedUser);
        }
        setToast({ message: t("admin.userUpdatedSuccess"), type: "success" });
      } else {
        const result = await createUser(data as CreateUserData);
        if (result.type.endsWith("/rejected")) {
          throw new Error("Create failed");
        }
        const createdUser = result.payload as User;
        if (createdUser) {
          addUserToState(createdUser);
        }

        if (materialIds && materialIds.length > 0 && createdUser?.id) {
          try {
            const favResult = await addUserFavoriteMaterials({
              userId: createdUser.id,
              materialIds,
            });
            if (favResult.type.endsWith("/fulfilled")) {
              setToast({
                message:
                  t("admin.userCreatedSuccess") +
                  ". " +
                  (t("admin.favoriteMaterialsAddedSuccess") ||
                    "تمت إضافة الاهتمامات بنجاح"),
                type: "success",
              });
            } else {
              setToast({
                message:
                  t("admin.userCreatedSuccess") +
                  ". " +
                  (t("admin.error") || "حدث خطأ في إضافة الاهتمامات"),
                type: "error",
              });
            }
          } catch (favError) {
            console.error("Failed to add favorites:", favError);
            setToast({
              message:
                t("admin.userCreatedSuccess") +
                ". " +
                (t("admin.error") || "حدث خطأ في إضافة الاهتمامات"),
              type: "error",
            });
          }
        } else {
          setToast({
            message: t("admin.userCreatedSuccess"),
            type: "success",
          });
        }
      }
      setUserFormOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      const errorMessage = err?.message || error || t("admin.error");
      setToast({
        message: getErrorMessage(
          typeof errorMessage === "string" ? errorMessage : null
        ),
        type: "error",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      try {
        const result = await deleteUser(selectedUser.id);
        if (result.type.endsWith("/rejected")) {
          throw new Error("Delete failed");
        }
        removeUserFromState(selectedUser.id);
        setToast({ message: t("admin.userDeletedSuccess"), type: "success" });
        setDeleteDialogOpen(false);
        setSelectedUser(null);
      } catch (err: any) {
        const errorMessage = err?.message || error || t("admin.error");
        setToast({
          message: getErrorMessage(
            typeof errorMessage === "string" ? errorMessage : null
          ),
          type: "error",
        });
      }
    }
  };

  const filteredUsers = loadedUsers.filter((user) => {
    if (!normalizedSearch) return true;
    return (
      user.firstName.toLowerCase().includes(normalizedSearch) ||
      user.lastName.toLowerCase().includes(normalizedSearch) ||
      user.email.toLowerCase().includes(normalizedSearch)
    );
  });

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">{t("admin.active")}</Badge>;
      case "inactive":
        return <Badge variant="error">{t("admin.inactive")}</Badge>;
      case "pending":
        return <Badge variant="warning">{t("admin.pending")}</Badge>;
      default:
        return <Badge>{status || "-"}</Badge>;
    }
  };

  const showInitialLoader = isLoading && loadedUsers.length === 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("admin.usersManagement")}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t("admin.users")}
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-4 py-3 px-4">
        <div className="relative w-full">
          <Search
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10",
              isRTL ? "left-3" : "right-3"
            )}
          />
          <Input
            type="text"
            placeholder={t("admin.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "40px",
                borderRadius: "6px",
              },
              "& .MuiOutlinedInput-input": {
                paddingLeft: isRTL ? "14px !important" : "36px !important",
                paddingRight: isRTL ? "36px !important" : "14px !important",
                fontSize: "14px",
              },
            }}
          />
        </div>
      </Card>

      {/* Add Button */}
      <div className="mb-4">
        <Button
          onClick={handleAddUser}
          className="w-full h-10 px-4 !bg-[#2563eb] hover:!bg-[#1d4ed8] dark:!bg-blue-500 dark:hover:!bg-blue-600 font-semibold shadow-md hover:shadow-lg transition-all"
          sx={{
            color: "white !important",
            backgroundColor: "#2563eb !important",
            "&:hover": {
              color: "white !important",
              backgroundColor: "#1d4ed8 !important",
            },
            "&.dark": {
              backgroundColor: "#3b82f6 !important",
            },
            "& *": {
              color: "white !important",
            },
          }}
        >
          <Plus
            className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")}
            style={{ color: "white" }}
          />
          <span style={{ color: "white", fontWeight: 600 }}>
            {t("admin.addUser")}
          </span>
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {showInitialLoader ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            {t("admin.loading")}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            {t("admin.noUsers")}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.firstName")}
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.lastName")}
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.email")}
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.phone")}
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.country") || t("common.country")}
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.accountStatus")}
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.subscriptionTier")}
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <TableCell className="text-center font-medium text-gray-900 dark:text-white">
                    {user.firstName}
                  </TableCell>
                  <TableCell className="text-center text-gray-900 dark:text-white">
                    {user.lastName}
                  </TableCell>
                  <TableCell className="text-center text-gray-900 dark:text-white">
                    {user.email}
                  </TableCell>
                  <TableCell className="text-center text-gray-900 dark:text-white">
                    <span
                      className="inline-block w-full text-left font-mono"
                      dir="ltr"
                    >
                      {user.phone || "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {(() => {
                      // Try to get country code from user.country or find in countries list
                      let countryCode: string | undefined;
                      let countryName: string | undefined;

                      if (user.country) {
                        // If country object exists, check if it has countryCode
                        countryCode = (user.country as any).countryCode;
                        countryName = user.country.name;
                      }

                      // If no countryCode found, try to find country in countries list by countryId
                      if (!countryCode && user.countryId) {
                        const foundCountry = countries.find(
                          (c) => c.id === user.countryId
                        );
                        if (foundCountry) {
                          countryCode = foundCountry.countryCode;
                          countryName = foundCountry.countryName;
                        }
                      }

                      if (countryCode) {
                        const flag = getCountryFlag(countryCode);
                        const translatedName = getCountryName(
                          countryCode,
                          currentLanguage.code as "ar" | "en"
                        );
                        const displayName =
                          translatedName || countryName || "-";

                        return (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg">{flag}</span>
                            <span className="text-gray-900 dark:text-white">
                              {displayName}
                            </span>
                          </div>
                        );
                      }

                      // Fallback: show country name if available
                      if (countryName) {
                        return (
                          <span className="text-gray-900 dark:text-white">
                            {countryName}
                          </span>
                        );
                      }

                      // If nothing found, show dash
                      return (
                        <span className="text-gray-500 dark:text-gray-400">
                          -
                        </span>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      {getStatusBadge(user.accountStatus)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Badge variant="info">
                        {user.subscriptionTier || "free"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, user.id)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[user.id]}
                        open={Boolean(menuAnchor[user.id])}
                        onClose={() => handleMenuClose(user.id)}
                        disableScrollLock
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: isRTL ? "left" : "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: isRTL ? "left" : "right",
                        }}
                        slotProps={{
                          paper: {
                            className: "bg-white dark:bg-gray-800",
                          },
                        }}
                      >
                        <MenuItem
                          onClick={() => handleViewDetails(user)}
                          className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <ListItemIcon>
                            <Eye className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </ListItemIcon>
                          <ListItemText>
                            {t("admin.viewUser") || t("admin.view")}
                          </ListItemText>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleEditUser(user);
                            handleMenuClose(user.id);
                          }}
                          className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <ListItemIcon>
                            <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </ListItemIcon>
                          <ListItemText>{t("admin.edit")}</ListItemText>
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            handleManageFavorites(user);
                            handleMenuClose(user.id);
                          }}
                          className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <ListItemIcon>
                            <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </ListItemIcon>
                          <ListItemText>
                            {t("admin.manageFavorites") || "إدارة الاهتمامات"}
                          </ListItemText>
                        </MenuItem>
                        {isAdminUser(user) && (
                          <MenuItem
                            onClick={() => {
                              handleGoToAdminDashboard(user);
                              handleMenuClose(user.id);
                            }}
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <ListItemIcon>
                              <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            </ListItemIcon>
                            <ListItemText>
                              {t("admin.goToAdminDashboard") ||
                                "الذهاب إلى لوحة التحكم"}
                            </ListItemText>
                          </MenuItem>
                        )}
                        <MenuItem
                          onClick={() => {
                            handleDeleteUser(user);
                            handleMenuClose(user.id);
                          }}
                          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <ListItemIcon>
                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </ListItemIcon>
                          <ListItemText className="text-red-600 dark:text-red-400">
                            {t("admin.delete")}
                          </ListItemText>
                        </MenuItem>
                      </Menu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!showInitialLoader && (
          <div
            ref={loadMoreRef}
            className="py-4 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            {isFetchingMore && hasMore
              ? t("admin.loading")
              : hasMore
              ? t("admin.scrollToLoadMore") || "استمر بالنزول لتحميل المزيد"
              : !hasMore
              ? t("admin.noMoreUsers") || "لا توجد نتائج إضافية"
              : null}
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <UserFormDialog
        open={userFormOpen}
        onOpenChange={setUserFormOpen}
        user={selectedUser}
        onSubmit={handleSubmitUser}
        isLoading={isLoading}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={t("admin.deleteUser")}
        description={t("admin.deleteUserConfirm")}
        isLoading={isLoading}
      />

      <UserFavoritesDialog
        open={favoritesDialogOpen}
        onOpenChange={setFavoritesDialogOpen}
        user={selectedUser}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
