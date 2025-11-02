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
import { useTranslation } from "../../hooks/useTranslation";
import {
  Country,
  CreateCountryData,
  UpdateCountryData,
} from "../../store/slices/countriesSlice";

interface CountryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  country?: Country | null;
  onSubmit: (data: CreateCountryData | UpdateCountryData) => Promise<void>;
  isLoading?: boolean;
}

export const CountryFormDialog: React.FC<CountryFormDialogProps> = ({
  open,
  onOpenChange,
  country,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateCountryData>({
    countryCode: "",
    countryName: "",
  });

  useEffect(() => {
    if (country) {
      setFormData({
        countryCode: country.countryCode || "",
        countryName: country.countryName || "",
      });
    } else {
      setFormData({
        countryCode: "",
        countryName: "",
      });
    }
  }, [country, open]);

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
    // Limit countryCode to 2 characters
    if (name === "countryCode" && value.length > 2) {
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>
            {country ? t("admin.editCountry") : t("admin.addCountry")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("admin.countryCode")}
            </label>
            <Input
              type="text"
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              required
              placeholder="OM, SA, AE..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("admin.countryName")}
            </label>
            <Input
              type="text"
              name="countryName"
              value={formData.countryName}
              onChange={handleChange}
              required
            />
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
