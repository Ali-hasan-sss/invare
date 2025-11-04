"use client";

import React, { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Box,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import {
  getMaterialCategories,
  MaterialCategory,
} from "../../../../store/slices/materialCategoriesSlice";
import {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  clearError as clearMaterialError,
  Material,
  CreateMaterialData,
  UpdateMaterialData,
} from "../../../../store/slices/materialsSlice";
import { Card } from "../../../../components/ui/Card";
import { Button } from "../../../../components/ui/Button";
import { Input } from "../../../../components/ui/Input";
import { Badge } from "../../../../components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../../components/ui/Table";
import { MaterialFormDialog } from "../../../../components/admin/MaterialFormDialog";
import { DeleteConfirmDialog } from "../../../../components/admin/DeleteConfirmDialog";
import { Toast } from "../../../../components/ui/Toast";
import { cn } from "../../../../lib/utils";
import { useRouter, useParams } from "next/navigation";

export default function MaterialsPage() {
  const { t, currentLanguage } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.categoryId as string;
  const isRTL = currentLanguage.code === "ar";

  const { categories } = useAppSelector((state) => state.materialCategories);
  const {
    materials,
    isLoading: materialsLoading,
    error: materialsError,
  } = useAppSelector((state) => state.materials);

  const [selectedCategory, setSelectedCategory] =
    useState<MaterialCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [materialFormOpen, setMaterialFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(
    null
  );

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Fetch categories and find selected category
  useEffect(() => {
    dispatch(getMaterialCategories());
  }, [dispatch]);

  useEffect(() => {
    if (categoryId && categories.length > 0) {
      const category = categories.find((cat) => cat.id === categoryId);
      if (category) {
        setSelectedCategory(category);
        // Fetch materials for this category
        dispatch(getMaterials({ categoryId }));
      }
    }
  }, [categoryId, categories, dispatch]);

  useEffect(() => {
    if (materialsError) {
      setToast({ message: materialsError, type: "error" });
      dispatch(clearMaterialError());
    }
  }, [materialsError, dispatch]);

  const handleAddMaterial = () => {
    setEditingMaterial(null);
    setMaterialFormOpen(true);
  };

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material);
    setMaterialFormOpen(true);
  };

  const handleDeleteMaterial = (material: Material) => {
    setDeletingMaterial(material);
    setDeleteDialogOpen(true);
  };

  const handleViewListings = (material: Material) => {
    router.push(`/admin/materials/${categoryId}/${material.id}`);
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
      if (categoryId) {
        dispatch(getMaterials({ categoryId }));
      }
    } catch (err) {
      setToast({ message: t("admin.error"), type: "error" });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMaterial) return;

    try {
      await dispatch(deleteMaterial(deletingMaterial.id)).unwrap();
      setToast({
        message: t("admin.materialDeletedSuccess"),
        type: "success",
      });
      setDeleteDialogOpen(false);
      setDeletingMaterial(null);
      if (categoryId) {
        dispatch(getMaterials({ categoryId }));
      }
    } catch (err) {
      setToast({ message: t("admin.error"), type: "error" });
    }
  };

  const handleBackToCategories = () => {
    router.push("/admin/materials");
  };

  const filteredMaterials = materials.filter((material) =>
    material.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!selectedCategory) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-400">
        {t("admin.loading")}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="secondary"
            onClick={handleBackToCategories}
            className="h-10 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 font-medium"
          >
            {isRTL ? (
              <ArrowRight className="h-5 w-5 ml-2" />
            ) : (
              <ArrowLeft className="h-5 w-5 mr-2" />
            )}
            {t("admin.backToCategories")}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Box className="h-8 w-8 text-blue-600" />
            {selectedCategory.name}
          </h1>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t("admin.materials")}
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

      {/* Action Button */}
      <div className="mb-4">
        <Button
          onClick={handleAddMaterial}
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
            {t("admin.addMaterial")}
          </span>
        </Button>
      </div>

      {/* Materials View */}
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

      {/* Dialogs */}
      {selectedCategory && (
        <MaterialFormDialog
          open={materialFormOpen}
          onOpenChange={setMaterialFormOpen}
          material={editingMaterial}
          categoryId={selectedCategory.id}
          onSubmit={handleSubmitMaterial}
          isLoading={materialsLoading}
        />
      )}

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={t("admin.deleteMaterial")}
        description={t("admin.deleteMaterialConfirm")}
        isLoading={materialsLoading}
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
