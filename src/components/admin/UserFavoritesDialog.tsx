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
import { Input } from "../ui/Input";
import { Checkbox, FormControlLabel } from "@mui/material";
import { Trash2, Plus, Loader2, Search } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { useMaterials } from "../../hooks/useMaterials";
import { Material } from "../../store/slices/materialsSlice";
import { User } from "../../store/slices/usersSlice";
import { cn } from "../../lib/utils";

interface UserFavoritesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  userId?: string | null; // Alternative to user object - for company owners
  companyName?: string; // For displaying company name in title
}

export const UserFavoritesDialog: React.FC<UserFavoritesDialogProps> = ({
  open,
  onOpenChange,
  user,
  userId,
  companyName,
}) => {
  // Use userId if provided, otherwise use user.id
  const effectiveUserId = userId || user?.id || null;
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
  const [favoriteIdMap, setFavoriteIdMap] = useState<Map<string, string>>(
    new Map()
  ); // Map<materialId, favoriteId>
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [materialSearchQuery, setMaterialSearchQuery] = useState("");

  // Fetch user favorites when dialog opens or language changes
  useEffect(() => {
    if (open && effectiveUserId) {
      fetchUserFavorites();
      // Also fetch all available materials
      fetchAllMaterials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, effectiveUserId, currentLanguage.code]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setUserFavorites([]);
      setFavoriteIdMap(new Map());
      setSelectedMaterials([]);
      setShowAddSection(false);
      setLoadingDelete(null);
      setMaterialSearchQuery("");
    }
  }, [open]);

  const fetchUserFavorites = async () => {
    if (!effectiveUserId) return;
    setLoadingFavorites(true);
    try {
      const result = await getUserFavoriteMaterials({
        userId: effectiveUserId,
        lang: currentLanguage.code,
      });
      if (result.type.endsWith("/fulfilled")) {
        const favorites = result.payload as any[];
        const favoriteMap = new Map<string, string>();
        const materials: Material[] = [];

        // Check if response contains favorite objects with id and material
        if (favorites && favorites.length > 0) {
          if (favorites[0].id && favorites[0].material) {
            // Response is FavoriteMaterial[] format: { id: favoriteId, material: Material }
            favorites.forEach((fav: any) => {
              if (fav.id && fav.material) {
                materials.push(fav.material);
                favoriteMap.set(fav.material.id, fav.id); // Map materialId -> favoriteId
              }
            });
          } else if (favorites[0].favoriteId) {
            // Response has favoriteId field
            favorites.forEach((fav: any) => {
              const material = fav.material || fav;
              materials.push(material);
              if (fav.favoriteId && material.id) {
                favoriteMap.set(material.id, fav.favoriteId);
              }
            });
          } else {
            // Response is just Material[] - use material.id as favoriteId for now
            favorites.forEach((material: Material) => {
              materials.push(material);
              favoriteMap.set(material.id, material.id);
            });
          }
        }

        setUserFavorites(materials);
        setFavoriteIdMap(favoriteMap);
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
    if (!effectiveUserId || selectedMaterials.length === 0) return;
    setLoadingAdd(true);
    try {
      const result = await addUserFavoriteMaterials({
        userId: effectiveUserId,
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
    if (!effectiveUserId) return;
    const favoriteId = favoriteIdMap.get(materialId) || materialId;
    setLoadingDelete(materialId);
    try {
      // DELETE /materials/:favoriteId/favorite (no body)
      const result = await deleteUserFavoriteMaterial({
        userId: effectiveUserId,
        favoriteId: favoriteId,
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

  // Filter available materials by search query
  const filteredAvailableMaterials = availableMaterials.filter((material) => {
    if (!materialSearchQuery.trim()) return true;

    const searchLower = materialSearchQuery.toLowerCase();
    const nameEn = material.i18n?.en?.name || "";
    const nameAr = material.i18n?.ar?.name || "";
    const name = material.name || "";

    return (
      name.toLowerCase().includes(searchLower) ||
      nameEn.toLowerCase().includes(searchLower) ||
      nameAr.toLowerCase().includes(searchLower)
    );
  });

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
            {!user && companyName && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 block mt-1">
                {companyName}
              </span>
            )}
            {!user && !companyName && effectiveUserId && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 block mt-1">
                {t("admin.ownerFavorites") || "اهتمامات صاحب الشركة"}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Favorites Section - Show First */}
          {showAddSection && (
            <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex-shrink-0">
                  {t("admin.selectMaterialsToAdd") || "اختر المواد لإضافتها"}
                </h3>
                {/* Search Input - Next to title */}
                <div className="relative flex-1 max-w-xs">
                  <Search
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 z-10",
                      isRTL ? "left-2" : "right-2"
                    )}
                  />
                  <Input
                    type="text"
                    placeholder={t("admin.search") || "بحث..."}
                    value={materialSearchQuery}
                    onChange={(e) => setMaterialSearchQuery(e.target.value)}
                    className="w-full"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "32px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        padding: "0 !important",
                        backgroundColor: "transparent",
                      },
                      "& .MuiOutlinedInput-input": {
                        paddingLeft: isRTL
                          ? "10px !important"
                          : "28px !important",
                        paddingRight: isRTL
                          ? "28px !important"
                          : "10px !important",
                        paddingTop: "6px !important",
                        paddingBottom: "6px !important",
                        fontSize: "12px",
                        color: "rgb(17 24 39) !important",
                      },
                      ".dark & .MuiOutlinedInput-root": {
                        backgroundColor: "transparent",
                        "& input": {
                          color: "rgb(249 250 251) !important",
                        },
                      },
                    }}
                  />
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setShowAddSection(false);
                    setSelectedMaterials([]);
                    setMaterialSearchQuery("");
                  }}
                  className="flex items-center gap-1 flex-shrink-0 h-8 px-2 text-xs"
                >
                  {t("admin.cancel") || "إلغاء"}
                </Button>
              </div>

              {/* Materials List */}
              <div className="mt-2">
                {loadingMaterials ? (
                  <div className="flex items-center justify-center py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                      {t("admin.loading") || "جاري التحميل..."}
                    </span>
                  </div>
                ) : filteredAvailableMaterials.length === 0 ? (
                  <div className="text-center py-3 text-xs text-gray-500 dark:text-gray-400">
                    {materialSearchQuery.trim()
                      ? t("admin.noMaterialsFound") || "لا توجد نتائج للبحث"
                      : t("admin.noMaterialsAvailable") ||
                        "لا توجد مواد متاحة للإضافة"}
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-1 mb-2">
                    {filteredAvailableMaterials.map((material) => (
                      <div
                        key={material.id}
                        className={cn(
                          "p-2 rounded-lg border transition-colors",
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
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {material.i18n?.[currentLanguage.code]?.name ||
                                material.name}
                              {material.i18n?.[currentLanguage.code]
                                ?.unitOfMeasure || material.unitOfMeasure ? (
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                  (
                                  {material.i18n?.[currentLanguage.code]
                                    ?.unitOfMeasure || material.unitOfMeasure}
                                  )
                                </span>
                              ) : null}
                            </span>
                          }
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedMaterials.length > 0 && (
                <div className="flex items-center justify-between p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-1.5 mt-1.5">
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

              <DialogFooter className="mt-4">
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

          {/* Current Favorites Section - Show After Add Section */}
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
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {material.i18n?.[currentLanguage.code]?.name ||
                        material.name}
                      {material.i18n?.[currentLanguage.code]?.unitOfMeasure ||
                      material.unitOfMeasure ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          (
                          {material.i18n?.[currentLanguage.code]
                            ?.unitOfMeasure || material.unitOfMeasure}
                          )
                        </span>
                      ) : null}
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
