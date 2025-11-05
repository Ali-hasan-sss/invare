"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useTranslation } from "@/hooks/useTranslation";
import { useMaterials } from "@/hooks/useMaterials";
import { useMaterialCategories } from "@/hooks/useMaterialCategories";
import { useToast } from "@/components/ui/Toast";
import { Plus, X, Package, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Material } from "@/store/slices/materialsSlice";

interface InterestsSectionProps {
  userId?: string;
}

const InterestsSection: React.FC<InterestsSectionProps> = ({ userId }) => {
  const { t, currentLanguage } = useTranslation();
  const { showToast } = useToast();
  const isRTL = currentLanguage.code === "ar";

  const {
    favoriteMaterials,
    materials,
    isLoading: materialsLoading,
    getFavoriteMaterials,
    addFavoriteMaterial,
    removeFavoriteMaterial,
    getMaterials,
  } = useMaterials();

  const { categories, getCategories } = useMaterialCategories();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");

  // Fetch favorite materials on mount
  useEffect(() => {
    getFavoriteMaterials();
    getCategories();
  }, [getFavoriteMaterials, getCategories]);

  // Fetch materials when category is selected
  useEffect(() => {
    if (selectedCategoryId) {
      getMaterials({ categoryId: selectedCategoryId });
      setSelectedMaterialId(""); // Reset material selection
    }
  }, [selectedCategoryId, getMaterials]);

  const handleAddFavorite = async () => {
    if (!selectedMaterialId) {
      showToast(t("profile.selectMaterial") || "يرجى اختيار مادة", "error");
      return;
    }

    try {
      await addFavoriteMaterial(selectedMaterialId);
      showToast(
        t("profile.materialAddedToFavorites") ||
          "تم إضافة المادة إلى الاهتمامات",
        "success"
      );
      setAddDialogOpen(false);
      setSelectedCategoryId("");
      setSelectedMaterialId("");
      // Refresh favorite materials
      getFavoriteMaterials();
    } catch (error: any) {
      showToast(
        error.message || t("profile.errorAddingMaterial") || "فشل إضافة المادة",
        "error"
      );
    }
  };

  const handleRemoveFavorite = async (materialId: string) => {
    try {
      await removeFavoriteMaterial(materialId);
      showToast(
        t("profile.materialRemovedFromFavorites") ||
          "تم إزالة المادة من الاهتمامات",
        "success"
      );
      // Refresh favorite materials
      getFavoriteMaterials();
    } catch (error: any) {
      showToast(
        error.message ||
          t("profile.errorRemovingMaterial") ||
          "فشل إزالة المادة",
        "error"
      );
    }
  };

  const handleOpenDialog = () => {
    setAddDialogOpen(true);
    setSelectedCategoryId("");
    setSelectedMaterialId("");
  };

  const handleCloseDialog = () => {
    setAddDialogOpen(false);
    setSelectedCategoryId("");
    setSelectedMaterialId("");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t("profile.interests") || "الاهتمامات"}
        </h2>
        <Button
          onClick={handleOpenDialog}
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
            {t("profile.addInterest") || "إضافة اهتمام"}
          </span>
        </Button>
      </div>

      {/* Favorite Materials List */}
      {materialsLoading && favoriteMaterials.length === 0 ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          {t("common.loading") || "جاري التحميل..."}
        </div>
      ) : favoriteMaterials.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {t("profile.noInterests") || "لا توجد اهتمامات"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteMaterials.map((material: Material) => (
            <Card
              key={material.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4">
                <div
                  className={cn(
                    "flex items-center justify-between",
                    isRTL ? "flex-row-reverse" : ""
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {material.name}
                      </h3>
                      {material.unitOfMeasure && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {material.unitOfMeasure}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFavorite(material.id)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Interest Dialog */}
      <Dialog
        open={addDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "rgb(var(--background) / 1)",
            backgroundImage: "none",
            color: "var(--foreground)",
            borderRadius: "12px",
          },
          className: "bg-white dark:bg-gray-900",
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "1.25rem",
            borderBottom: "1px solid",
          }}
          className="text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
        >
          {t("profile.addInterest") || "إضافة اهتمام"}
        </DialogTitle>
        <DialogContent
          sx={{ pt: 3, pb: 2 }}
          className="bg-white dark:bg-gray-900"
        >
          <div className="space-y-4">
            {/* Category Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t("listing.category") || "الفئة"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(156, 163, 175, 0.5)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(156, 163, 175, 0.8)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#9333ea",
                    },
                    pr: 2,
                    pl: 2,
                  }}
                  MenuProps={{
                    disableScrollLock: true,
                    PaperProps: {
                      className: "dark:bg-gray-700 dark:text-white",
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>{t("listing.selectCategory") || "اختر الفئة"}</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            {/* Material Select */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t("listing.material") || "المادة"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  disabled={!selectedCategoryId}
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(156, 163, 175, 0.5)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(156, 163, 175, 0.8)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#9333ea",
                    },
                    pr: 2,
                    pl: 2,
                  }}
                  MenuProps={{
                    disableScrollLock: true,
                    PaperProps: {
                      className: "dark:bg-gray-700 dark:text-white",
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>
                      {selectedCategoryId
                        ? t("listing.selectMaterial") || "اختر المادة"
                        : t("listing.selectCategoryFirst") ||
                          "يرجى اختيار الفئة أولاً"}
                    </em>
                  </MenuItem>
                  {selectedCategoryId &&
                    materials.map((material) => (
                      <MenuItem key={material.id} value={material.id}>
                        {material.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div>
          </div>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            borderTop: "1px solid",
          }}
          className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        >
          <Button
            type="button"
            variant="secondary"
            onClick={handleCloseDialog}
            className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium"
          >
            {t("common.cancel") || "إلغاء"}
          </Button>
          <Button
            type="button"
            onClick={handleAddFavorite}
            disabled={!selectedMaterialId || materialsLoading}
            className="px-4 py-2 !bg-blue-600 hover:!bg-blue-700 dark:!bg-blue-500 dark:hover:!bg-blue-600 !text-white font-semibold shadow-sm"
            sx={{
              color: "white !important",
              "& *": { color: "white !important" },
              "&:disabled": {
                opacity: 0.5,
                cursor: "not-allowed",
              },
            }}
          >
            {t("profile.add") || "إضافة"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InterestsSection;
