"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Button,
} from "@mui/material";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useMaterialsList } from "@/hooks/useMaterials";
import { useCompaniesList } from "@/hooks/useCompanies";
import { useUsersList } from "@/hooks/useUsers";
import { useMaterialCategoriesList } from "@/hooks/useMaterialCategories";

export interface ListingsFilterData {
  categoryId?: string;
  materialId?: string;
  companyId?: string;
  userId?: string;
  isBiddable?: boolean;
}

export interface ListingsFilterProps {
  filters: ListingsFilterData;
  onFilterChange: (filters: ListingsFilterData) => void;
  className?: string;
}

const ListingsFilter: React.FC<ListingsFilterProps> = ({
  filters,
  onFilterChange,
  className = "",
}) => {
  const { t } = useTranslation();
  const { materials, getMaterials } = useMaterialsList();
  const { companies, getCompanies } = useCompaniesList();
  const { categories, getCategories } = useMaterialCategoriesList();
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      if (categories.length === 0) {
        setIsLoadingCategories(true);
        await getCategories();
        setIsLoadingCategories(false);
      }
      if (materials.length === 0) {
        setIsLoadingMaterials(true);
        await getMaterials({ limit: 100 });
        setIsLoadingMaterials(false);
      }
      if (companies.length === 0) {
        setIsLoadingCompanies(true);
        await getCompanies({ limit: 100 });
        setIsLoadingCompanies(false);
      }
    };

    fetchFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch materials when category changes
  useEffect(() => {
    if (filters.categoryId) {
      setIsLoadingMaterials(true);
      getMaterials({ categoryId: filters.categoryId, limit: 100 }).finally(
        () => {
          setIsLoadingMaterials(false);
        }
      );
    } else if (!filters.categoryId) {
      // Reload all materials when category is cleared (if not already loaded)
      if (materials.length === 0) {
        setIsLoadingMaterials(true);
        getMaterials({ limit: 100 }).finally(() => {
          setIsLoadingMaterials(false);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.categoryId]);

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      categoryId: value === "all" ? undefined : value,
      materialId: undefined, // Clear material filter when category changes
    });
  };

  const handleMaterialChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      materialId: value === "all" ? undefined : value,
    });
  };

  const handleCompanyChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      companyId: value === "all" ? undefined : value,
    });
  };

  const handleUserChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    onFilterChange({
      ...filters,
      userId: value === "all" ? undefined : value,
    });
  };

  const handleIsBiddableChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    let isBiddable: boolean | undefined = undefined;
    if (value === "true") isBiddable = true;
    if (value === "false") isBiddable = false;
    onFilterChange({
      ...filters,
      isBiddable,
    });
  };

  return (
    <Box
      className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-6 space-y-4 ${className}`}
    >
      {/* Category Filter */}
      <Box className="space-y-2">
        <Typography
          variant="body2"
          className="font-semibold text-gray-900 dark:text-white"
        >
          {t("filters.category")}
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={filters.categoryId || "all"}
            onChange={handleCategoryChange}
            displayEmpty
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isLoadingCategories}
            IconComponent={() => (
              <ChevronDown
                size={20}
                className="text-gray-600 dark:text-gray-400 mr-2"
              />
            )}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(156, 163, 175, 0.5)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(156, 163, 175, 0.8)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#9333ea",
              },
              pr: 2,
              pl: 2,
              "& .MuiSelect-icon": {
                right: 8,
                left: "auto",
              },
              '[dir="rtl"] & .MuiSelect-icon': {
                left: 8,
                right: "auto",
              },
            }}
            MenuProps={{
              disableScrollLock: true,
              PaperProps: {
                className: "dark:bg-gray-700 dark:text-white",
              },
            }}
          >
            <MenuItem value="all">{t("filters.all")}</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Material Filter */}
      <Box className="space-y-2">
        <Typography
          variant="body2"
          className="font-semibold text-gray-900 dark:text-white"
        >
          {t("filters.material")}
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={filters.materialId || "all"}
            onChange={handleMaterialChange}
            displayEmpty
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            IconComponent={() => (
              <ChevronDown
                size={20}
                className="text-gray-600 dark:text-gray-400 mr-2"
              />
            )}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(156, 163, 175, 0.5)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(156, 163, 175, 0.8)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#9333ea",
              },
              // space for dropdown icon in both LTR/RTL
              pr: 2,
              pl: 2,
              "& .MuiSelect-icon": {
                right: 8,
                left: "auto",
              },
              '[dir="rtl"] & .MuiSelect-icon': {
                left: 8,
                right: "auto",
              },
            }}
            MenuProps={{
              disableScrollLock: true,
              PaperProps: {
                className: "dark:bg-gray-700 dark:text-white",
              },
            }}
          >
            <MenuItem value="all">{t("filters.all")}</MenuItem>
            {materials.map((material) => (
              <MenuItem key={material.id} value={material.id}>
                {material.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Company Filter */}
      <Box className="space-y-2">
        <Typography
          variant="body2"
          className="font-semibold text-gray-900 dark:text-white"
        >
          {t("filters.company")}
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={filters.companyId || "all"}
            onChange={handleCompanyChange}
            displayEmpty
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            IconComponent={() => (
              <ChevronDown
                size={20}
                className="text-gray-600 dark:text-gray-400 mr-2"
              />
            )}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(156, 163, 175, 0.5)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(156, 163, 175, 0.8)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#9333ea",
              },
              pr: 2,
              pl: 2,
              "& .MuiSelect-icon": {
                right: 8,
                left: "auto",
              },
              '[dir="rtl"] & .MuiSelect-icon': {
                left: 8,
                right: "auto",
              },
            }}
            MenuProps={{
              disableScrollLock: true,
              PaperProps: {
                className: "dark:bg-gray-700 dark:text-white",
              },
            }}
          >
            <MenuItem value="all">{t("filters.all")}</MenuItem>
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.companyName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Is Biddable Filter */}
      <Box className="space-y-2">
        <Typography
          variant="body2"
          className="font-semibold text-gray-900 dark:text-white"
        >
          {t("filters.type")}
        </Typography>
        <FormControl fullWidth size="small">
          <Select
            value={
              filters.isBiddable === undefined
                ? "all"
                : filters.isBiddable
                ? "true"
                : "false"
            }
            onChange={handleIsBiddableChange}
            displayEmpty
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            IconComponent={() => (
              <ChevronDown
                size={20}
                className="text-gray-600 dark:text-gray-400 mr-2"
              />
            )}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(156, 163, 175, 0.5)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(156, 163, 175, 0.8)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#9333ea",
              },
              pr: 2,
              pl: 2,
              "& .MuiSelect-icon": {
                right: 8,
                left: "auto",
              },
              '[dir="rtl"] & .MuiSelect-icon': {
                left: 8,
                right: "auto",
              },
            }}
            MenuProps={{
              disableScrollLock: true,
              PaperProps: {
                className: "dark:bg-gray-700 dark:text-white",
              },
            }}
          >
            <MenuItem value="all">{t("filters.allListings")}</MenuItem>
            <MenuItem value="true">{t("listings.auction")}</MenuItem>
            <MenuItem value="false">{t("filters.buyNow")}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Clear Filters */}
      <Box className="pt-2">
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          onClick={() => onFilterChange({})}
          className="dark:text-white"
        >
          {t("common.clear") || "مسح الفلاتر"}
        </Button>
      </Box>
    </Box>
  );
};

export default ListingsFilter;
