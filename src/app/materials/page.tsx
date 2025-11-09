"use client";

import React, { useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Typography,
  Button,
} from "@mui/material";
import { FolderOpen, Package } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { useMaterialCategories } from "@/hooks/useMaterialCategories";
import { useMaterials } from "@/hooks/useMaterials";
import type { Material } from "@/store/slices/materialsSlice";

const MaterialsCategoriesPage: React.FC = () => {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage.code === "ar";

  const handleNavigateToCategory = useCallback(
    (categoryId: string) => {
      router.push(`/materials/${categoryId}`);
    },
    [router]
  );

  const {
    categories,
    isLoading: categoriesLoading,
    error: categoriesError,
    getCategories,
  } = useMaterialCategories();

  const {
    materials,
    isLoading: materialsLoading,
    error: materialsError,
    getMaterials,
  } = useMaterials();

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  useEffect(() => {
    if (categories.length && materials.length === 0) {
      getMaterials({ limit: 500 });
    }
  }, [categories.length, materials.length, getMaterials]);

  const materialsByCategory = useMemo(() => {
    const map: Record<string, Material[]> = {};
    materials.forEach((material) => {
      const key = material.categoryId || "uncategorized";
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push(material);
    });
    return map;
  }, [materials]);

  const isLoading = categoriesLoading && categories.length === 0;
  const hasError = categoriesError || materialsError;

  return (
    <Container maxWidth="lg" className="py-8">
      <Breadcrumbs
        className="mb-6"
        variant="default"
        size="md"
        items={[
          { label: t("common.home"), href: "/" },
          { label: t("navigation.materials") || "المواد" },
        ]}
      />

      <Box className="mb-8 text-center">
        <Typography
          variant="h3"
          className="font-bold text-gray-900 dark:text-gray-100 mb-3"
        >
          {t("materials.categoriesTitle") || "تصفح المواد حسب الفئة"}
        </Typography>
        <Typography className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          {t("materials.categoriesSubtitle") ||
            "اختر فئة للاطلاع على موادها المتاحة والانتقال إلى العروض المرتبطة بها."}
        </Typography>
      </Box>

      {isLoading ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="300px"
        >
          <CircularProgress />
        </Box>
      ) : hasError ? (
        <Alert severity="error" className="mb-6">
          {categoriesError || materialsError}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => {
            const categoryMaterials = materialsByCategory[category.id] || [];
            return (
              <Grid item xs={12} sm={6} lg={4} key={category.id}>
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNavigateToCategory(category.id)}
                  className="h-full flex flex-col border border-blue-100 dark:border-blue-900/50 bg-white/90 dark:bg-gray-900/70 backdrop-blur cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl flex items-center gap-2 text-gray-900 dark:text-gray-100">
                      <FolderOpen className="h-5 w-5 text-blue-500" />
                      <span>{category.name}</span>
                    </CardTitle>
                    <CardDescription>
                      {t("materials.categoryHint") ||
                        "اختر مادة للاطلاع على عروضها المتاحة."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {materialsLoading && materials.length === 0 ? (
                      <Box className="flex justify-center py-6">
                        <CircularProgress size={24} />
                      </Box>
                    ) : categoryMaterials.length > 0 ? (
                      <Box
                        className={
                          isRTL
                            ? "flex flex-wrap gap-2 justify-end"
                            : "flex flex-wrap gap-2"
                        }
                      >
                        {categoryMaterials.slice(0, 6).map((material) => (
                          <Chip
                            key={material.id}
                            label={material.name}
                            icon={<Package className="h-4 w-4 text-blue-500" />}
                            className="!border-blue-200 !text-gray-800 dark:!text-gray-100 !bg-blue-50 dark:!bg-blue-900/40"
                          />
                        ))}
                        {categoryMaterials.length > 6 && (
                          <Chip
                            label={`+${categoryMaterials.length - 6}`}
                            className="!border-blue-200 !text-gray-600 dark:!text-gray-300 !bg-blue-50 dark:!bg-blue-900/30"
                          />
                        )}
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        className="text-gray-500 dark:text-gray-400"
                      >
                        {t("materials.noMaterialsInCategory") ||
                          "لا توجد مواد لهذه الفئة حالياً."}
                      </Typography>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      fullWidth
                      variant="contained"
                      className="!bg-[#2563eb] hover:!bg-[#1d4ed8] dark:!bg-blue-600 dark:hover:!bg-blue-500 font-semibold shadow-md hover:shadow-lg transition-all"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleNavigateToCategory(category.id);
                      }}
                    >
                      {t("materials.viewCategoryMaterials") ||
                        "عرض مواد هذه الفئة"}
                    </Button>
                  </CardFooter>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default MaterialsCategoriesPage;
