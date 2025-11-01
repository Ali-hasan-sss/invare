"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserAddresses } from "@/hooks/useUserAddresses";
import { useCompanyAddresses } from "@/hooks/useCompanyAddresses";
import { useCountries } from "@/hooks/useCountries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectOption } from "@/components/ui/Select";
import { X, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressFormDialogProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
  companyId?: string;
  onSuccess?: () => void;
}

export default function AddressFormDialog({
  open,
  onClose,
  userId,
  companyId,
  onSuccess,
}: AddressFormDialogProps) {
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage.dir === "rtl";

  const { createUserAddress, isLoading: userLoading } = useUserAddresses();
  const { createCompanyAddress, isLoading: companyLoading } =
    useCompanyAddresses();
  const { countries, getCountries } = useCountries();

  const [formData, setFormData] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    countryId: "",
    isDefault: false,
  });

  useEffect(() => {
    if (open) {
      getCountries();
    }
  }, [open, getCountries]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // Combine addressLine1 and addressLine2 into street
      const street = [formData.addressLine1, formData.addressLine2]
        .filter(Boolean)
        .join(", ");

      let result;
      if (userId) {
        result = await createUserAddress({
          street,
          city: formData.city,
          postalCode: formData.postalCode,
          countryId: formData.countryId,
          isDefault: formData.isDefault,
          userId,
        });
      } else if (companyId) {
        result = await createCompanyAddress({
          street,
          city: formData.city,
          state: formData.state || undefined,
          postalCode: formData.postalCode,
          countryId: formData.countryId,
          isDefault: formData.isDefault,
          companyId,
        });
      }

      if (result && result.type.endsWith("/fulfilled")) {
        onSuccess?.();
        handleClose();
      }
    } catch (error) {
      console.error("Failed to create address:", error);
    }
  };

  const handleClose = () => {
    setFormData({
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      countryId: "",
      isDefault: false,
    });
    onClose();
  };

  const isLoading = userLoading || companyLoading;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: "bg-white dark:bg-gray-900",
        sx: {
          backgroundImage: "none",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "var(--border-color, #e5e7eb)",
          ".dark &": {
            borderColor: "#374151",
          },
        },
      }}
    >
      <DialogTitle
        className="bg-gray-50 dark:bg-gray-800"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
          pb: 2,
        }}
      >
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          {t("profile.addAddress")}
        </span>
        <button
          onClick={handleClose}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent className="bg-white dark:bg-gray-900" sx={{ pt: 3 }}>
          <div className="space-y-5">
            {/* Address Line 1 */}
            <div>
              <label
                htmlFor="addressLine1"
                className={cn(
                  "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",
                  isRTL && "text-right"
                )}
              >
                {t("profile.addressLine1")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                id="addressLine1"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                required
                placeholder={t("profile.enterAddressLine1")}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <label
                htmlFor="addressLine2"
                className={cn(
                  "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",
                  isRTL && "text-right"
                )}
              >
                {t("profile.addressLine2")}
              </label>
              <Input
                type="text"
                id="addressLine2"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder={t("profile.addressLine2")}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
            </div>

            {/* City and State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className={cn(
                    "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",
                    isRTL && "text-right"
                  )}
                >
                  {t("profile.city")} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder={t("profile.enterCity")}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className={cn(
                    "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",
                    isRTL && "text-right"
                  )}
                >
                  {t("profile.state")} <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder={t("profile.enterState")}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
              </div>
            </div>

            {/* Postal Code and Country */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="postalCode"
                  className={cn(
                    "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2",
                    isRTL && "text-right"
                  )}
                >
                  {t("profile.postalCode")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  required
                  placeholder={t("profile.enterPostalCode")}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
              </div>

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
                  <SelectOption value="">
                    {t("profile.selectCountry")}
                  </SelectOption>
                  {countries.map((country) => (
                    <SelectOption key={country.id} value={country.id}>
                      {country.countryName}
                    </SelectOption>
                  ))}
                </Select>
              </div>
            </div>

            {/* Is Default Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="isDefault"
                className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {t("profile.setAsDefault")}
              </label>
            </div>
          </div>
        </DialogContent>

        <DialogActions
          className="bg-gray-50 dark:bg-gray-800"
          sx={{
            borderTop: 1,
            borderColor: "divider",
            p: 2.5,
            gap: 1.5,
          }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            {t("profile.cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>{t("profile.loading")}</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>{t("profile.save")}</span>
              </>
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
