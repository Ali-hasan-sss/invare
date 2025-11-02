"use client";

import { useState, useEffect, ChangeEvent } from "react";
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
import { useMaterials } from "@/hooks/useMaterials";
import { CreateListingData } from "@/store/slices/listingsSlice";

interface ListingFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (listingData: CreateListingData) => void;
}

export const ListingFormDialog: React.FC<ListingFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { materials, getMaterials } = useMaterials();

  const [formData, setFormData] = useState<CreateListingData>({
    title: "",
    description: "",
    unitOfMeasure: "",
    startingPrice: "",
    stockAmount: 0,
    status: "active",
    expiresAt: "",
    isBiddable: true,
    materialId: "",
  });

  useEffect(() => {
    if (open) {
      // Fetch materials when dialog opens
      getMaterials();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      const numValue = Number(value);
      // Enforce minimum value of 1 for stockAmount
      if (name === "stockAmount" && numValue < 1) {
        return;
      }
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form
    setFormData({
      title: "",
      description: "",
      unitOfMeasure: "",
      startingPrice: "",
      stockAmount: 0,
      status: "active",
      expiresAt: "",
      isBiddable: true,
      materialId: "",
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
          {t("listing.addListing")}
        </DialogTitle>
        <DialogContent
          sx={{ pt: 3, pb: 2 }}
          className="bg-white dark:bg-gray-900"
        >
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t("listing.title")} <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder={t("listing.enterTitle")}
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            {/* Material */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t("listing.material")} <span className="text-red-500">*</span>
              </label>
              <Select
                name="materialId"
                value={formData.materialId}
                onChange={handleChange}
                required
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
              >
                <SelectOption value="">
                  {t("listing.selectMaterial")}
                </SelectOption>
                {materials.map((material) => (
                  <SelectOption key={material.id} value={material.id}>
                    {material.name}
                  </SelectOption>
                ))}
              </Select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t("listing.description")}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder={t("listing.enterDescription")}
                className="w-full px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
              />
            </div>

            {/* Grid: Unit of Measure & Stock Amount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {t("listing.unitOfMeasure")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="unitOfMeasure"
                  value={formData.unitOfMeasure}
                  onChange={handleChange}
                  required
                  placeholder={t("listing.enterUnitOfMeasure")}
                  className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {t("listing.stockAmount")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  name="stockAmount"
                  value={formData.stockAmount}
                  onChange={handleChange}
                  required
                  placeholder={t("listing.enterStockAmount")}
                  className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div>

            {/* Grid: Starting Price & Expires At */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {t("listing.startingPrice")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="startingPrice"
                  value={formData.startingPrice}
                  onChange={handleChange}
                  required
                  placeholder={t("listing.enterStartingPrice")}
                  className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {t("listing.expiresAt")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  required
                  className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div>

            {/* Is Biddable */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <input
                type="checkbox"
                id="isBiddable"
                name="isBiddable"
                checked={formData.isBiddable}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="isBiddable"
                className="text-sm font-medium text-gray-800 dark:text-gray-200 cursor-pointer"
              >
                {t("listing.isBiddable")}
              </label>
            </div>

            {/* Info Note */}
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md">
              ℹ️ {t("listing.listingNote")}
            </p>
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
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            className="px-4 py-2 !bg-blue-600 hover:!bg-blue-700 dark:!bg-blue-500 dark:hover:!bg-blue-600 !text-white font-semibold shadow-sm"
            sx={{
              color: "white !important",
              "& *": { color: "white !important" },
            }}
          >
            {t("listing.createListing")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
