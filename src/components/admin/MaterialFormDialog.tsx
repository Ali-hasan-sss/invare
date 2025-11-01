"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useTranslation } from "../../hooks/useTranslation";
import {
  Material,
  CreateMaterialData,
  UpdateMaterialData,
} from "../../store/slices/materialsSlice";

interface MaterialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: Material | null;
  categoryId: string;
  onSubmit: (data: CreateMaterialData | UpdateMaterialData) => Promise<void>;
  isLoading?: boolean;
}

export const MaterialFormDialog: React.FC<MaterialFormDialogProps> = ({
  open,
  onOpenChange,
  material,
  categoryId,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateMaterialData>({
    name: "",
    unitOfMeasure: "",
    categoryId: categoryId,
  });

  useEffect(() => {
    if (material) {
      setFormData({
        name: material.name || "",
        unitOfMeasure: material.unitOfMeasure || "",
        categoryId: material.categoryId || categoryId,
      });
    } else {
      setFormData({
        name: "",
        unitOfMeasure: "",
        categoryId: categoryId,
      });
    }
  }, [material, categoryId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>
            {material ? t("admin.editMaterial") : t("admin.addMaterial")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("admin.materialName")}
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("admin.unitOfMeasure")}
            </label>
            <Input
              type="text"
              name="unitOfMeasure"
              value={formData.unitOfMeasure}
              onChange={handleChange}
              required
              placeholder="kg, m, ton..."
            />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("admin.loading") : t("admin.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

