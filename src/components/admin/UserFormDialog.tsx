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
import { Select as HTMLSelect, SelectOption } from "../ui/Select";
import {
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Search } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { useMaterials } from "../../hooks/useMaterials";
import { useCountries } from "../../hooks/useCountries";
import {
  User,
  CreateUserData,
  UpdateUserData,
} from "../../store/slices/usersSlice";
import { cn } from "../../lib/utils";
import { getCountryFlag, getCountryName } from "../../lib/countryUtils";

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
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage.code === "ar";
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
  const [materialSearchQuery, setMaterialSearchQuery] = useState("");

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
      setMaterialSearchQuery("");
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

  // Filter materials by search query
  const filteredMaterials = materials.filter((material) => {
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
              <FormControl fullWidth>
                <Select
                  name="countryId"
                  value={formData.countryId || ""}
                  onChange={(e: SelectChangeEvent<string>) => {
                    setFormData((prev) => ({
                      ...prev,
                      countryId: e.target.value,
                    }));
                  }}
                  displayEmpty
                  sx={{
                    height: "40px",
                    backgroundColor: "transparent",
                    color: "rgb(17 24 39)",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgb(209 213 219)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgb(59 130 246)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgb(0 123 255)",
                    },
                    "& .MuiSelect-select": {
                      padding: "8px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    },
                    ".dark &": {
                      color: "rgb(249 250 251)",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgb(75 85 99)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgb(107 114 128)",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgb(0 123 255)",
                      },
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "rgb(255 255 255)",
                        ".dark &": {
                          backgroundColor: "rgb(17 24 39)",
                        },
                      },
                    },
                  }}
                  renderValue={(value) => {
                    if (!value) {
                      return (
                        <span className="text-gray-500 dark:text-gray-400">
                          {t("admin.selectCountry") || "اختر البلد"}
                        </span>
                      );
                    }
                    const selectedCountry = countries.find(
                      (c) => c.id === value
                    );
                    if (!selectedCountry) return "";
                    const flag = getCountryFlag(selectedCountry.countryCode);
                    const translatedName = getCountryName(
                      selectedCountry.countryCode,
                      currentLanguage.code as "ar" | "en"
                    );
                    const displayName =
                      translatedName || selectedCountry.countryName || "";
                    return (
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{flag}</span>
                        <span>{displayName}</span>
                      </span>
                    );
                  }}
                >
                  <MenuItem
                    value=""
                    sx={{
                      color: "rgb(107 114 128)",
                      ".dark &": {
                        color: "rgb(156 163 175)",
                      },
                    }}
                  >
                    {t("admin.selectCountry") || "اختر البلد"}
                  </MenuItem>
                  {countries.map((country) => {
                    const flag = getCountryFlag(country.countryCode);
                    const translatedName = getCountryName(
                      country.countryCode,
                      currentLanguage.code as "ar" | "en"
                    );
                    const displayName =
                      translatedName || country.countryName || "";
                    return (
                      <MenuItem
                        key={country.id}
                        value={country.id}
                        sx={{
                          color: "rgb(17 24 39)",
                          "&.Mui-selected": {
                            backgroundColor: "rgb(239 246 255)",
                          },
                          "&.Mui-selected:hover": {
                            backgroundColor: "rgb(219 234 254)",
                          },
                          ".dark &": {
                            color: "rgb(249 250 251)",
                            "&.Mui-selected": {
                              backgroundColor: "rgb(30 58 138)",
                            },
                            "&.Mui-selected:hover": {
                              backgroundColor: "rgb(37 99 235)",
                            },
                          },
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{flag}</span>
                          <span>{displayName}</span>
                        </span>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("admin.accountStatus")}
              </label>
              <HTMLSelect
                name="accountStatus"
                value={formData.accountStatus}
                onChange={handleChange}
                className="text-gray-900 dark:text-white"
              >
                <SelectOption
                  value="active"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {t("admin.active")}
                </SelectOption>
                <SelectOption
                  value="inactive"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {t("admin.inactive")}
                </SelectOption>
                <SelectOption
                  value="pending"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {t("admin.pending")}
                </SelectOption>
              </HTMLSelect>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("admin.subscriptionTier")}
              </label>
              <HTMLSelect
                name="subscriptionTier"
                value={formData.subscriptionTier}
                onChange={handleChange}
                className="text-gray-900 dark:text-white"
              >
                <SelectOption
                  value="free"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  Free
                </SelectOption>
                <SelectOption
                  value="premium"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  Premium
                </SelectOption>
                <SelectOption
                  value="enterprise"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  Enterprise
                </SelectOption>
              </HTMLSelect>
            </div>
          </div>

          {/* Materials Section - Only show when adding new user */}
          {!user && (
            <div>
              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">
                  {t("admin.selectMaterialsToAdd") ||
                    "اختر المواد لإضافتها (اختياري)"}
                </label>
                {/* Search Input - Next to label */}
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
              </div>

              {materialsLoading ? (
                <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
                  {t("admin.loading") || "جاري التحميل..."}
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
                  {materialSearchQuery.trim()
                    ? t("admin.noMaterialsFound") || "لا توجد نتائج للبحث"
                    : t("admin.noMaterialsAvailable") || "لا توجد مواد متاحة"}
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2 space-y-1 bg-white dark:bg-gray-900">
                  {filteredMaterials.map((material) => (
                    <div
                      key={material.id}
                      className={cn(
                        "p-1.5 rounded transition-colors",
                        selectedMaterials.includes(material.id)
                          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent"
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
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {material.i18n?.[currentLanguage.code]?.name ||
                              material.name}
                            {material.i18n?.[currentLanguage.code]
                              ?.unitOfMeasure || material.unitOfMeasure ? (
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
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
              {selectedMaterials.length > 0 && (
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
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
