"use client";

import { Box, Typography } from "@mui/material";
import { useTranslation } from "@/hooks/useTranslation";

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <Box className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4  rounded-lg mx-4 my-8">
      <Typography
        variant="h4"
        component="h1"
        className="text-gray-800 dark:text-gray-100 text-center"
      >
        {t("common.welcome")}
      </Typography>
      <Typography
        variant="body1"
        className="text-gray-600 dark:text-gray-300 mt-2 text-center"
      >
        {t("common.info")}
      </Typography>
    </Box>
  );
}
