"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Select, SelectOption } from "../ui/Select";
import { useTranslation } from "../../hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getCountries } from "../../store/slices/countriesSlice";
import {
  Company,
  CreateCompanyData,
  UpdateCompanyData,
} from "../../store/slices/companiesSlice";

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
  onSubmit: (data: CreateCompanyData | UpdateCompanyData) => Promise<void>;
  isLoading?: boolean;
}

export const CompanyFormDialog: React.FC<CompanyFormDialogProps> = ({
  open,
  onOpenChange,
  company,
  onSubmit,
  isLoading = false,
}) => {
  const { t, currentLanguage } = useTranslation();
  const dispatch = useAppDispatch();
  const { countries } = useAppSelector((state) => state.countries);
  const [formData, setFormData] = useState<CreateCompanyData>({
    companyName: "",
    vatNumber: "",
    website: "",
    verificationStatus: "pending",
    countryId: "",
  });

  // Fetch countries on mount
  useEffect(() => {
    dispatch(getCountries());
  }, [dispatch]);

  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.companyName || "",
        vatNumber: company.vatNumber || "",
        website: company.website || "",
        verificationStatus: company.verificationStatus || "pending",
        countryId: company.country?.id || company.countryId || "",
      });
    } else {
      setFormData({
        companyName: "",
        vatNumber: "",
        website: "",
        verificationStatus: "pending",
        countryId: "",
      });
    }
  }, [company, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClose={() => onOpenChange(false)}
        className="bg-white dark:bg-gray-900"
      >
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            {company ? t("admin.editCompany") : t("admin.addCompany")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t("admin.companyName")} <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t("admin.vatNumber")}
            </label>
            <Input
              type="text"
              name="vatNumber"
              value={formData.vatNumber}
              onChange={handleChange}
              className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t("admin.website")}
            </label>
            <Input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
              className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t("admin.country")} <span className="text-red-500">*</span>
            </label>
            <Select
              name="countryId"
              value={formData.countryId}
              onChange={handleChange}
              required
              className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            >
              <SelectOption
                value=""
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              >
                {t("admin.selectCountry")}
              </SelectOption>
              {countries.map((country) => (
                <SelectOption
                  key={country.id}
                  value={country.id}
                  className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                >
                  {country.countryName}
                </SelectOption>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t("admin.verificationStatus")}
            </label>
            <Select
              name="verificationStatus"
              value={formData.verificationStatus}
              onChange={handleChange}
              className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            >
              <SelectOption
                value="pending"
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              >
                {t("admin.pending")}
              </SelectOption>
              <SelectOption
                value="verified"
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              >
                {t("admin.verified")}
              </SelectOption>
              <SelectOption
                value="rejected"
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
              >
                {t("admin.rejected")}
              </SelectOption>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium border border-gray-300 dark:border-gray-600"
            >
              {t("admin.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium shadow-sm"
            >
              {isLoading ? t("admin.loading") : t("admin.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
