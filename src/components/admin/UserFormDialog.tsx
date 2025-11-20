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
import { Select, SelectOption } from "../ui/Select";
import { Checkbox, FormControlLabel } from "@mui/material";
import { useTranslation } from "../../hooks/useTranslation";
import { useMaterials } from "../../hooks/useMaterials";
import { useCountries } from "../../hooks/useCountries";
import {
  User,
  CreateUserData,
  UpdateUserData,
} from "../../store/slices/usersSlice";
import { cn } from "../../lib/utils";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSubmit: (
    data: CreateUserData | UpdateUserData,
    materialIds?: string[]
  ) => Promise<void>;
  isLoading?: boolean;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({
  open,
  onOpenChange,
  user,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const {
    materials,
    getMaterials,
    isLoading: materialsLoading,
  } = useMaterials();
  const {
    countries,
    getCountries,
    isLoading: countriesLoading,
  } = useCountries();
  const [formData, setFormData] = useState<CreateUserData>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    accountStatus: "active",
    subscriptionTier: "free",
    countryId: "",
    roleIds: [],
  });
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);

  // Fetch materials when dialog opens (only for new users)
  useEffect(() => {
    if (open && !user) {
      getMaterials({ limit: 1000 });
    }
  }, [open, user, getMaterials]);

  // Fetch countries when dialog opens
  useEffect(() => {
    if (open) {
      getCountries();
    }
  }, [open, getCountries]);

  // Reset selected materials when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedMaterials([]);
    }
  }, [open]);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        accountStatus: user.accountStatus || "active",
        subscriptionTier: user.subscriptionTier || "free",
        countryId: user.countryId || "",
        roleIds: user.roleIds || [],
      });
      setSelectedMaterials([]);
    } else {
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        accountStatus: "active",
        subscriptionTier: "free",
        countryId: "",
        roleIds: [],
      });
      setSelectedMaterials([]);
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Only send materialIds when creating a new user (not editing)
    const materialIds =
      !user && selectedMaterials.length > 0 ? selectedMaterials : undefined;

    // Clean formData - remove empty countryId and roleIds for new users
    const cleanedFormData: CreateUserData | UpdateUserData = {
      ...formData,
      countryId: formData.countryId || undefined,
    };

    // Remove roleIds when creating a new user (API doesn't accept it)
    if (!user) {
      const { roleIds, ...createData } = cleanedFormData;
      await onSubmit(createData as CreateUserData, materialIds);
    } else {
      await onSubmit(cleanedFormData as UpdateUserData, materialIds);
    }
  };

  const handleMaterialToggle = (materialId: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId]
    );
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
            {user ? t("admin.editUser") : t("admin.addUser")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("admin.firstName")}
              </label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("admin.lastName")}
              </label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("admin.email")}
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("admin.phone")}
            </label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("admin.country")}
            </label>
            {countriesLoading ? (
              <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
                {t("admin.loading") || "جاري التحميل..."}
              </div>
            ) : (
              <Select
                name="countryId"
                value={formData.countryId || ""}
                onChange={handleChange}
              >
                <SelectOption value="">
                  {t("admin.selectCountry") || "اختر البلد"}
                </SelectOption>
                {countries.map((country) => (
                  <SelectOption key={country.id} value={country.id}>
                    {country.countryName}
                  </SelectOption>
                ))}
              </Select>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("admin.accountStatus")}
              </label>
              <Select
                name="accountStatus"
                value={formData.accountStatus}
                onChange={handleChange}
              >
                <SelectOption value="active">{t("admin.active")}</SelectOption>
                <SelectOption value="inactive">
                  {t("admin.inactive")}
                </SelectOption>
                <SelectOption value="pending">
                  {t("admin.pending")}
                </SelectOption>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("admin.subscriptionTier")}
              </label>
              <Select
                name="subscriptionTier"
                value={formData.subscriptionTier}
                onChange={handleChange}
              >
                <SelectOption value="free">Free</SelectOption>
                <SelectOption value="premium">Premium</SelectOption>
                <SelectOption value="enterprise">Enterprise</SelectOption>
              </Select>
            </div>
          </div>

          {/* Materials Section - Only show when adding new user */}
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("admin.selectMaterialsToAdd") ||
                  "اختر المواد لإضافتها (اختياري)"}
              </label>
              {materialsLoading ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                  {t("admin.loading") || "جاري التحميل..."}
                </div>
              ) : materials.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                  {t("admin.noMaterialsAvailable") || "لا توجد مواد متاحة"}
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className={cn(
                        "p-2 rounded transition-colors",
                        selectedMaterials.includes(material.id)
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedMaterials.includes(material.id)}
                            onChange={() => handleMaterialToggle(material.id)}
                            size="small"
                            sx={{
                              color: "rgb(59 130 246)",
                              "&.Mui-checked": {
                                color: "rgb(59 130 246)",
                              },
                            }}
                          />
                        }
                        label={
                          <span className="text-sm text-gray-900 dark:text-white">
                            {material.name}
                            {material.unitOfMeasure && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
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
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  {t("admin.selectedCount", {
                    count: selectedMaterials.length,
                  }) || `${selectedMaterials.length} مادة محددة`}
                </div>
              )}
            </div>
          )}

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
