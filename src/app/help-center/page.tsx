"use client";

import React from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
} from "@mui/material";
import { useTranslation } from "@/hooks/useTranslation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Rocket, ShoppingBag, CreditCard } from "lucide-react";

const HelpCenterPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="lg" className="py-8">
      <Breadcrumbs
        className="mb-6"
        variant="default"
        size="md"
        items={[
          { label: t("common.home"), href: "/" },
          { label: t("navigation.helpCenter") || "مركز المساعدة" },
        ]}
      />

      <Paper className="p-6 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700">
        <Typography
          variant="h4"
          className="font-bold mb-2 text-gray-900 dark:text-gray-100"
        >
          {t("help.title") || "مركز المساعدة"}
        </Typography>
        <Typography className="mb-4 text-gray-700 dark:text-gray-300">
          {t("help.subtitle") ||
            "ابحث عن الإجابات وتعرف على كيفية استخدام المنصة."}
        </Typography>

        <Divider className="my-4" />

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box className="p-4 rounded-lg mt-4 bg-gray-50 dark:bg-gray-900/40 h-full border border-gray-200 dark:border-gray-700">
              <Box className="flex items-center mb-2">
                <Rocket
                  size={18}
                  className="text-blue-600 dark:text-blue-400 ltr:mr-2 rtl:ml-2"
                />
                <Typography className="font-semibold text-gray-900 dark:text-gray-100">
                  {t("help.sectionGettingStarted") || "البدء"}
                </Typography>
              </Box>
              <Typography className="text-gray-700 dark:text-gray-300">
                {t("help.gettingStartedText") ||
                  "أنشئ حسابًا، أكمل ملفك الشخصي، وابدأ باستعراض العروض والمزادات."}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className="p-4 rounded-lg mt-4 bg-gray-50 dark:bg-gray-900/40 h-full border border-gray-200 dark:border-gray-700">
              <Box className="flex items-center mb-2">
                <ShoppingBag
                  size={18}
                  className="text-green-600 dark:text-green-400 ltr:mr-2 rtl:ml-2"
                />
                <Typography className="font-semibold text-gray-900 dark:text-gray-100">
                  {t("help.sectionBuying") || "الشراء"}
                </Typography>
              </Box>
              <Typography className="text-gray-700 dark:text-gray-300">
                {t("help.buyingText") ||
                  "استخدم زر اشترِ الآن للدفع الآمن عبر ادفع باي، أو شارك في المزادات."}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box className="p-4 rounded-lg mt-4 bg-gray-50 dark:bg-gray-900/40 h-full border border-gray-200 dark:border-gray-700">
              <Box className="flex items-center mb-2">
                <CreditCard
                  size={18}
                  className="text-purple-600 dark:text-purple-400 ltr:mr-2 rtl:ml-2"
                />
                <Typography className="font-semibold text-gray-900 dark:text-gray-100">
                  {t("help.sectionPayments") || "الدفع"}
                </Typography>
              </Box>
              <Typography className="text-gray-700 dark:text-gray-300">
                {t("help.paymentsText") ||
                  "ندعم الدفع عبر ادفع باي. بعد الدفع ستعود تلقائيًا إلى الصفحة الأصلية."}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default HelpCenterPage;
