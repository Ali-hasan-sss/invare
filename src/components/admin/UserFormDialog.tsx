"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { Search, ChevronDown } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";
import { useMaterials } from "../../hooks/useMaterials";
import { useMaterialCategories } from "../../hooks/useMaterialCategories";
import { useCountries } from "../../hooks/useCountries";
import { Material } from "../../store/slices/materialsSlice";
import { MaterialCategory } from "../../store/slices/materialCategoriesSlice";
import {
  User,
  CreateUserData,
  UpdateUserData,
} from "../../store/slices/usersSlice";
import { cn } from "../../lib/utils";
import { getCountryFlag, getCountryName } from "../../lib/countryUtils";
import {
  getAllDialCodes,
  getCountryDialCode,
  getDefaultDialCode,
} from "../../lib/phoneUtils";
import PhoneNumberInput from "../common/PhoneNumberInput";

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
    categories,
    getCategories,
    isLoading: isLoadingCategories,
  } = useMaterialCategories();
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
    isAdmin: false,
  });
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [materialSearchQuery, setMaterialSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [phoneCountryCode, setPhoneCountryCode] = useState(
    getDefaultDialCode()
  );
  const [phoneNumber, setPhoneNumber] = useState("");

  const dialCodesLookup = useMemo(() => getAllDialCodes(), []);

  const splitPhoneNumber = (
    fullPhone?: string | null,
    fallbackCountryCode?: string
  ) => {
    const fallbackDial = getCountryDialCode(fallbackCountryCode);
    const sanitized = (fullPhone || "").replace(/\s+/g, "");
    if (!sanitized) {
      return { dialCode: fallbackDial, subscriber: "" };
    }
    const normalized = sanitized.startsWith("+") ? sanitized : `+${sanitized}`;
    const matchedDial =
      dialCodesLookup.find((dialCode) => normalized.startsWith(dialCode)) ||
      fallbackDial;
    return {
      dialCode: matchedDial,
      subscriber: normalized.slice(matchedDial.length),
    };
  };

  const syncPhoneValue = (dialCode: string, subscriber: string) => {
    const cleanedSubscriber = subscriber.replace(/\D/g, "");
    const fullValue =
      cleanedSubscriber.length > 0 ? `${dialCode}${cleanedSubscriber}` : "";
    setFormData((prev) => ({
      ...prev,
      phone: fullValue,
    }));
  };

  // Fetch materials when dialog opens (only for new users)
  useEffect(() => {
    if (open && !user) {
      getMaterials({ limit: 1000 });
      getCategories({ lang: currentLanguage.code });
    }
  }, [open, user, getMaterials, getCategories, currentLanguage.code]);

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
      setExpandedCategories([]);
    }
  }, [open]);

  useEffect(() => {
    if (user) {
      const roleFromRoles =
        user.roles && user.roles.length > 0 ? user.roles[0].name : undefined;
      const isAdminValue =
        user.isAdmin === true ||
        roleFromRoles?.toLowerCase() === "admin" ||
        (user as any).role === "admin";
      const derivedCountryId =
        user.countryId ||
        (user.country && "id" in user.country ? (user.country as any).id : "");
      setFormData({
        email: user.email || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        accountStatus: user.accountStatus || "active",
        subscriptionTier: user.subscriptionTier || "free",
        countryId: derivedCountryId || "",
        isAdmin: isAdminValue,
      });
      const { dialCode, subscriber } = splitPhoneNumber(
        user.phone,
        user.country?.countryCode
      );
      setPhoneCountryCode(dialCode);
      setPhoneNumber(subscriber);
      syncPhoneValue(dialCode, subscriber);
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
        isAdmin: false,
      });
      setPhoneCountryCode(getDefaultDialCode());
      setPhoneNumber("");
      syncPhoneValue(getDefaultDialCode(), "");
      setSelectedMaterials([]);
    }
  }, [user, open, dialCodesLookup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Only send materialIds when creating a new user (not editing)
    const materialIds =
      !user && selectedMaterials.length > 0 ? selectedMaterials : undefined;

    // Clean formData - remove empty countryId and roleIds for new users
    const cleanedFormData: CreateUserData | UpdateUserData = {
      ...formData,
      countryId: formData.countryId || undefined,
      isAdmin: formData.isAdmin ?? undefined,
    };

    await onSubmit(cleanedFormData, materialIds);
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

  // Group materials by category
  const materialsByCategory = useMemo(() => {
    const grouped: Map<
      string,
      { category: MaterialCategory | null; materials: Material[] }
    > = new Map();

    // Add "No Category" group for materials without category
    grouped.set("no-category", {
      category: null,
      materials: [],
    });

    // Initialize groups for each category
    categories.forEach((category) => {
      grouped.set(category.id, {
        category,
        materials: [],
      });
    });

    // Group filtered materials by category
    filteredMaterials.forEach((material) => {
      const categoryId =
        material.categoryId || material.category?.id || "no-category";
      if (!grouped.has(categoryId)) {
        // If category doesn't exist in our list, try to find it in categories
        const fullCategory: MaterialCategory | undefined = categories.find(
          (c) => c.id === categoryId
        );
        grouped.set(categoryId, {
          category: fullCategory ?? null,
          materials: [],
        });
      }
      grouped.get(categoryId)!.materials.push(material);
    });

    // Filter out empty categories (if no materials match search)
    const result: Array<{
      category: MaterialCategory | null;
      materials: Material[];
    }> = [];
    grouped.forEach((value) => {
      if (value.materials.length > 0) {
        result.push(value);
      }
    });

    // Sort: categories first (alphabetically), then "no category" at the end
    result.sort((a, b) => {
      if (!a.category && !b.category) return 0;
      if (!a.category) return 1;
      if (!b.category) return -1;

      const nameA =
        a.category.i18n?.[currentLanguage.code]?.name || a.category.name || "";
      const nameB =
        b.category.i18n?.[currentLanguage.code]?.name || b.category.name || "";
      return nameA.localeCompare(nameB, currentLanguage.code);
    });

    return result;
  }, [filteredMaterials, categories, currentLanguage.code]);

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

  const handleSelectAllInCategory = (categoryMaterials: Material[]) => {
    const categoryIds = categoryMaterials.map((m) => m.id);
    const allSelected = categoryIds.every((id) =>
      selectedMaterials.includes(id)
    );

    if (allSelected) {
      // Deselect all materials in this category
      setSelectedMaterials((prev) =>
        prev.filter((id) => !categoryIds.includes(id))
      );
    } else {
      // Select all materials in this category
      setSelectedMaterials((prev) => {
        const newSelection = [...prev];
        categoryIds.forEach((id) => {
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
            <PhoneNumberInput
              countries={countries}
              countryValue={phoneCountryCode}
              numberValue={phoneNumber}
              languageCode={currentLanguage.code as "ar" | "en"}
              loading={countriesLoading && countries.length === 0}
              loadingText={t("admin.loading") || "جاري التحميل..."}
              placeholder={t("admin.phone") || "05XXXXXXXX"}
              helperText={
                t("admin.phoneFormatHint") ||
                "Include the country code once; the full number will be saved without spaces."
              }
              onCountryChange={(code) => {
                setPhoneCountryCode(code);
                syncPhoneValue(code, phoneNumber);
              }}
              onNumberChange={(digits) => {
                setPhoneNumber(digits);
                syncPhoneValue(phoneCountryCode, digits);
              }}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("admin.isAdmin") || t("admin.roles")}
              </label>
              <HTMLSelect
                name="isAdmin"
                value={formData.isAdmin ? "true" : "false"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isAdmin: e.target.value === "true",
                  }))
                }
                className="text-gray-900 dark:text-white"
              >
                <SelectOption
                  value="false"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {t("admin.roleUser") || "User"}
                </SelectOption>
                <SelectOption
                  value="true"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {t("admin.roleAdmin") || "Admin"}
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

              {materialsLoading || isLoadingCategories ? (
                <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
                  {t("admin.loading") || "جاري التحميل..."}
                </div>
              ) : materialsByCategory.length === 0 ? (
                <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
                  {materialSearchQuery.trim()
                    ? t("admin.noMaterialsFound") || "لا توجد نتائج للبحث"
                    : t("admin.noMaterialsAvailable") || "لا توجد مواد متاحة"}
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-900">
                  {materialsByCategory.map(
                    ({ category, materials: categoryMaterials }) => {
                      const categoryName = category
                        ? category.i18n?.[currentLanguage.code]?.name ||
                          category.name
                        : t("admin.noCategory") || "بدون فئة";
                      const categoryId = category?.id || "no-category";
                      const isExpanded =
                        expandedCategories.includes(categoryId);
                      const allCategorySelected =
                        categoryMaterials.length > 0 &&
                        categoryMaterials.every((m) =>
                          selectedMaterials.includes(m.id)
                        );
                      const someCategorySelected = categoryMaterials.some((m) =>
                        selectedMaterials.includes(m.id)
                      );

                      const handleAccordionChange = (
                        _event: React.SyntheticEvent,
                        isExpandedNow: boolean
                      ) => {
                        if (isExpandedNow) {
                          setExpandedCategories((prev) => [
                            ...prev,
                            categoryId,
                          ]);
                        } else {
                          setExpandedCategories((prev) =>
                            prev.filter((id) => id !== categoryId)
                          );
                        }
                      };

                      return (
                        <Accordion
                          key={categoryId}
                          expanded={isExpanded}
                          onChange={handleAccordionChange}
                          sx={{
                            boxShadow: "none",
                            border: "1px solid",
                            borderColor: "rgb(229 231 235)",
                            "&:before": { display: "none" },
                            "&.Mui-expanded": {
                              margin: "0 0 8px 0",
                            },
                            ".dark &": {
                              borderColor: "rgb(55 65 81)",
                              backgroundColor: "rgb(31 41 55)",
                            },
                          }}
                        >
                          <AccordionSummary
                            expandIcon={
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 text-gray-600 dark:text-gray-400 transition-transform",
                                  isRTL && "rotate-180"
                                )}
                              />
                            }
                            sx={{
                              minHeight: "40px !important",
                              "& .MuiAccordionSummary-content": {
                                margin: "8px 0 !important",
                                alignItems: "center",
                              },
                              backgroundColor: "transparent",
                              ".dark &": {
                                backgroundColor: "transparent",
                              },
                            }}
                          >
                            <div className="flex items-center justify-between w-full pr-2">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {categoryName}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  ({categoryMaterials.length})
                                </span>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={allCategorySelected}
                                      indeterminate={
                                        someCategorySelected &&
                                        !allCategorySelected
                                      }
                                      onChange={() =>
                                        handleSelectAllInCategory(
                                          categoryMaterials
                                        )
                                      }
                                      onClick={(e) => e.stopPropagation()}
                                      size="small"
                                      sx={{
                                        color: "rgb(59 130 246)",
                                        "&.Mui-checked": {
                                          color: "rgb(59 130 246)",
                                        },
                                        "&.MuiCheckbox-indeterminate": {
                                          color: "rgb(59 130 246)",
                                        },
                                      }}
                                    />
                                  }
                                  label=""
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                          </AccordionSummary>
                          <AccordionDetails sx={{ padding: "0 8px 8px 8px" }}>
                            <div className="space-y-1">
                              {categoryMaterials.map((material) => (
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
                                        checked={selectedMaterials.includes(
                                          material.id
                                        )}
                                        onChange={() =>
                                          handleMaterialToggle(material.id)
                                        }
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
                                        {material.i18n?.[currentLanguage.code]
                                          ?.name || material.name}
                                        {material.i18n?.[currentLanguage.code]
                                          ?.unitOfMeasure ||
                                        material.unitOfMeasure ? (
                                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                            (
                                            {material.i18n?.[
                                              currentLanguage.code
                                            ]?.unitOfMeasure ||
                                              material.unitOfMeasure}
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
                          </AccordionDetails>
                        </Accordion>
                      );
                    }
                  )}
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
