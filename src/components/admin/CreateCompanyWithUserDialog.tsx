"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Select as HTMLSelect, SelectOption } from "../ui/Select";
import { Button } from "../ui/Button";
import {
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { Search } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCountries } from "@/store/slices/countriesSlice";
import { CreateCompanyWithUserData } from "@/store/slices/companiesSlice";
import { useMaterials } from "@/hooks/useMaterials";
import { getCountryFlag, getCountryName } from "@/lib/countryUtils";
import { cn } from "@/lib/utils";

interface CreateCompanyWithUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: CreateCompanyWithUserData,
    materialIds?: string[]
  ) => Promise<void>;
  isLoading?: boolean;
}

const initialData: CreateCompanyWithUserData = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  userCountryId: "",
  companyName: "",
  vatNumber: "",
  website: "",
  companyCountryId: "",
};

export const CreateCompanyWithUserDialog: React.FC<
  CreateCompanyWithUserDialogProps
> = ({ open, onOpenChange, onSubmit, isLoading = false }) => {
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage.code === "ar";
  const dispatch = useAppDispatch();
  const { countries, isLoading: countriesLoading } = useAppSelector(
    (state) => state.countries
  );
  const {
    materials,
    getMaterials,
    isLoading: materialsLoading,
  } = useMaterials();
  const [formData, setFormData] =
    useState<CreateCompanyWithUserData>(initialData);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [materialSearchQuery, setMaterialSearchQuery] = useState("");

  useEffect(() => {
    dispatch(getCountries());
  }, [dispatch]);

  useEffect(() => {
    if (open) {
      getMaterials({ limit: 1000 });
    }
  }, [open, getMaterials]);

  useEffect(() => {
    if (!open) {
      setFormData(initialData);
      setSelectedMaterials([]);
      setMaterialSearchQuery("");
    }
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(
      {
        ...formData,
        phone: formData.phone?.trim() || undefined,
        vatNumber: formData.vatNumber?.trim() || undefined,
        website: formData.website?.trim() || undefined,
        userCountryId: formData.userCountryId || undefined,
        companyCountryId: formData.companyCountryId || undefined,
      },
      selectedMaterials.length > 0 ? selectedMaterials : undefined
    );
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

  const handleSelectAll = () => {
    const filteredIds = filteredMaterials.map((material) => material.id);
    const allSelected = filteredIds.every((id) =>
      selectedMaterials.includes(id)
    );

    if (allSelected) {
      // Deselect all filtered materials
      setSelectedMaterials((prev) =>
        prev.filter((id) => !filteredIds.includes(id))
      );
    } else {
      // Select all filtered materials (add only those not already selected)
      setSelectedMaterials((prev) => {
        const newSelection = [...prev];
        filteredIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  // Check if all filtered materials are selected
  const allFilteredSelected =
    filteredMaterials.length > 0 &&
    filteredMaterials.every((material) =>
      selectedMaterials.includes(material.id)
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClose={() => onOpenChange(false)}
        className="bg-white dark:bg-gray-900 max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            {t("admin.addCompanyWithUser") ||
              "إنشاء شركة جديدة وربط مستخدم جديد"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                {t("admin.userInformation") || "بيانات المستخدم"}
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t("common.email")} <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t("auth.firstName")} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t("auth.lastName")} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t("common.phone")}
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+9665XXXXXXX"
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t("admin.userCountry") || "دولة المستخدم"}
              </label>
              {countriesLoading ? (
                <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
                  {t("admin.loading") || "جاري التحميل..."}
                </div>
              ) : (
                <FormControl fullWidth>
                  <Select
                    name="userCountryId"
                    value={formData.userCountryId || ""}
                    onChange={(e: SelectChangeEvent<string>) => {
                      setFormData((prev) => ({
                        ...prev,
                        userCountryId: e.target.value,
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
          </div>

          <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
              {t("admin.companyInformation") || "بيانات الشركة"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t("admin.companyName")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t("admin.vatNumber")}
                </label>
                <Input
                  type="text"
                  name="vatNumber"
                  value={formData.vatNumber}
                  onChange={handleChange}
                  className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t("admin.website")}
                </label>
                <Input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t("admin.companyCountry") || "دولة الشركة"}
                </label>
                {countriesLoading ? (
                  <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
                    {t("admin.loading") || "جاري التحميل..."}
                  </div>
                ) : (
                  <FormControl fullWidth>
                    <Select
                      name="companyCountryId"
                      value={formData.companyCountryId || ""}
                      onChange={(e: SelectChangeEvent<string>) => {
                        setFormData((prev) => ({
                          ...prev,
                          companyCountryId: e.target.value,
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
                        const flag = getCountryFlag(
                          selectedCountry.countryCode
                        );
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
            </div>
          </div>

          {/* Materials Section - Interests */}
          <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
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

            {/* Select All Button */}
            {!materialsLoading && filteredMaterials.length > 0 && (
              <div className="mb-2 flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className={cn(
                    "h-7 px-3 text-xs border border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                    allFilteredSelected &&
                      "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400"
                  )}
                >
                  {allFilteredSelected
                    ? t("admin.deselectAll") || "إلغاء تحديد الكل"
                    : t("admin.selectAll") || "تحديد الكل"}
                </Button>
              </div>
            )}

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

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium border border-gray-300 dark:border-gray-600"
            >
              {t("admin.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium shadow-sm"
            >
              {isLoading ? t("admin.loading") : t("admin.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCompanyWithUserDialog;
