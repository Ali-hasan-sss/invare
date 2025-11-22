"use client";

import React, { useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import { Package, ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useTranslation } from "@/hooks/useTranslation";
import { useMaterialCategories } from "@/hooks/useMaterialCategories";
import { useMaterials } from "@/hooks/useMaterials";
import { Card, CardContent } from "@/components/ui/Card";

const CategoryMaterialsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ categoryId: string }>();
  const categoryIdParam = Array.isArray(params?.categoryId)
    ? params?.categoryId[0]
    : params?.categoryId;

  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage.code === "ar";

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
    if (!categories.length) {
      getCategories();
    }
  }, [categories.length, getCategories]);

  useEffect(() => {
    if (categoryIdParam) {
      getMaterials({
        categoryId: categoryIdParam.toString(),
        limit: 500,
        lang: currentLanguage.code,
      });
    }
  }, [categoryIdParam, getMaterials, currentLanguage.code]);

  const category = useMemo(
    () => categories.find((item) => item.id === categoryIdParam),
    [categories, categoryIdParam]
  );

  const handleBack = useCallback(() => {
    router.push("/materials");
  }, [router]);

  const handleMaterialSelect = useCallback(
    (materialId: string) => {
      if (!categoryIdParam) return;
      router.push(
        `/listings?categoryId=${categoryIdParam}&materialId=${materialId}`
      );
    },
    [router, categoryIdParam]
  );

  const showLoader =
    (categoriesLoading && !categories.length) ||
    (materialsLoading && !materials.length);

  const errorMessage = categoriesError || materialsError;

  return (
    <Container maxWidth="lg" className="py-8">
      <Breadcrumbs
        className="mb-6"
        variant="default"
        size="md"
        items={[
          { label: t("common.home"), href: "/" },
          { label: t("navigation.materials") || "المواد", href: "/materials" },
          {
            label:
              category?.name ||
              t("materials.categoryPageTitle", { category: "" }),
          },
        ]}
      />

      <Box className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Typography
            variant="h4"
            className="font-bold text-gray-900 dark:text-gray-100 mb-2"
          >
            {category?.name
              ? t("materials.categoryPageTitle", { category: category.name })
              : t("materials.categoryNotFound") || "لم يتم العثور على الفئة"}
          </Typography>
          {category?.name && (
            <Typography className="text-gray-600 dark:text-gray-400">
              {t("materials.categoryPageSubtitle") ||
                "اختر مادة لعرض جميع العروض المرتبطة بها."}
            </Typography>
          )}
        </div>
        <span
          role="button"
          tabIndex={0}
          onClick={handleBack}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleBack();
            }
          }}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer"
        >
          {isRTL ? (
            <ArrowLeft className="h-4 w-4 rotate-180" />
          ) : (
            <ArrowLeft className="h-4 w-4" />
          )}
          {t("materials.backToCategories") || "عودة إلى الفئات"}
        </span>
      </Box>

      {showLoader ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="300px"
        >
          <CircularProgress />
        </Box>
      ) : errorMessage ? (
        <Alert severity="error" className="mb-6">
          {errorMessage}
        </Alert>
      ) : !category ? (
        <Alert severity="warning">
          {t("materials.categoryNotFound") || "الفئة غير موجودة."}
        </Alert>
      ) : materials.length === 0 ? (
        <Alert severity="info">
          {t("materials.noMaterialsInCategory") ||
            "لا توجد مواد لهذه الفئة حالياً."}
        </Alert>
      ) : (
        <Grid container spacing={3} className="mt-2">
          {materials.map((material) => (
            <Grid item xs={12} sm={6} md={4} key={material.id}>
              <Card
                role="button"
                tabIndex={0}
                onClick={() => handleMaterialSelect(material.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleMaterialSelect(material.id);
                  }
                }}
                className="h-full border border-blue-100 dark:border-blue-900/50 bg-white/90 dark:bg-gray-900/70 backdrop-blur cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 transition-transform hover:-translate-y-1"
              >
                <CardContent className="flex items-center gap-3 py-6">
                  <Package className="h-6 w-6 text-blue-500" />
                  <Typography
                    variant="h6"
                    className="font-semibold text-gray-900 dark:text-gray-100"
                  >
                    {material.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default CategoryMaterialsPage;
