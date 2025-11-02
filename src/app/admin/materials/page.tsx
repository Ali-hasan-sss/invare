"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Package,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  FolderOpen,
  Box,
  Tag,
} from "lucide-react";
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
import {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  clearError as clearMaterialError,
  Material,
  CreateMaterialData,
  UpdateMaterialData,
} from "../../../store/slices/materialsSlice";
import { getListings, Listing } from "../../../store/slices/listingsSlice";
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
import { CategoryFormDialog } from "../../../components/admin/CategoryFormDialog";
import { MaterialFormDialog } from "../../../components/admin/MaterialFormDialog";
import { DeleteConfirmDialog } from "../../../components/admin/DeleteConfirmDialog";
import { Toast } from "../../../components/ui/Toast";
import { cn } from "../../../lib/utils";

type ViewMode = "categories" | "materials" | "listings";

export default function MaterialsManagement() {
  const { t, currentLanguage } = useTranslation();
  const dispatch = useAppDispatch();
  const isRTL = currentLanguage.code === "ar";

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useAppSelector((state) => state.materialCategories);
  const {
    materials,
    isLoading: materialsLoading,
    error: materialsError,
  } = useAppSelector((state) => state.materials);
  const {
    listings,
    isLoading: listingsLoading,
    error: listingsError,
  } = useAppSelector((state) => state.listings);

  const [viewMode, setViewMode] = useState<ViewMode>("categories");
  const [selectedCategory, setSelectedCategory] =
    useState<MaterialCategory | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [materialFormOpen, setMaterialFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<MaterialCategory | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deletingItem, setDeletingItem] = useState<{
    type: "category" | "material";
    item: MaterialCategory | Material;
  } | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    dispatch(getMaterialCategories());
  }, [dispatch]);

  useEffect(() => {
    if (categoriesError) {
      setToast({ message: categoriesError, type: "error" });
      dispatch(clearCategoryError());
    }
    if (materialsError) {
      setToast({ message: materialsError, type: "error" });
      dispatch(clearMaterialError());
    }
  }, [categoriesError, materialsError, dispatch]);

  // Category handlers
  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormOpen(true);
  };

  const handleEditCategory = (category: MaterialCategory) => {
    setEditingCategory(category);
    setCategoryFormOpen(true);
  };

  const handleDeleteCategory = (category: MaterialCategory) => {
    setDeletingItem({ type: "category", item: category });
    setDeleteDialogOpen(true);
  };

  const handleViewMaterials = async (category: MaterialCategory) => {
    setSelectedCategory(category);
    setViewMode("materials");
    setSearchQuery("");
    try {
      await dispatch(getMaterials({ categoryId: category.id })).unwrap();
    } catch (err) {
      console.error("Error fetching materials:", err);
      setToast({ message: t("admin.error"), type: "error" });
    }
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
      dispatch(getMaterialCategories());
    } catch (err) {
      setToast({ message: t("admin.error"), type: "error" });
    }
  };

  // Material handlers
  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setMaterialFormOpen(true);
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setMaterialFormOpen(true);
  };

  const handleDeleteMaterial = (material: Material) => {
    setDeletingItem({ type: "material", item: material });
    setDeleteDialogOpen(true);
  };

  const handleViewListings = async (material: Material) => {
    setSelectedMaterial(material);
    setViewMode("listings");
    setSearchQuery("");
    try {
      await dispatch(getListings({ materialId: material.id })).unwrap();
    } catch (err) {
      console.error("Error fetching listings:", err);
      setToast({ message: t("admin.error"), type: "error" });
    }
  };

  const handleSubmitMaterial = async (
    data: CreateMaterialData | UpdateMaterialData
  ) => {
    try {
      if (editingMaterial) {
        await dispatch(
          updateMaterial({
            id: editingMaterial.id,
            data: data as UpdateMaterialData,
          })
        ).unwrap();
        setToast({
          message: t("admin.materialUpdatedSuccess"),
          type: "success",
        });
      } else {
        await dispatch(createMaterial(data as CreateMaterialData)).unwrap();
        setToast({
          message: t("admin.materialCreatedSuccess"),
          type: "success",
        });
      }
      setMaterialFormOpen(false);
      if (selectedCategory) {
        dispatch(getMaterials({ categoryId: selectedCategory.id }));
      }
    } catch (err) {
      setToast({ message: t("admin.error"), type: "error" });
    }
  };

  // Delete handler
  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      if (deletingItem.type === "category") {
        await dispatch(deleteMaterialCategory(deletingItem.item.id)).unwrap();
        setToast({
          message: t("admin.categoryDeletedSuccess"),
          type: "success",
        });
        dispatch(getMaterialCategories());
      } else {
        await dispatch(deleteMaterial(deletingItem.item.id)).unwrap();
        setToast({
          message: t("admin.materialDeletedSuccess"),
          type: "success",
        });
        if (selectedCategory) {
          dispatch(getMaterials({ categoryId: selectedCategory.id }));
        }
      }
      setDeleteDialogOpen(false);
      setDeletingItem(null);
    } catch (err) {
      setToast({ message: t("admin.error"), type: "error" });
    }
  };

  // Back navigation
  const handleBackToCategories = () => {
    setViewMode("categories");
    setSelectedCategory(null);
    setSearchQuery("");
  };

  const handleBackToMaterials = () => {
    setViewMode("materials");
    setSelectedMaterial(null);
    setSearchQuery("");
  };

  // Filter data
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMaterials = materials.filter((material) =>
    material.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Debug logging
  React.useEffect(() => {
    if (viewMode === "materials") {
      console.log("Materials in state:", materials);
      console.log("Selected category:", selectedCategory);
    }
  }, [materials, viewMode, selectedCategory]);

  const filteredListings = listings.filter(
    (listing) =>
      listing.seller?.companyName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      listing.startingPrice?.toString().includes(searchQuery) ||
      listing.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = categoriesLoading || materialsLoading || listingsLoading;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          {viewMode === "categories" && (
            <>
              <Package className="h-8 w-8 text-purple-600" />
              {t("admin.materialsManagement")}
            </>
          )}
          {viewMode === "materials" && (
            <>
              <Box className="h-8 w-8 text-blue-600" />
              {selectedCategory?.name}
            </>
          )}
          {viewMode === "listings" && (
            <>
              <Tag className="h-8 w-8 text-green-600" />
              {selectedMaterial?.name}
            </>
          )}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {viewMode === "categories" && t("admin.categories")}
          {viewMode === "materials" && t("admin.materials")}
          {viewMode === "listings" && t("listings.title")}
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-4 p-3">
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

      {/* Action Buttons */}
      <div className="mb-4 flex gap-3">
        {/* Back Button */}
        {viewMode === "materials" && (
          <Button
            variant="secondary"
            onClick={handleBackToCategories}
            className="flex-1 h-10 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 font-medium"
          >
            {isRTL ? (
              <ArrowRight className="h-5 w-5 ml-2" />
            ) : (
              <ArrowLeft className="h-5 w-5 mr-2" />
            )}
            {t("admin.backToCategories")}
          </Button>
        )}
        {viewMode === "listings" && (
          <Button
            variant="secondary"
            onClick={handleBackToMaterials}
            className="flex-1 h-10 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 font-medium"
          >
            {isRTL ? (
              <ArrowRight className="h-5 w-5 ml-2" />
            ) : (
              <ArrowLeft className="h-5 w-5 mr-2" />
            )}
            {t("admin.backToMaterials")}
          </Button>
        )}

        {/* Add Button */}
        {viewMode === "categories" && (
          <Button
            onClick={handleAddCategory}
            className="flex-1 h-10 px-4 !bg-[#2563eb] hover:!bg-[#1d4ed8] dark:!bg-blue-500 dark:hover:!bg-blue-600 font-semibold shadow-md hover:shadow-lg transition-all"
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
        )}
        {viewMode === "materials" && (
          <Button
            onClick={handleAddMaterial}
            className="flex-1 h-10 px-4 !bg-[#2563eb] hover:!bg-[#1d4ed8] dark:!bg-blue-500 dark:hover:!bg-blue-600 font-semibold shadow-md hover:shadow-lg transition-all"
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
              {t("admin.addMaterial")}
            </span>
          </Button>
        )}
      </div>

      {/* Categories View */}
      {viewMode === "categories" && (
        <Card className="overflow-hidden">
          {isLoading ? (
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
      )}

      {/* Materials View */}
      {viewMode === "materials" && (
        <Card className="overflow-hidden">
          {materialsLoading ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              {t("admin.loading")}
            </div>
          ) : materialsError ? (
            <div className="p-8 text-center text-red-600 dark:text-red-400">
              {materialsError}
            </div>
          ) : materials.length === 0 ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              {t("admin.noMaterials")}
              <p className="text-sm mt-2">
                Category ID: {selectedCategory?.id}
              </p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              {t("admin.noMaterials")} ({t("admin.search")})
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center text-gray-700 dark:text-gray-200">
                    {t("admin.materialName")}
                  </TableHead>
                  <TableHead className="text-center w-40 text-gray-700 dark:text-gray-200">
                    {t("admin.unitOfMeasure")}
                  </TableHead>
                  <TableHead className="text-center w-32 text-gray-700 dark:text-gray-200">
                    {t("admin.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map((material) => (
                  <TableRow
                    key={material.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleViewListings(material)}
                  >
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 font-medium text-gray-900 dark:text-white">
                        <Box className="h-5 w-5 text-blue-600" />
                        {material.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Badge variant="info">{material.unitOfMeasure}</Badge>
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
                          onClick={() => handleEditMaterial(material)}
                          title={t("admin.edit")}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteMaterial(material)}
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
      )}

      {/* Listings View */}
      {viewMode === "listings" && (
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              {t("admin.loading")}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              {t("listings.noListings")}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center text-gray-700 dark:text-gray-200">
                    {t("listings.title")}
                  </TableHead>
                  <TableHead className="text-center text-gray-700 dark:text-gray-200">
                    {t("listings.company")}
                  </TableHead>
                  <TableHead className="text-center text-gray-700 dark:text-gray-200">
                    {t("listings.price")}
                  </TableHead>
                  <TableHead className="text-center text-gray-700 dark:text-gray-200">
                    {t("listings.quantity")}
                  </TableHead>
                  <TableHead className="text-center w-28 text-gray-700 dark:text-gray-200">
                    {t("listings.status")}
                  </TableHead>
                  <TableHead className="text-center w-28 text-gray-700 dark:text-gray-200">
                    {t("listings.type")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((listing) => (
                  <TableRow
                    key={listing.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <TableCell className="text-center font-medium text-gray-900 dark:text-white">
                      {listing.title || "N/A"}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-white">
                      {listing.seller?.companyName || "N/A"}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-green-600 dark:text-green-400">
                      {listing.startingPrice} {t("currency.omr")}
                    </TableCell>
                    <TableCell className="text-center text-gray-900 dark:text-white">
                      {listing.stockAmount} {listing.unitOfMeasure}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Badge
                          variant={
                            listing.status === "active"
                              ? "success"
                              : listing.status === "pending"
                              ? "warning"
                              : "error"
                          }
                        >
                          {listing.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Badge
                          variant={listing.isBiddable ? "info" : "default"}
                        >
                          {listing.isBiddable
                            ? t("listings.biddable")
                            : t("listings.direct")}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {/* Dialogs */}
      <CategoryFormDialog
        open={categoryFormOpen}
        onOpenChange={setCategoryFormOpen}
        category={editingCategory}
        onSubmit={handleSubmitCategory}
        isLoading={isLoading}
      />

      {selectedCategory && (
        <MaterialFormDialog
          open={materialFormOpen}
          onOpenChange={setMaterialFormOpen}
          material={editingMaterial}
          categoryId={selectedCategory.id}
          onSubmit={handleSubmitMaterial}
          isLoading={isLoading}
        />
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={
          deletingItem?.type === "category"
            ? t("admin.deleteCategory")
            : t("admin.deleteMaterial")
        }
        description={
          deletingItem?.type === "category"
            ? t("admin.deleteCategoryConfirm")
            : t("admin.deleteMaterialConfirm")
        }
        isLoading={isLoading}
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
