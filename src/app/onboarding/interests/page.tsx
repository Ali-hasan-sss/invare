"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import InterestsSection from "@/components/profile/InterestsSection";
import { cn } from "@/lib/utils";

const InterestsOnboardingPage = () => {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const isRTL = currentLanguage.dir === "rtl";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/login?redirect=/onboarding/interests");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !user) {
    return (
      <Box className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-gray-50 dark:bg-gray-900 py-10 sm:py-12 lg:py-16 px-4",
        isRTL ? "rtl" : "ltr"
      )}
    >
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 sm:p-8 lg:p-10 shadow-xl border border-blue-100 dark:border-blue-900/40 bg-white/95 dark:bg-gray-900/90 backdrop-blur">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {t("onboarding.interestsTitle") || "لنخصّص تجربتك على إنڤير"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t("onboarding.interestsSubtitle") ||
                "اختر المواد التي تهتم بها لنعرض لك العروض المناسبة لها. يمكنك إضافة أكثر من مادة وتعديلها لاحقاً من صفحة ملفك الشخصي."}
            </p>
          </div>

          <div className="border border-dashed border-blue-200 dark:border-blue-800 rounded-2xl p-4 sm:p-6 mb-8">
            <InterestsSection userId={user.id} />
          </div>

          <div
            className={cn(
              "flex flex-col sm:flex-row items-center justify-end gap-3",
              isRTL ? "sm:flex-row-reverse" : ""
            )}
          >
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => router.push("/")}
            >
              {t("onboarding.skip") || "تخطي الآن"}
            </Button>
            <Button
              className="w-full sm:w-auto !bg-[#2563eb] hover:!bg-[#1d4ed8] dark:!bg-blue-600 dark:hover:!bg-blue-500 text-white"
              onClick={() => router.push("/")}
            >
              <span style={{ color: "white", fontWeight: 600 }}>
                {t("onboarding.continue") || "ابدأ استخدام المنصة"}
              </span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InterestsOnboardingPage;
