"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useUsers } from "@/hooks/useUsers";
import { useCountries } from "@/hooks/useCountries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { Alert, Snackbar } from "@mui/material";
import { Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCountryFlag, getCountryName } from "@/lib/countryUtils";
import type { User } from "@/store/slices/authSlice";

interface UserProfileFormProps {
  user: User;
}

export default function UserProfileForm({ user }: UserProfileFormProps) {
  const { t, currentLanguage } = useTranslation();
  const { updateUser, isLoading } = useUsers();
  const {
    countries,
    getCountries,
    isLoading: countriesLoading,
  } = useCountries();
  const isRTL = currentLanguage.dir === "rtl";

  // Type assertion to access optional fields that may exist in the API response
  const userWithOptionalFields = user as User & {
    phone?: string;
    countryId?: string;
  };

  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: userWithOptionalFields.phone || "",
    countryId: userWithOptionalFields.countryId || "",
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    getCountries();
  }, [getCountries]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const result = await updateUser(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        countryId: formData.countryId || undefined,
      });

      if (result.type.endsWith("/fulfilled")) {
        setToastMessage(t("profile.profileUpdated"));
        setToastSeverity("success");
        setToastOpen(true);
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      setToastMessage(t("profile.profileUpdateError"));
      setToastSeverity("error");
      setToastOpen(true);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {t("profile.editProfile")}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name */}
        <div>
          <label
            htmlFor="firstName"
            className={cn(
              "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",
              isRTL && "text-right"
            )}
          >
            {t("profile.firstName")} <span className="text-red-500">*</span>
          </label>
          <div>
            <Input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder={t("profile.enterFirstName")}
              className={cn(
                "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 h-11",
                isRTL && "text-right"
              )}
            />
          </div>
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="lastName"
            className={cn(
              "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",
              isRTL && "text-right"
            )}
          >
            {t("profile.lastName")} <span className="text-red-500">*</span>
          </label>
          <div>
            <Input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              placeholder={t("profile.enterLastName")}
              className={cn(
                "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 h-11",
                isRTL && "text-right"
              )}
            />
          </div>
        </div>

        {/* Email (Read-only) */}
        <div>
          <label
            htmlFor="email"
            className={cn(
              "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",
              isRTL && "text-right"
            )}
          >
            {t("profile.email")}
          </label>
          <div>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled
              className={cn(
                "bg-gray-100 dark:bg-gray-700 cursor-not-allowed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 h-11",
                isRTL && "text-right"
              )}
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className={cn(
              "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",
              isRTL && "text-right"
            )}
          >
            {t("profile.phone") || "الهاتف"}
          </label>
          <div>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t("profile.enterPhone") || "أدخل رقم الهاتف"}
              className={cn(
                "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 h-11",
                isRTL && "text-right"
              )}
            />
          </div>
        </div>

        {/* Country */}
        <div>
          <label
            htmlFor="countryId"
            className={cn(
              "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",
              isRTL && "text-right"
            )}
          >
            {t("profile.country") || t("common.country")}
          </label>
          {countriesLoading ? (
            <div className="text-center py-2 text-gray-500 dark:text-gray-400 text-sm">
              {t("admin.loading") || "جاري التحميل..."}
            </div>
          ) : (
            <FormControl fullWidth>
              <Select
                name="countryId"
                value={formData.countryId || ""}
                onChange={(e: SelectChangeEvent<string>) => {
                  setFormData((prev) => ({
                    ...prev,
                    countryId: e.target.value,
                  }));
                }}
                displayEmpty
                sx={{
                  height: "44px",
                  backgroundColor: "transparent",
                  color: "rgb(17 24 39)",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgb(209 213 219)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgb(59 130 246)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgb(0 123 255)",
                  },
                  "& .MuiSelect-select": {
                    padding: "8px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  },
                  ".dark &": {
                    color: "rgb(249 250 251)",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgb(75 85 99)",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgb(107 114 128)",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgb(0 123 255)",
                    },
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: "rgb(255 255 255)",
                      ".dark &": {
                        backgroundColor: "rgb(17 24 39)",
                      },
                    },
                  },
                }}
                renderValue={(value) => {
                  if (!value) {
                    return (
                      <span className="text-gray-500 dark:text-gray-400">
                        {t("common.selectCountry") || "اختر البلد"}
                      </span>
                    );
                  }
                  const selectedCountry = countries.find((c) => c.id === value);
                  if (!selectedCountry) return "";
                  const flag = getCountryFlag(selectedCountry.countryCode);
                  const translatedName = getCountryName(
                    selectedCountry.countryCode,
                    currentLanguage.code as "ar" | "en"
                  );
                  const displayName =
                    translatedName || selectedCountry.countryName || "";
                  return (
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{flag}</span>
                      <span>{displayName}</span>
                    </span>
                  );
                }}
              >
                <MenuItem
                  value=""
                  sx={{
                    color: "rgb(107 114 128)",
                    ".dark &": {
                      color: "rgb(156 163 175)",
                    },
                  }}
                >
                  {t("common.selectCountry") || "اختر البلد"}
                </MenuItem>
                {countries.map((country) => {
                  const flag = getCountryFlag(country.countryCode);
                  const translatedName = getCountryName(
                    country.countryCode,
                    currentLanguage.code as "ar" | "en"
                  );
                  const displayName =
                    translatedName || country.countryName || "";
                  return (
                    <MenuItem
                      key={country.id}
                      value={country.id}
                      sx={{
                        color: "rgb(17 24 39)",
                        "&.Mui-selected": {
                          backgroundColor: "rgb(239 246 255)",
                        },
                        "&.Mui-selected:hover": {
                          backgroundColor: "rgb(219 234 254)",
                        },
                        ".dark &": {
                          color: "rgb(249 250 251)",
                          "&.Mui-selected": {
                            backgroundColor: "rgb(30 58 138)",
                          },
                          "&.Mui-selected:hover": {
                            backgroundColor: "rgb(37 99 235)",
                          },
                        },
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-lg">{flag}</span>
                        <span>{displayName}</span>
                      </span>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}
        </div>

        {/* Submit Button */}
        <div className={cn("flex gap-4", isRTL && "flex-row-reverse")}>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="min-w-[150px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>{t("profile.loading")}</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>{t("profile.updateProfile")}</span>
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Toast Notification */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: isRTL ? "left" : "right",
        }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity={toastSeverity}
          sx={{ width: "100%" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
