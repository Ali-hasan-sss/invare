"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useCompanies } from "@/hooks/useCompanies";
import { useAuth } from "@/hooks/useAuth";
import { useCountries } from "@/hooks/useCountries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectOption } from "@/components/ui/Select";
import { Alert, Snackbar } from "@mui/material";
import { Save, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User, Company } from "@/store/slices/authSlice";

interface CompanySectionProps {
  user: User;
  company: Company | null;
}

export default function CompanySection({ user, company }: CompanySectionProps) {
  const { t, currentLanguage } = useTranslation();
  const { registerCompany } = useAuth();
  const { updateCompany, isLoading } = useCompanies();
  const { countries, getCountries } = useCountries();
  const isRTL = currentLanguage.dir === "rtl";

  const [isEditing, setIsEditing] = useState(!company);
  const [formData, setFormData] = useState({
    companyName: company?.companyName || "",
    vatNumber: company?.vatNumber || "",
    website: company?.website || "",
    countryId: "",
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    getCountries();
  }, [getCountries]);

  const handleChange = (
    e:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (company) {
        // Update existing company
        const result = await updateCompany(company.id, {
          companyName: formData.companyName,
          vatNumber: formData.vatNumber,
          website: formData.website,
        });

        if (result.type.endsWith("/fulfilled")) {
          setToastMessage(t("profile.companyUpdated"));
          setToastSeverity("success");
          setToastOpen(true);
          setIsEditing(false);
        } else {
          throw new Error("Update failed");
        }
      } else {
        // Register new company
        const result = await registerCompany({
          companyName: formData.companyName,
          vatNumber: formData.vatNumber,
          website: formData.website,
          countryId: formData.countryId,
        });

        if (result.type.endsWith("/fulfilled")) {
          setToastMessage(t("profile.companyRegistered"));
          setToastSeverity("success");
          setToastOpen(true);
          setIsEditing(false);
          // Reload page to fetch new company data
          window.location.reload();
        } else {
          throw new Error("Registration failed");
        }
      }
    } catch (error) {
      setToastMessage(
        company
          ? t("profile.companyUpdateError")
          : t("profile.companyRegistrationError")
      );
      setToastSeverity("error");
      setToastOpen(true);
    }
  };

  if (!isEditing && company) {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("profile.companyInfo")}
          </h2>
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="gap-2"
          >
            {t("profile.editCompany")}
          </Button>
        </div>

        <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {t("profile.companyName")}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {company.companyName}
            </p>
          </div>

          {company.vatNumber && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t("profile.vatNumber")}
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {company.vatNumber}
              </p>
            </div>
          )}

          {company.website && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t("profile.website")}
              </p>
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {company.website}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {company ? t("profile.editCompany") : t("profile.companyRegistration")}
      </h2>

      {!company && (
        <Alert severity="info" className="mb-6">
          {t("profile.registerCompanyDesc")}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Name */}
        <div>
          <label
            htmlFor="companyName"
            className={cn(
              "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",
              isRTL && "text-right"
            )}
          >
            {t("profile.companyName")} <span className="text-red-500">*</span>
          </label>
          <div>
            <Input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              placeholder={t("profile.enterCompanyName")}
              className={cn(
                "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 h-11",
                isRTL && "text-right"
              )}
            />
          </div>
        </div>

        {/* VAT Number */}
        <div>
          <label
            htmlFor="vatNumber"
            className={cn(
              "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",
              isRTL && "text-right"
            )}
          >
            {t("profile.vatNumber")} <span className="text-red-500">*</span>
          </label>
          <div>
            <Input
              type="text"
              id="vatNumber"
              name="vatNumber"
              value={formData.vatNumber}
              onChange={handleChange}
              required
              placeholder={t("profile.enterVatNumber")}
              className={cn(
                "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 h-11",
                isRTL && "text-right"
              )}
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label
            htmlFor="website"
            className={cn(
              "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",
              isRTL && "text-right"
            )}
          >
            {t("profile.website")} <span className="text-red-500">*</span>
          </label>
          <div>
            <Input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleChange}
              required
              placeholder={t("profile.enterWebsite")}
              className={cn(
                "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 h-11",
                isRTL && "text-right"
              )}
            />
          </div>
        </div>

        {/* Country (only for new registration) */}
        {!company && (
          <div>
            <label
              htmlFor="countryId"
              className={cn(
                "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",
                isRTL && "text-right"
              )}
            >
              {t("profile.country")} <span className="text-red-500">*</span>
            </label>
            <Select
              id="countryId"
              name="countryId"
              value={formData.countryId}
              onChange={handleChange}
              required
              className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            >
              <SelectOption value="">{t("profile.selectCountry")}</SelectOption>
              {countries.map((country) => (
                <SelectOption key={country.id} value={country.id}>
                  {country.countryName}
                </SelectOption>
              ))}
            </Select>
          </div>
        )}

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
            ) : company ? (
              <>
                <Save size={20} />
                <span>{t("profile.save")}</span>
              </>
            ) : (
              <>
                <Plus size={20} />
                <span>{t("profile.registerCompany")}</span>
              </>
            )}
          </Button>

          {company && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  companyName: company.companyName,
                  vatNumber: company.vatNumber || "",
                  website: company.website || "",
                  countryId: "",
                });
              }}
            >
              {t("profile.cancel")}
            </Button>
          )}
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
