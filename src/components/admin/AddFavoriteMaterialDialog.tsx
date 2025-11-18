"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/Dialog";
import { Select, SelectOption } from "../ui/Select";
import { Button } from "../ui/Button";
import { useTranslation } from "../../hooks/useTranslation";
import { useMaterials } from "../../hooks/useMaterials";
import { Material } from "../../store/slices/materialsSlice";
import { User } from "../../store/slices/usersSlice";

interface AddFavoriteMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (materialId: string) => Promise<void>;
  isLoading?: boolean;
}

export const AddFavoriteMaterialDialog: React.FC<
  AddFavoriteMaterialDialogProps
> = ({ open, onOpenChange, user, onSubmit, isLoading = false }) => {
  const { t } = useTranslation();
  const {
    materials,
    getMaterials,
    isLoading: materialsIsLoading,
  } = useMaterials();
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");

  useEffect(() => {
    if (open) {
      // Fetch materials when dialog opens
      getMaterials({ limit: 100 });
    }
  }, [open, getMaterials]);

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setSelectedMaterialId("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterialId) return;
    await onSubmit(selectedMaterialId);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMaterialId(e.target.value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>
            {t("admin.addFavoriteMaterial") || "إضافة مادة للمفضلة"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("admin.user") || "المستخدم"}
            </label>
            <input
              type="text"
              value={
                user ? `${user.firstName} ${user.lastName} (${user.email})` : ""
              }
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("admin.material") || "المادة"}
            </label>
            {materialsIsLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-100 dark:bg-gray-800 text-center text-gray-500 dark:text-gray-400">
                {t("admin.loading") || "جاري التحميل..."}
              </div>
            ) : (
              <Select
                name="materialId"
                value={selectedMaterialId}
                onChange={handleChange}
                required
              >
                <SelectOption value="">
                  {t("admin.selectMaterial") || "اختر المادة"}
                </SelectOption>
                {materials.map((material: Material) => (
                  <SelectOption key={material.id} value={material.id}>
                    {material.name}
                  </SelectOption>
                ))}
              </Select>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("admin.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading || !selectedMaterialId}>
              {isLoading ? t("admin.loading") : t("admin.add") || "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
