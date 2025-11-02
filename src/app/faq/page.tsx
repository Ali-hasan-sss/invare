"use client";

import React from "react";
import { Container, Box, Typography, Paper, Divider } from "@mui/material";
import { useTranslation } from "@/hooks/useTranslation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { HelpCircle } from "lucide-react";

const FAQPage: React.FC = () => {
  const { t } = useTranslation();

  const faqs = [
    {
      q: t("faq.q1") || "كيف أُكمل عملية الشراء؟",
      a:
        t("faq.a1") ||
        "اختر العرض، ثم اضغط اشترِ الآن وحدد الكمية، وأكمل الدفع عبر ثواني.",
    },
    {
      q: t("faq.q2") || "هل أستطيع المشاركة في المزادات؟",
      a:
        t("faq.a2") ||
        "نعم، إذا كان العرض قابلًا للمزايدة يمكنك إدخال قيمة مزايدتك وإرسالها.",
    },
    {
      q: t("faq.q3") || "ماذا يحدث بعد الدفع؟",
      a:
        t("faq.a3") ||
        "سيتم إنشاء طلبك وإرجاعك تلقائيًا إلى الصفحة الأصلية برسالة نجاح.",
    },
  ];

  return (
    <Container maxWidth="lg" className="py-8">
      <Breadcrumbs
        className="mb-6"
        variant="default"
        size="md"
        items={[
          { label: t("common.home"), href: "/" },
          { label: t("navigation.faq") || "الأسئلة الشائعة" },
        ]}
      />

      <Paper className="p-6 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700">
        <Typography
          variant="h4"
          className="font-bold mb-2 text-gray-900 dark:text-gray-100"
        >
          {t("faq.title") || "الأسئلة الشائعة"}
        </Typography>
        <Typography className="mb-4 text-gray-700 dark:text-gray-300">
          {t("faq.subtitle") || "إجابات سريعة لأكثر الأسئلة شيوعًا"}
        </Typography>

        <Divider className="my-4" />

        <Box className="space-y-3">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700"
            >
              <Box className="flex items-start mb-1">
                <HelpCircle
                  size={18}
                  className="text-blue-600 dark:text-blue-400 ltr:mr-2 rtl:ml-2 mt-0.5"
                />
                <Typography className="font-semibold text-gray-900 dark:text-gray-100">
                  {item.q}
                </Typography>
              </Box>
              <Typography className="text-gray-700 dark:text-gray-300">
                {item.a}
              </Typography>
            </div>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default FAQPage;
