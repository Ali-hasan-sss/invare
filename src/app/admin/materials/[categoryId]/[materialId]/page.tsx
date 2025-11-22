"use client";

import React, { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Tag,
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  Calendar,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import { useTranslation } from "../../../../../hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "../../../../../store/hooks";
import {
  getMaterialCategories,
  MaterialCategory,
} from "../../../../../store/slices/materialCategoriesSlice";
import {
  getMaterials,
  Material,
} from "../../../../../store/slices/materialsSlice";
import {
  getListings,
  createListing,
  updateListing,
  deleteListing,
  clearError as clearListingError,
  Listing,
  CreateListingData,
  UpdateListingData,
} from "../../../../../store/slices/listingsSlice";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "../../../../../components/ui/Card";
import { Button } from "../../../../../components/ui/Button";
import { Input } from "../../../../../components/ui/Input";
import { Badge } from "../../../../../components/ui/Badge";
import { ListingFormDialog } from "../../../../../components/ListingFormDialog";
import { DeleteConfirmDialog } from "../../../../../components/admin/DeleteConfirmDialog";
import { Toast } from "../../../../../components/ui/Toast";
import { cn } from "../../../../../lib/utils";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../../../../../hooks/useAuth";

export default function ListingsPage() {
  const { t, currentLanguage } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.categoryId as string;
  const materialId = params?.materialId as string;
  const { user, company } = useAuth();
  const isRTL = currentLanguage.code === "ar";

  const { categories } = useAppSelector((state) => state.materialCategories);
  const { materials } = useAppSelector((state) => state.materials);
  const {
    listings,
    isLoading: listingsLoading,
    error: listingsError,
  } = useAppSelector((state) => state.listings);

  const [selectedCategory, setSelectedCategory] =
    useState<MaterialCategory | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [listingFormOpen, setListingFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Helper function to translate listing status
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return t("listings.status.active") || t("listings.active");
      case "pending":
        return t("listings.pending");
      case "expired":
        return t("listings.expired");
      case "draft":
        return t("listings.status.draft");
      case "closed":
        return t("listings.status.closed");
      case "cancelled":
        return t("listings.status.cancelled");
      default:
        return status;
    }
  };

  // Helper function to translate unit of measure
  const getUnitOfMeasureText = (unit: string | undefined) => {
    if (!unit) return "";
    const unitLower = unit.toLowerCase();
    const translated = t(`common.unitOfMeasures.${unitLower}`);
    // If translation not found, return original value
    return translated && translated !== `common.unitOfMeasures.${unitLower}`
      ? translated
      : unit;
  };

  // Fetch categories and materials
  useEffect(() => {
    // Fetch categories without lang parameter to get i18n object with both languages
    dispatch(getMaterialCategories());
  }, [dispatch]);

  useEffect(() => {
    if (categoryId && categories.length > 0) {
      const category = categories.find((cat) => cat.id === categoryId);
      if (category) {
        setSelectedCategory(category);
        // Fetch materials without lang parameter to get i18n object with both languages
        dispatch(getMaterials({ categoryId }));
      }
    }
  }, [categoryId, categories, dispatch]);

  useEffect(() => {
    if (materialId && materials.length > 0) {
      const material = materials.find((mat) => mat.id === materialId);
      if (material) {
        setSelectedMaterial(material);
        // Fetch listings without lang parameter to get i18n object with both languages
        dispatch(getListings({ materialId }));
      }
    }
  }, [materialId, materials, dispatch]);

  useEffect(() => {
    if (listingsError) {
      setToast({ message: listingsError, type: "error" });
      dispatch(clearListingError());
    }
  }, [listingsError, dispatch]);

  const handleAddListing = () => {
    setEditingListing(null);
    setListingFormOpen(true);
  };

  const handleEditListing = (listing: Listing) => {
    setEditingListing(listing);
    setListingFormOpen(true);
  };

  const handleDeleteListing = (listing: Listing) => {
    setDeletingListing(listing);
    setDeleteDialogOpen(true);
  };

  const handleSubmitListing = async (data: CreateListingData) => {
    try {
      if (!selectedMaterial) {
        setToast({ message: t("admin.error"), type: "error" });
        return;
      }

      // Prepare listing data with materialId and seller info
      const listingData: CreateListingData = {
        ...data,
        materialId: selectedMaterial.id,
        // Add sellerCompanyId or sellerUserId based on what's available
        ...(company?.id ? { sellerCompanyId: company.id } : {}),
        ...(user?.id && !company?.id ? { sellerUserId: user.id } : {}),
      };

      if (editingListing) {
        // Update existing listing
        await dispatch(
          updateListing({
            id: editingListing.id,
            data: listingData as UpdateListingData,
          })
        ).unwrap();
        setToast({
          message:
            t("listing.listingUpdatedSuccess") ||
            "Listing updated successfully",
          type: "success",
        });
      } else {
        // Create new listing
        await dispatch(createListing(listingData)).unwrap();
        setToast({
          message:
            t("listing.listingCreatedSuccess") ||
            "Listing created successfully",
          type: "success",
        });
      }
      setListingFormOpen(false);
      setEditingListing(null);
      // Refresh listings without lang parameter to get i18n object
      if (materialId) {
        dispatch(getListings({ materialId }));
      }
    } catch (err: any) {
      setToast({
        message: err.message || t("admin.error"),
        type: "error",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingListing) return;

    try {
      await dispatch(deleteListing(deletingListing.id)).unwrap();
      setToast({
        message:
          t("listing.listingDeletedSuccess") || "Listing deleted successfully",
        type: "success",
      });
      setDeleteDialogOpen(false);
      setDeletingListing(null);
      // Refresh listings without lang parameter to get i18n object
      if (materialId) {
        dispatch(getListings({ materialId }));
      }
    } catch (err) {
      setToast({ message: t("admin.error"), type: "error" });
    }
  };

  const handleBackToMaterials = () => {
    router.push(`/admin/materials/${categoryId}`);
  };

  const filteredListings = listings.filter((listing) => {
    if (!searchQuery.trim()) return true;

    const searchLower = searchQuery.toLowerCase();
    const titleEn = listing.i18n?.en?.title || "";
    const titleAr = listing.i18n?.ar?.title || "";
    const title = listing.title || "";
    const descriptionEn = listing.i18n?.en?.description || "";
    const descriptionAr = listing.i18n?.ar?.description || "";
    const description = listing.description || "";

    return (
      listing.seller?.companyName?.toLowerCase().includes(searchLower) ||
      listing.startingPrice?.toString().includes(searchQuery) ||
      title.toLowerCase().includes(searchLower) ||
      titleEn.toLowerCase().includes(searchLower) ||
      titleAr.toLowerCase().includes(searchLower) ||
      description.toLowerCase().includes(searchLower) ||
      descriptionEn.toLowerCase().includes(searchLower) ||
      descriptionAr.toLowerCase().includes(searchLower)
    );
  });

  if (!selectedCategory || !selectedMaterial) {
    return (
      <div className="p-8 text-center text-gray-600 dark:text-gray-400">
        {t("admin.loading")}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Button
            variant="secondary"
            onClick={handleBackToMaterials}
            className="h-10 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 font-medium"
          >
            {isRTL ? (
              <ArrowRight className="h-5 w-5 ml-2" />
            ) : (
              <ArrowLeft className="h-5 w-5 mr-2" />
            )}
            {t("admin.backToMaterials")}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Tag className="h-8 w-8 text-green-600" />
            {selectedMaterial.i18n?.[currentLanguage.code]?.name ||
              selectedMaterial.name}
          </h1>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t("listings.title")}
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-4 py-3 px-4">
        <div className="relative w-full">
          <Search
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10",
              isRTL ? "left-3" : "right-3"
            )}
          />
          <Input
            type="text"
            placeholder={t("admin.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "40px",
                borderRadius: "6px",
              },
              "& .MuiOutlinedInput-input": {
                paddingLeft: isRTL ? "14px !important" : "36px !important",
                paddingRight: isRTL ? "36px !important" : "14px !important",
                fontSize: "14px",
              },
            }}
          />
        </div>
      </Card>

      {/* Action Button */}
      <div className="mb-4">
        <Button
          onClick={handleAddListing}
          className="h-10 px-4 !bg-[#2563eb] hover:!bg-[#1d4ed8] dark:!bg-blue-500 dark:hover:!bg-blue-600 font-semibold shadow-md hover:shadow-lg transition-all"
          sx={{
            color: "white !important",
            backgroundColor: "#2563eb !important",
            "&:hover": {
              color: "white !important",
              backgroundColor: "#1d4ed8 !important",
            },
            "& *": {
              color: "white !important",
            },
          }}
        >
          <Plus
            className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")}
            style={{ color: "white" }}
          />
          <span style={{ color: "white", fontWeight: 600 }}>
            {t("listing.addListing") || "Add Listing"}
          </span>
        </Button>
      </div>

      {/* Listings View */}
      <div>
        {listingsLoading ? (
          <Card className="p-8 text-center text-gray-600 dark:text-gray-400">
            {t("admin.loading")}
          </Card>
        ) : filteredListings.length === 0 ? (
          <Card className="p-8 text-center text-gray-600 dark:text-gray-400">
            {t("listings.noListings")}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing) => (
              <Card
                key={listing.id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <CardContent className="p-4">
                  {/* Listing Image */}
                  <div className="relative w-full h-48 mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    {listing.photos && listing.photos.length > 0 ? (
                      <Image
                        src={listing.photos[0].url}
                        alt={
                          listing.i18n?.[currentLanguage.code]?.title ||
                          listing.title ||
                          "Listing"
                        }
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={
                          listing.status === "active"
                            ? "success"
                            : listing.status === "pending"
                            ? "warning"
                            : "error"
                        }
                      >
                        {getStatusText(listing.status)}
                      </Badge>
                    </div>
                  </div>

                  {/* Listing Title */}
                  <CardTitle className="text-lg font-semibold mb-2 text-gray-900 dark:text-white line-clamp-2">
                    {listing.i18n?.[currentLanguage.code]?.title ||
                      listing.title ||
                      "N/A"}
                  </CardTitle>

                  {/* Listing Description */}
                  {listing.i18n?.[currentLanguage.code]?.description ||
                  listing.description ? (
                    <CardDescription className="mb-2 text-gray-600 dark:text-gray-400 line-clamp-2">
                      {listing.i18n?.[currentLanguage.code]?.description ||
                        listing.description}
                    </CardDescription>
                  ) : null}

                  {/* Company Name */}
                  {listing.seller?.companyName && (
                    <CardDescription className="mb-3 text-gray-600 dark:text-gray-400">
                      <ShoppingCart className="h-4 w-4 inline mr-1" />
                      {listing.seller.companyName}
                    </CardDescription>
                  )}

                  {/* Listing Details */}
                  <div className="space-y-2 mb-4">
                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("listings.price")}
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        <DollarSign className="h-4 w-4 inline" />
                        {listing.startingPrice} {t("currency.omr")}
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("listings.quantity")}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {listing.stockAmount}{" "}
                        {getUnitOfMeasureText(
                          (listing.material as any)?.i18n?.[
                            currentLanguage.code
                          ]?.unitOfMeasure ||
                            listing.material?.unitOfMeasure ||
                            listing.unitOfMeasure
                        )}
                      </span>
                    </div>

                    {/* Expiry Date */}
                    {listing.expiresAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t("listing.expiresAt")}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-500">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(listing.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="flex justify-end">
                      <Badge
                        variant={listing.isBiddable ? "info" : "default"}
                        className="text-xs"
                      >
                        {listing.isBiddable
                          ? t("listings.biddable")
                          : t("listings.direct")}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditListing(listing)}
                      className="flex-1"
                      title={t("admin.edit")}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t("admin.edit")}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteListing(listing)}
                      className="flex-1"
                      title={t("admin.delete")}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("admin.delete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ListingFormDialog
        open={listingFormOpen}
        onClose={() => {
          setListingFormOpen(false);
          setEditingListing(null);
        }}
        onSubmit={handleSubmitListing}
        initialCategoryId={categoryId}
        initialMaterialId={materialId}
        editingListing={editingListing}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={t("listing.deleteListing") || "Delete Listing"}
        description={t("listing.deleteListingConfirm")}
        isLoading={listingsLoading}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
