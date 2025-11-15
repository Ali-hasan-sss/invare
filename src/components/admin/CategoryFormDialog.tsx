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
  MaterialCategory,
  CreateMaterialCategoryData,
  UpdateMaterialCategoryData,
  MaterialCategoryTranslations,
} from "../../store/slices/materialCategoriesSlice";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: MaterialCategory | null;
  onSubmit: (
    data: CreateMaterialCategoryData | UpdateMaterialCategoryData
  ) => Promise<void>;
  isLoading?: boolean;
}

type CategoryFormState = {
  nameEn: string;
  nameAr: string;
};

export const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  open,
  onOpenChange,
  category,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CategoryFormState>({
    nameEn: "",
    nameAr: "",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        nameEn: category.i18n?.en?.name || category.name || "",
        nameAr: category.i18n?.ar?.name || "",
      });
    } else {
      setFormData({
        nameEn: "",
        nameAr: "",
      });
    }
  }, [category, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that at least one name is provided
    if (!formData.nameEn && !formData.nameAr) {
      return;
    }

    const i18n: MaterialCategoryTranslations = {};
    if (formData.nameEn?.trim()) {
      i18n.en = { name: formData.nameEn.trim() };
    }
    if (formData.nameAr?.trim()) {
      i18n.ar = { name: formData.nameAr.trim() };
    }

    // Build clean payload without undefined values
    const cleanI18n = Object.keys(i18n).length > 0 ? i18n : undefined;
    const categoryName =
      formData.nameEn?.trim() || formData.nameAr?.trim() || "";

    if (category) {
      const payload: UpdateMaterialCategoryData = {
        name: categoryName || category.name,
        ...(cleanI18n && { i18n: cleanI18n }),
      };
      await onSubmit(payload);
    } else {
      const payload: CreateMaterialCategoryData = {
        name: categoryName,
        ...(cleanI18n && { i18n: cleanI18n }),
      };
      await onSubmit(payload);
    }
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
            {category ? t("admin.editCategory") : t("admin.addCategory")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("admin.categoryNameEn") || "Category Name (English)"}
              </label>
              <Input
                type="text"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleChange}
                required={!formData.nameAr}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("admin.categoryNameAr") || "Category Name (Arabic)"}
              </label>
              <Input
                type="text"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleChange}
                required={!formData.nameEn}
              />
            </div>
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
