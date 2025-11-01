"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectOption } from "@/components/ui/Select";
import { useTranslation } from "@/hooks/useTranslation";
import { useListings } from "@/hooks/useListings";
import { ImageUpload } from "@/components/ui/ImageUpload";
import type { Advertisement } from "@/store/slices/advertisementsSlice";

interface AdvertisementFormDialogProps {
  open: boolean;
  advertisement: Advertisement | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const AdvertisementFormDialog: React.FC<
  AdvertisementFormDialogProps
> = ({ open, advertisement, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const { listings, getListings } = useListings();

  const [formData, setFormData] = useState({
    imageUrl: "",
    listingId: "",
    expiresAt: "",
  });

  useEffect(() => {
    if (open) {
      getListings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (advertisement) {
      // Format date for datetime-local input
      const expiresDate = advertisement.expiresAt
        ? new Date(advertisement.expiresAt).toISOString().slice(0, 16)
        : "";

      setFormData({
        imageUrl: advertisement.imageUrl || "",
        listingId: advertisement.listing?.id || "",
        expiresAt: expiresDate,
      });
    } else {
      setFormData({
        imageUrl: "",
        listingId: "",
        expiresAt: "",
      });
    }
  }, [advertisement, open]);

  const handleChange = (
    e: ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "rgb(var(--background) / 1)",
          backgroundImage: "none",
          color: "var(--foreground)",
          borderRadius: "12px",
        },
        className: "bg-white dark:bg-gray-900",
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            fontWeight: 600,
            fontSize: "1.25rem",
            borderBottom: "1px solid",
          }}
          className="text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
        >
          {advertisement
            ? t("admin.editAdvertisement")
            : t("admin.addAdvertisement")}
        </DialogTitle>
        <DialogContent
          sx={{ pt: 3, pb: 2 }}
          className="bg-white dark:bg-gray-900"
        >
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t("admin.imageUrl")} <span className="text-red-500">*</span>
              </label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) =>
                  setFormData((prev) => ({ ...prev, imageUrl: url }))
                }
                onRemove={() =>
                  setFormData((prev) => ({ ...prev, imageUrl: "" }))
                }
              />
            </div>

            {/* Listing */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t("admin.selectListing")}{" "}
                <span className="text-red-500">*</span>
              </label>
              <Select
                name="listingId"
                value={formData.listingId}
                onChange={handleChange}
                required
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              >
                <SelectOption value="">{t("admin.selectListing")}</SelectOption>
                {listings.map((listing) => (
                  <SelectOption key={listing.id} value={listing.id}>
                    {listing.title}
                  </SelectOption>
                ))}
              </Select>
            </div>

            {/* Expires At */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t("admin.expiresAt")} <span className="text-red-500">*</span>
              </label>
              <Input
                type="datetime-local"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                required
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
              <p className="mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md">
                ℹ️ {t("admin.advertisementActiveByDefault")}
              </p>
            </div>
          </div>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2.5,
            borderTop: "1px solid",
          }}
          className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
        >
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium"
          >
            {t("admin.cancel")}
          </Button>
          <Button
            type="submit"
            className="px-4 py-2 !bg-blue-600 hover:!bg-blue-700 dark:!bg-blue-500 dark:hover:!bg-blue-600 !text-white font-semibold shadow-sm"
            sx={{
              color: "white !important",
              "& *": { color: "white !important" },
            }}
          >
            {t("admin.add")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
