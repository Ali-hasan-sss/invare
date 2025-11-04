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
import { useMaterialCategories } from "@/hooks/useMaterialCategories";
import {
  CreateListingData,
  ListingPhotoInput,
  ListingAttributeInput,
} from "@/store/slices/listingsSlice";
import { X, Plus } from "lucide-react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useToast } from "@/components/ui/Toast";

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
  const { categories, getCategories } = useMaterialCategories();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<CreateListingData>({
    title: "",
    description: "",
    unitOfMeasure: "",
    startingPrice: "",
    stockAmount: 0,
    status: "active",
    expiresAt: "",
    isBiddable: false,
    materialId: "",
    photos: [],
    attributes: [],
  });

  const [photos, setPhotos] = useState<
    {
      url: string;
      isPrimary: boolean;
    }[]
  >([]);
  const [attributes, setAttributes] = useState<
    { attrKey: string; attrValue: string }[]
  >([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");

  useEffect(() => {
    if (open) {
      // Fetch categories when dialog opens
      getCategories();
      // Reset category selection when dialog opens
      setSelectedCategoryId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Fetch materials only when category is selected
  useEffect(() => {
    if (open && selectedCategoryId) {
      getMaterials({ categoryId: selectedCategoryId });
      // Reset material selection when category changes
      setFormData((prev) => ({ ...prev, materialId: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId]);

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

  const handlePhotoChange = (index: number, url: string) => {
    const newPhotos = [...photos];
    newPhotos[index] = {
      url,
      isPrimary: photos.length === 0 && index === 0,
    };
    setPhotos(newPhotos);
    setFormData((prev) => ({
      ...prev,
      photos: newPhotos
        .filter((p) => p.url)
        .map((p, i) => ({
          url: p.url,
          isPrimary: p.isPrimary,
          sortOrder: i,
        })),
    }));
    if (url) {
      showToast(
        t("listing.photoUploaded") || "Photo uploaded successfully",
        "success"
      );
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    // If removed photo was primary, make first photo primary
    if (photos[index].isPrimary && newPhotos.length > 0) {
      newPhotos[0].isPrimary = true;
    }
    setPhotos(newPhotos);
    setFormData((prev) => ({
      ...prev,
      photos: newPhotos.map((p, i) => ({
        url: p.url,
        isPrimary: p.isPrimary,
        sortOrder: i,
      })),
    }));
  };

  const handleSetPrimaryPhoto = (index: number) => {
    const newPhotos = photos.map((p, i) => ({
      ...p,
      isPrimary: i === index,
    }));
    setPhotos(newPhotos);
    setFormData((prev) => ({
      ...prev,
      photos: newPhotos.map((p, i) => ({
        url: p.url,
        isPrimary: p.isPrimary,
        sortOrder: i,
      })),
    }));
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { attrKey: "", attrValue: "" }]);
  };

  const handleRemoveAttribute = (index: number) => {
    const newAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(newAttributes);
    setFormData((prev) => ({
      ...prev,
      attributes: newAttributes,
    }));
  };

  const handleAttributeChange = (
    index: number,
    field: "attrKey" | "attrValue",
    value: string
  ) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
    setFormData((prev) => ({
      ...prev,
      attributes: newAttributes,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate category is selected
    if (!selectedCategoryId) {
      showToast(
        t("listing.selectCategoryFirst") || "Please select a category first",
        "error"
      );
      return;
    }

    // Filter out photos without URLs (empty upload slots)
    const validPhotos = photos.filter((p) => p.url);

    // Prepare final data with photos and attributes
    const finalData: CreateListingData = {
      ...formData,
      photos:
        validPhotos.length > 0
          ? validPhotos.map((p, index) => ({
              url: p.url,
              isPrimary: p.isPrimary,
              sortOrder: index,
            }))
          : undefined,
      attributes:
        attributes.length > 0 &&
        attributes.every((attr) => attr.attrKey && attr.attrValue)
          ? attributes
          : undefined,
    };

    onSubmit(finalData);

    // Reset form
    setFormData({
      title: "",
      description: "",
      unitOfMeasure: "",
      startingPrice: "",
      stockAmount: 0,
      status: "active",
      expiresAt: "",
      isBiddable: false,
      materialId: "",
      photos: [],
      attributes: [],
    });
    setPhotos([]);
    setAttributes([]);
    setSelectedCategoryId("");
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

            {/* Category and Material */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {t("listing.category")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  required
                  className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400"
                >
                  <SelectOption value="">
                    {t("listing.selectCategory")}
                  </SelectOption>
                  {categories.map((category) => (
                    <SelectOption key={category.id} value={category.id}>
                      {category.name}
                    </SelectOption>
                  ))}
                </Select>
              </div>

              {/* Material */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  {t("listing.material")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  name="materialId"
                  value={formData.materialId}
                  onChange={handleChange}
                  required
                  disabled={!selectedCategoryId}
                  className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SelectOption value="">
                    {selectedCategoryId
                      ? t("listing.selectMaterial")
                      : t("listing.selectCategoryFirst")}
                  </SelectOption>
                  {selectedCategoryId &&
                    materials.map((material) => (
                      <SelectOption key={material.id} value={material.id}>
                        {material.name}
                      </SelectOption>
                    ))}
                </Select>
              </div>
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
            {/* <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
            </div> */}

            {/* Photos Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t("listing.photos")}{" "}
                <span className="text-gray-500 text-xs">
                  ({t("listing.optional")})
                </span>
              </label>
              <div className="space-y-3">
                {photos.map((photo, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <ImageUpload
                          value={photo.url}
                          onChange={(url) => handlePhotoChange(index, url)}
                          onRemove={() => handleRemovePhoto(index)}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        {!photo.url && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemovePhoto(index)}
                            className="px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        {photo.url && (
                          <>
                            {!photo.isPrimary && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetPrimaryPhoto(index)}
                                className="text-xs px-2 py-1 whitespace-nowrap"
                              >
                                {t("listing.setPrimary")}
                              </Button>
                            )}
                            {photo.isPrimary && (
                              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-center">
                                {t("listing.primary")}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPhotos([
                      ...photos,
                      { url: "", isPrimary: photos.length === 0 },
                    ]);
                  }}
                  className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("listing.addPhoto")}
                </Button>
              </div>
            </div>

            {/* Attributes Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                {t("listing.attributes")}{" "}
                <span className="text-gray-500 text-xs">
                  ({t("listing.optional")})
                </span>
              </label>
              <div className="space-y-2">
                {attributes.map((attr, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <Input
                      type="text"
                      value={attr.attrKey}
                      onChange={(e) =>
                        handleAttributeChange(index, "attrKey", e.target.value)
                      }
                      placeholder={t("listing.attrKeyPlaceholder")}
                      className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                    />
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={attr.attrValue}
                        onChange={(e) =>
                          handleAttributeChange(
                            index,
                            "attrValue",
                            e.target.value
                          )
                        }
                        placeholder={t("listing.attrValuePlaceholder")}
                        className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveAttribute(index)}
                        className="px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddAttribute}
                  className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t("listing.addAttribute")}
                </Button>
              </div>
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
