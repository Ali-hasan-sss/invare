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
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateCompanyData>({
    companyName: "",
    vatNumber: "",
    website: "",
    verificationStatus: "pending",
    countryId: "",
  });

  useEffect(() => {
    if (company) {
      setFormData({
        companyName: company.companyName || "",
        vatNumber: company.vatNumber || "",
        website: company.website || "",
        verificationStatus: company.verificationStatus || "pending",
        countryId: company.countryId || "",
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
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>
            {company ? t("admin.editCompany") : t("admin.addCompany")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("admin.companyName")}
            </label>
            <Input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("admin.vatNumber")}
            </label>
            <Input
              type="text"
              name="vatNumber"
              value={formData.vatNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("admin.website")}
            </label>
            <Input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("admin.verificationStatus")}
            </label>
            <Select
              name="verificationStatus"
              value={formData.verificationStatus}
              onChange={handleChange}
            >
              <SelectOption value="verified">
                {t("admin.verified")}
              </SelectOption>
              <SelectOption value="pending">{t("admin.pending")}</SelectOption>
              <SelectOption value="unverified">
                {t("admin.unverified")}
              </SelectOption>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t("admin.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("admin.loading") : t("admin.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
