"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Checkbox, FormControlLabel } from "@mui/material";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { useMaterials } from "../../hooks/useMaterials";
import { Material } from "../../store/slices/materialsSlice";
import { User } from "../../store/slices/usersSlice";
import { cn } from "../../lib/utils";

interface UserFavoritesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export const UserFavoritesDialog: React.FC<UserFavoritesDialogProps> = ({
  open,
  onOpenChange,
  user,
}) => {
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage.code === "ar";
  const {
    materials,
    getUserFavoriteMaterials,
    addUserFavoriteMaterials,
    deleteUserFavoriteMaterial,
    getMaterials,
    isLoading,
  } = useMaterials();

  const [userFavorites, setUserFavorites] = useState<Material[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);

  // Fetch user favorites when dialog opens
  useEffect(() => {
    if (open && user) {
      fetchUserFavorites();
      // Also fetch all available materials
      fetchAllMaterials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setUserFavorites([]);
      setSelectedMaterials([]);
      setShowAddSection(false);
      setLoadingDelete(null);
    }
  }, [open]);

  const fetchUserFavorites = async () => {
    if (!user) return;
    setLoadingFavorites(true);
    try {
      const result = await getUserFavoriteMaterials({ userId: user.id });
      if (result.type.endsWith("/fulfilled")) {
        setUserFavorites(result.payload as Material[]);
      }
    } catch (error) {
      console.error("Failed to fetch user favorites:", error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const fetchAllMaterials = async () => {
    setLoadingMaterials(true);
    try {
      await getMaterials({ limit: 1000 });
    } catch (error) {
      console.error("Failed to fetch materials:", error);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const handleMaterialToggle = (materialId: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId]
    );
  };

  const handleAddFavorites = async () => {
    if (!user || selectedMaterials.length === 0) return;
    setLoadingAdd(true);
    try {
      const result = await addUserFavoriteMaterials({
        userId: user.id,
        materialIds: selectedMaterials,
      });
      if (result.type.endsWith("/fulfilled")) {
        // Refresh user favorites
        await fetchUserFavorites();
        // Clear selection
        setSelectedMaterials([]);
        setShowAddSection(false);
      }
    } catch (error) {
      console.error("Failed to add favorites:", error);
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleDeleteFavorite = async (materialId: string) => {
    if (!user) return;
    setLoadingDelete(materialId);
    try {
      // DELETE /materials/favorites/user/:userId with { materialId } in body
      const result = await deleteUserFavoriteMaterial({
        userId: user.id,
        materialId: materialId,
      });
      if (result.type.endsWith("/fulfilled")) {
        // Refresh user favorites
        await fetchUserFavorites();
      } else {
        // Handle error
        const errorMessage =
          (result.payload as string) || "Failed to delete favorite";
        console.error("Delete favorite error:", errorMessage);
      }
    } catch (error) {
      console.error("Failed to delete favorite:", error);
    } finally {
      setLoadingDelete(null);
    }
  };

  // Filter out materials that are already favorites
  const availableMaterials = materials.filter(
    (material) => !userFavorites.some((fav) => fav.id === material.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClose={() => onOpenChange(false)}
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            {t("admin.userFavorites") || "اهتمامات المستخدم"}
            {user && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 block mt-1">
                {user.firstName} {user.lastName} ({user.email})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Favorites Section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                {t("admin.currentFavorites") || "الاهتمامات الحالية"}
              </h3>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowAddSection(!showAddSection)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t("admin.addFavorites") || "إضافة اهتمامات"}
              </Button>
            </div>

            {loadingFavorites ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  {t("admin.loading") || "جاري التحميل..."}
                </span>
              </div>
            ) : userFavorites.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {t("admin.noFavorites") || "لا توجد اهتمامات حالياً"}
              </div>
            ) : (
              <div className="space-y-2">
                {userFavorites.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-gray-900 dark:text-white">
                      {material.name}
                      {material.unitOfMeasure && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                          ({material.unitOfMeasure})
                        </span>
                      )}
                    </span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteFavorite(material.id)}
                      disabled={loadingDelete === material.id}
                      className="ml-2"
                    >
                      {loadingDelete === material.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Favorites Section */}
          {showAddSection && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                {t("admin.selectMaterialsToAdd") || "اختر المواد لإضافتها"}
              </h3>

              {loadingMaterials ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {t("admin.loading") || "جاري التحميل..."}
                  </span>
                </div>
              ) : availableMaterials.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {t("admin.noMaterialsAvailable") ||
                    "لا توجد مواد متاحة للإضافة"}
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                  {availableMaterials.map((material) => (
                    <div
                      key={material.id}
                      className={cn(
                        "p-3 rounded-lg border transition-colors",
                        selectedMaterials.includes(material.id)
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      )}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedMaterials.includes(material.id)}
                            onChange={() => handleMaterialToggle(material.id)}
                            sx={{
                              color: "rgb(59 130 246)",
                              "&.Mui-checked": {
                                color: "rgb(59 130 246)",
                              },
                            }}
                          />
                        }
                        label={
                          <span className="text-gray-900 dark:text-white">
                            {material.name}
                            {material.unitOfMeasure && (
                              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                ({material.unitOfMeasure})
                              </span>
                            )}
                          </span>
                        }
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              )}

              {selectedMaterials.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {t("admin.selectedCount", {
                      count: selectedMaterials.length,
                    }) || `${selectedMaterials.length} مادة محددة`}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSelectedMaterials([])}
                  >
                    {t("admin.clearSelection") || "مسح التحديد"}
                  </Button>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowAddSection(false);
                    setSelectedMaterials([]);
                  }}
                  disabled={loadingAdd}
                >
                  {t("admin.cancel")}
                </Button>
                <Button
                  onClick={handleAddFavorites}
                  disabled={loadingAdd || selectedMaterials.length === 0}
                  loading={loadingAdd}
                >
                  {t("admin.addSelected") || "إضافة المحددة"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t("admin.close") || "إغلاق"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
