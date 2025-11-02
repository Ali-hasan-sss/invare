"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useUsers } from "@/hooks/useUsers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert, Snackbar } from "@mui/material";
import { Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/store/slices/authSlice";

interface UserProfileFormProps {
  user: User;
}

export default function UserProfileForm({ user }: UserProfileFormProps) {
  const { t, currentLanguage } = useTranslation();
  const { updateUser, isLoading } = useUsers();
  const isRTL = currentLanguage.dir === "rtl";

  const [formData, setFormData] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: "",
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
    "success"
  );

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
