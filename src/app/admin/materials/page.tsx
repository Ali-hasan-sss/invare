"use client";

import React, { useEffect, useState } from "react";
import { Edit, Trash2, Plus, Search, Package, FolderOpen } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getMaterialCategories,
  createMaterialCategory,
  updateMaterialCategory,
  deleteMaterialCategory,
  clearError as clearCategoryError,
  MaterialCategory,
  CreateMaterialCategoryData,
  UpdateMaterialCategoryData,
} from "../../../store/slices/materialCategoriesSlice";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/Table";
import { CategoryFormDialog } from "../../../components/admin/CategoryFormDialog";
import { DeleteConfirmDialog } from "../../../components/admin/DeleteConfirmDialog";
import { Toast } from "../../../components/ui/Toast";
import { cn } from "../../../lib/utils";
import { useRouter } from "next/navigation";

export default function CategoriesPage() {
  const { t, currentLanguage } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isRTL = currentLanguage.code === "ar";

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useAppSelector((state) => state.materialCategories);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<MaterialCategory | null>(null);
  const [deletingCategory, setDeletingCategory] =
    useState<MaterialCategory | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    dispatch(getMaterialCategories({ lang: currentLanguage.code }));
  }, [dispatch, currentLanguage.code]);

  useEffect(() => {
    if (categoriesError) {
      setToast({ message: categoriesError, type: "error" });
      dispatch(clearCategoryError());
    }
  }, [categoriesError, dispatch]);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormOpen(true);
  };

  const handleEditCategory = (category: MaterialCategory) => {
    setEditingCategory(category);
    setCategoryFormOpen(true);
  };

  const handleDeleteCategory = (category: MaterialCategory) => {
    setDeletingCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleViewMaterials = (category: MaterialCategory) => {
    router.push(`/admin/materials/${category.id}`);
  };

  const handleSubmitCategory = async (
    data: CreateMaterialCategoryData | UpdateMaterialCategoryData
  ) => {
    try {
      if (editingCategory) {
        await dispatch(
          updateMaterialCategory({
            id: editingCategory.id,
            data: data as UpdateMaterialCategoryData,
          })
        ).unwrap();
        setToast({
          message: t("admin.categoryUpdatedSuccess"),
          type: "success",
        });
      } else {
        await dispatch(
          createMaterialCategory(data as CreateMaterialCategoryData)
        ).unwrap();
        setToast({
          message: t("admin.categoryCreatedSuccess"),
          type: "success",
        });
      }
      setCategoryFormOpen(false);
      dispatch(getMaterialCategories({ lang: currentLanguage.code }));
    } catch (err) {
      setToast({ message: t("admin.error"), type: "error" });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;

    try {
      await dispatch(deleteMaterialCategory(deletingCategory.id)).unwrap();
      setToast({
        message: t("admin.categoryDeletedSuccess"),
        type: "success",
      });
      setDeleteDialogOpen(false);
      setDeletingCategory(null);
      dispatch(getMaterialCategories({ lang: currentLanguage.code }));
    } catch (err) {
      setToast({ message: t("admin.error"), type: "error" });
    }
  };

  const filteredCategories = categories.filter((category) =>
    (category.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Package className="h-8 w-8 text-purple-600" />
          {t("admin.materialsManagement")}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t("admin.categories")}
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

      {/* Action Button */}
      <div className="mb-4">
        <Button
          onClick={handleAddCategory}
          className="h-10 px-4 !bg-[#2563eb] hover:!bg-[#1d4ed8] dark:!bg-blue-500 dark:hover:!bg-blue-600 font-semibold shadow-md hover:shadow-lg transition-all"
          sx={{
            color: "white !important",
            backgroundColor: "#2563eb !important",
            "&:hover": {
              color: "white !important",
              backgroundColor: "#1d4ed8 !important",
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
            {t("admin.addCategory")}
          </span>
        </Button>
      </div>

      {/* Categories View */}
      <Card className="overflow-hidden">
        {categoriesLoading ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            {t("admin.loading")}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            {t("admin.noCategories")}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.categoryName")}
                </TableHead>
                <TableHead className="text-center w-32 text-gray-700 dark:text-gray-200">
                  {t("admin.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow
                  key={category.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleViewMaterials(category)}
                >
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2 font-medium text-gray-900 dark:text-white">
                      <FolderOpen className="h-5 w-5 text-yellow-600" />
                      {category.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div
                      className="flex justify-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditCategory(category)}
                        title={t("admin.edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCategory(category)}
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
      <CategoryFormDialog
        open={categoryFormOpen}
        onOpenChange={setCategoryFormOpen}
        category={editingCategory}
        onSubmit={handleSubmitCategory}
        isLoading={categoriesLoading}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={t("admin.deleteCategory")}
        description={t("admin.deleteCategoryConfirm")}
        isLoading={categoriesLoading}
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
