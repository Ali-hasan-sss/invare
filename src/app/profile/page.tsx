"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { Card } from "@/components/ui/Card";
import { Tabs, Tab, Box, CircularProgress, Alert } from "@mui/material";
import { User, Building2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import UserProfileForm from "@/components/profile/UserProfileForm";
import CompanySection from "@/components/profile/CompanySection";
import AddressesSection from "@/components/profile/AddressesSection";

export default function ProfilePage() {
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const { user, company, isAuthenticated, isLoading } = useAuth();
  const isRTL = currentLanguage.dir === "rtl";
  const [activeTab, setActiveTab] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading) {
    return (
      <Box className="flex items-center justify-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-900 py-8", isRTL ? "rtl" : "ltr")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("profile.myProfile")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {user.email}
          </p>
        </div>

        <Card className="p-0 overflow-hidden">
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              className={cn(
                "px-4",
                isRTL && "flex-row-reverse"
              )}
              sx={{
                "& .MuiTabs-flexContainer": {
                  flexDirection: isRTL ? "row-reverse" : "row",
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  minHeight: 64,
                  fontWeight: 600,
                  fontSize: "1rem",
                },
              }}
            >
              <Tab
                icon={<User size={20} />}
                iconPosition="start"
                label={t("profile.personalInfo")}
                sx={{
                  flexDirection: isRTL ? "row-reverse" : "row",
                  gap: 1,
                }}
              />
              <Tab
                icon={<Building2 size={20} />}
                iconPosition="start"
                label={t("profile.companyInfo")}
                sx={{
                  flexDirection: isRTL ? "row-reverse" : "row",
                  gap: 1,
                }}
              />
              <Tab
                icon={<MapPin size={20} />}
                iconPosition="start"
                label={t("profile.addresses")}
                sx={{
                  flexDirection: isRTL ? "row-reverse" : "row",
                  gap: 1,
                }}
              />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <Box className="p-6">
            {/* Personal Info Tab */}
            {activeTab === 0 && (
              <UserProfileForm user={user} />
            )}

            {/* Company Info Tab */}
            {activeTab === 1 && (
              <CompanySection user={user} company={company} />
            )}

            {/* Addresses Tab */}
            {activeTab === 2 && (
              <AddressesSection user={user} company={company} />
            )}
          </Box>
        </Card>
      </div>
    </div>
  );
}

