"use client";

import React, { useEffect, useState } from "react";
import { Edit, Trash2, Plus, Search, Heart, Settings } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";
import { useUsers } from "../../../hooks/useUsers";
import { useMaterials } from "../../../hooks/useMaterials";
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
    users,
    isLoading,
    error,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    clearError,
  } = useUsers();

  const { addUserFavoriteMaterials } = useMaterials();

  const [searchQuery, setSearchQuery] = useState("");
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [favoritesDialogOpen, setFavoritesDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    getUsers();
  }, []);

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
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleManageFavorites = (user: User) => {
    setSelectedUser(user);
    setFavoritesDialogOpen(true);
  };

  const handleGoToAdminDashboard = (user: User) => {
    // Redirect to admin dashboard as the selected user
    // You might need to implement a way to impersonate/login as that user
    // For now, we'll just navigate to admin dashboard
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
        setToast({ message: t("admin.userUpdatedSuccess"), type: "success" });
      } else {
        const result = await createUser(data as CreateUserData);
        if (result.type.endsWith("/rejected")) {
          throw new Error("Create failed");
        }

        // If user created successfully and materialIds provided, add favorites
        if (
          result.type.endsWith("/fulfilled") &&
          materialIds &&
          materialIds.length > 0
        ) {
          const createdUser = result.payload as User;
          if (createdUser?.id) {
            try {
              const favResult = await addUserFavoriteMaterials({
                userId: createdUser.id,
                materialIds: materialIds,
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
              // User created but favorites failed
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
        } else {
          setToast({
            message: t("admin.userCreatedSuccess"),
            type: "success",
          });
        }
      }
      setUserFormOpen(false);
      setSelectedUser(null);
      await getUsers();
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
        setToast({ message: t("admin.userDeletedSuccess"), type: "success" });
        setDeleteDialogOpen(false);
        setSelectedUser(null);
        await getUsers();
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

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <Card className="mb-4 py-5 px-3">
        <div className="relative">
          <Search
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400",
              isRTL ? "left-3" : "right-3"
            )}
          />
          <Input
            type="text"
            placeholder={t("admin.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "h-10 border-0 focus:ring-0 shadow-none",
              isRTL ? "pr-11" : "pl-11"
            )}
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
        {isLoading ? (
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
                    {user.phone || "-"}
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
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditUser(user)}
                        title={t("admin.edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleManageFavorites(user)}
                        title={t("admin.manageFavorites") || "إدارة الاهتمامات"}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      {isAdminUser(user) && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleGoToAdminDashboard(user)}
                          title={
                            t("admin.goToAdminDashboard") ||
                            "الذهاب إلى لوحة التحكم"
                          }
                          className="!bg-purple-500 hover:!bg-purple-600 !text-white"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user)}
                        title={t("admin.delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
