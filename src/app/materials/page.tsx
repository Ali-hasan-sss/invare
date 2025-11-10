"use client";

import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Grid,
  Box,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import { FolderOpen } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/Card";
import { useMaterialCategories } from "@/hooks/useMaterialCategories";

const MaterialsCategoriesPage: React.FC = () => {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();

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

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const isLoading = categoriesLoading && categories.length === 0;
  const errorMessage = categoriesError;

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

      <Box className="mb-8 mx-auto flex flex-col items-center text-center">
        <Typography
          variant="h3"
          className="font-bold text-center text-gray-900 dark:text-gray-100 mb-3"
        >
          {t("materials.categoriesTitle") || "تصفح المواد حسب الفئة"}
        </Typography>
        <Typography className="text-gray-600 mt-4 text-center dark:text-gray-400 max-w-3xl mx-auto">
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
      ) : errorMessage ? (
        <Alert severity="error" className="mb-6">
          {errorMessage}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => {
            return (
              <Grid item xs={12} sm={6} lg={4} key={category.id}>
                <Card
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNavigateToCategory(category.id)}
                  className="h-full flex flex-col border border-blue-100 dark:border-blue-900/50 bg-white/90 dark:bg-gray-900/70 backdrop-blur cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 transition-transform hover:-translate-y-1"
                >
                  <CardContent className="flex items-center gap-3 py-6">
                    <FolderOpen className="h-6 w-6 text-blue-500" />
                    <Typography
                      variant="h6"
                      className="font-semibold text-gray-900 dark:text-gray-100"
                    >
                      {category.name}
                    </Typography>
                  </CardContent>
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
