"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/hooks/useTranslation";
import { Card } from "@/components/ui/Card";
import { Tabs, Tab, Box, CircularProgress, Alert } from "@mui/material";
import { User, Building2, MapPin, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import UserProfileForm from "@/components/profile/UserProfileForm";
import CompanySection from "@/components/profile/CompanySection";
import AddressesSection from "@/components/profile/AddressesSection";
import InterestsSection from "@/components/profile/InterestsSection";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, currentLanguage } = useTranslation();
  const { user, company, isAuthenticated, isLoading, getCurrentUser } =
    useAuth();
  const isRTL = currentLanguage.dir === "rtl";
  const [activeTab, setActiveTab] = useState(0);
  const hasFetchedUserRef = useRef(false);

  // Fetch current user data when entering profile page (only once)
  useEffect(() => {
    if (isAuthenticated && !hasFetchedUserRef.current && !isLoading) {
      hasFetchedUserRef.current = true;
      const fetchUser = async () => {
        try {
          await getCurrentUser();
        } catch (error) {
          // Silently handle error - don't break the page if fetch fails
          // The user data from localStorage/state will still be used
          console.error("Failed to refresh user data:", error);
        }
      };

      fetchUser();
    }
  }, [isAuthenticated, isLoading, getCurrentUser]);

  // Handle tab query parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "interests") {
      setActiveTab(3);
    }
  }, [searchParams]);

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
    <div
      className={cn(
        "min-h-screen bg-gray-50 dark:bg-gray-900 py-8",
        isRTL ? "rtl" : "ltr"
      )}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t("profile.myProfile")}
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {user.email}
          </p>
        </div>

        <Card className="p-0 overflow-hidden">
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="standard"
              className={cn("px-2 sm:px-4", isRTL && "flex-row-reverse")}
              sx={{
                "& .MuiTabs-flexContainer": {
                  display: { xs: "grid", sm: "flex" },
                  gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "none" },
                  flexDirection: { sm: isRTL ? "row-reverse" : "row" },
                  gap: { xs: 0, sm: 1 },
                  width: "100%",
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  minHeight: { xs: 48, sm: 56, md: 64 },
                  padding: { xs: "8px 12px", sm: "12px 16px", md: "16px 20px" },
                  fontWeight: 600,
                  fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                  width: { xs: "100%", sm: "auto" },
                  maxWidth: { xs: "100%", sm: "none" },
                  flex: { xs: "1 1 auto", sm: "0 1 auto" },
                  "& .MuiTab-iconWrapper": {
                    fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
                    marginBottom: { xs: 0, sm: 0 },
                  },
                },
                "& .MuiTabs-indicator": {
                  display: { xs: "none", sm: "block" },
                },
              }}
            >
              <Tab
                icon={<User className="w-4 h-4 sm:w-5 sm:h-5" />}
                iconPosition="start"
                label={t("profile.personalInfo")}
                sx={{
                  flexDirection: isRTL ? "row-reverse" : "row",
                  gap: { xs: 0.5, sm: 1 },
                  minWidth: { xs: "auto", sm: "auto" },
                  borderBottom: {
                    xs: activeTab === 0 ? "2px solid" : "none",
                    sm: "none",
                  },
                  borderColor: { xs: "primary.main", sm: "transparent" },
                  "&.Mui-selected": {
                    borderBottom: { xs: "2px solid", sm: "none" },
                    borderColor: { xs: "primary.main", sm: "transparent" },
                  },
                }}
              />
              <Tab
                icon={<Building2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                iconPosition="start"
                label={t("profile.companyInfo")}
                sx={{
                  flexDirection: isRTL ? "row-reverse" : "row",
                  gap: { xs: 0.5, sm: 1 },
                  minWidth: { xs: "auto", sm: "auto" },
                  borderBottom: {
                    xs: activeTab === 1 ? "2px solid" : "none",
                    sm: "none",
                  },
                  borderColor: { xs: "primary.main", sm: "transparent" },
                  "&.Mui-selected": {
                    borderBottom: { xs: "2px solid", sm: "none" },
                    borderColor: { xs: "primary.main", sm: "transparent" },
                  },
                }}
              />
              <Tab
                icon={<MapPin className="w-4 h-4 sm:w-5 sm:h-5" />}
                iconPosition="start"
                label={t("profile.addresses")}
                sx={{
                  flexDirection: isRTL ? "row-reverse" : "row",
                  gap: { xs: 0.5, sm: 1 },
                  minWidth: { xs: "auto", sm: "auto" },
                  borderBottom: {
                    xs: activeTab === 2 ? "2px solid" : "none",
                    sm: "none",
                  },
                  borderColor: { xs: "primary.main", sm: "transparent" },
                  "&.Mui-selected": {
                    borderBottom: { xs: "2px solid", sm: "none" },
                    borderColor: { xs: "primary.main", sm: "transparent" },
                  },
                }}
              />
              <Tab
                icon={<Heart className="w-4 h-4 sm:w-5 sm:h-5" />}
                iconPosition="start"
                label={t("profile.interests") || "الاهتمامات"}
                sx={{
                  flexDirection: isRTL ? "row-reverse" : "row",
                  gap: { xs: 0.5, sm: 1 },
                  minWidth: { xs: "auto", sm: "auto" },
                  borderBottom: {
                    xs: activeTab === 3 ? "2px solid" : "none",
                    sm: "none",
                  },
                  borderColor: { xs: "primary.main", sm: "transparent" },
                  "&.Mui-selected": {
                    borderBottom: { xs: "2px solid", sm: "none" },
                    borderColor: { xs: "primary.main", sm: "transparent" },
                  },
                }}
              />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <Box className="p-3 sm:p-4 md:p-6">
            {/* Personal Info Tab */}
            {activeTab === 0 && <UserProfileForm user={user} />}

            {/* Company Info Tab */}
            {activeTab === 1 && (
              <CompanySection user={user} company={company} />
            )}

            {/* Addresses Tab */}
            {activeTab === 2 && (
              <AddressesSection user={user} company={company} />
            )}

            {/* Interests Tab */}
            {activeTab === 3 && <InterestsSection userId={user.id} />}
          </Box>
        </Card>
      </div>
    </div>
  );
}
