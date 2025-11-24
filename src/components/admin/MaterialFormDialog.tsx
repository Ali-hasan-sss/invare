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
  MaterialTranslations,
} from "../../store/slices/materialsSlice";

interface MaterialFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: Material | null;
  categoryId: string;
  onSubmit: (data: CreateMaterialData | UpdateMaterialData) => Promise<void>;
  isLoading?: boolean;
}

type MaterialFormState = {
  nameEn: string;
  nameAr: string;
};

export const MaterialFormDialog: React.FC<MaterialFormDialogProps> = ({
  open,
  onOpenChange,
  material,
  categoryId,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<MaterialFormState>({
    nameEn: "",
    nameAr: "",
  });

  useEffect(() => {
    if (material) {
      setFormData({
        nameEn: (material.i18n?.en?.name ?? material.name ?? "") || "",
        nameAr: (material.i18n?.ar?.name ?? "") || "",
      });
    } else {
      setFormData({
        nameEn: "",
        nameAr: "",
      });
    }
  }, [material, categoryId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const i18n: MaterialTranslations = {};
    if (formData.nameEn) {
      i18n.en = {
        name: formData.nameEn || undefined,
      };
    }
    if (formData.nameAr) {
      i18n.ar = {
        name: formData.nameAr || undefined,
      };
    }

    if (material) {
      const payload: UpdateMaterialData = {
        name: formData.nameEn || material.name,
        i18n: Object.keys(i18n).length ? i18n : undefined,
      };
      await onSubmit(payload);
    } else {
      const payload: CreateMaterialData = {
        name: formData.nameEn || formData.nameAr || "",
        categoryId,
        i18n: Object.keys(i18n).length ? i18n : undefined,
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
      <DialogContent
        onClose={() => onOpenChange(false)}
        className="bg-white dark:bg-gray-900"
      >
        <DialogHeader>
          <DialogTitle>
            {material ? t("admin.editMaterial") : t("admin.addMaterial")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t("admin.materialNameEn") || "Material Name (English)"}
              </h4>
              <Input
                type="text"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleChange}
                placeholder="Aluminum"
                required={!formData.nameAr}
              />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t("admin.materialNameAr") || "اسم المادة (العربية)"}
              </h4>
              <Input
                type="text"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleChange}
                placeholder="ألمنيوم"
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
