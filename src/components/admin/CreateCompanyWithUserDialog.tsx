"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/Dialog";
import { Input } from "../ui/Input";
import { Select, SelectOption } from "../ui/Select";
import { Button } from "../ui/Button";
import { useTranslation } from "@/hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getCountries } from "@/store/slices/countriesSlice";
import { CreateCompanyWithUserData } from "@/store/slices/companiesSlice";

interface CreateCompanyWithUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCompanyWithUserData) => Promise<void>;
  isLoading?: boolean;
}

const initialData: CreateCompanyWithUserData = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  userCountryId: "",
  companyName: "",
  vatNumber: "",
  website: "",
  companyCountryId: "",
};

export const CreateCompanyWithUserDialog: React.FC<
  CreateCompanyWithUserDialogProps
> = ({ open, onOpenChange, onSubmit, isLoading = false }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { countries } = useAppSelector((state) => state.countries);
  const [formData, setFormData] =
    useState<CreateCompanyWithUserData>(initialData);

  useEffect(() => {
    dispatch(getCountries());
  }, [dispatch]);

  useEffect(() => {
    if (!open) {
      setFormData(initialData);
    }
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      phone: formData.phone?.trim() || undefined,
      vatNumber: formData.vatNumber?.trim() || undefined,
      website: formData.website?.trim() || undefined,
      userCountryId: formData.userCountryId || undefined,
      companyCountryId: formData.companyCountryId || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onClose={() => onOpenChange(false)}
        className="bg-white dark:bg-gray-900 max-w-3xl"
      >
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            {t("admin.addCompanyWithUser") ||
              "إنشاء شركة جديدة وربط مستخدم جديد"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                {t("admin.userInformation") || "بيانات المستخدم"}
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t("common.email")} <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t("auth.firstName")} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t("auth.lastName")} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t("common.phone")}
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+9665XXXXXXX"
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t("admin.userCountry") || "دولة المستخدم"}
              </label>
              <Select
                name="userCountryId"
                value={formData.userCountryId ?? ""}
                onChange={handleChange}
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              >
                <SelectOption value="">
                  {t("admin.selectCountry") || "اختر الدولة"}
                </SelectOption>
                {countries.map((country) => (
                  <SelectOption key={country.id} value={country.id}>
                    {country.countryName}
                  </SelectOption>
                ))}
              </Select>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
              {t("admin.companyInformation") || "بيانات الشركة"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {t("admin.companyName")}{" "}
                  <span className="text-red-500">*</span>
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
                  {t("admin.companyCountry") || "دولة الشركة"}
                </label>
                <Select
                  name="companyCountryId"
                  value={formData.companyCountryId ?? ""}
                  onChange={handleChange}
                  className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                >
                  <SelectOption value="">
                    {t("admin.selectCountry") || "اختر الدولة"}
                  </SelectOption>
                  {countries.map((country) => (
                    <SelectOption key={country.id} value={country.id}>
                      {country.countryName}
                    </SelectOption>
                  ))}
                </Select>
              </div>
            </div>
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

export default CreateCompanyWithUserDialog;
