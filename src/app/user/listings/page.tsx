"use client";

import React, { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Search,
  Tag,
  Image as ImageIcon,
  Calendar,
  ShoppingCart,
} from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";
import { useListings } from "../../../hooks/useListings";
import {
  Listing,
  CreateListingData,
  UpdateListingData,
} from "../../../store/slices/listingsSlice";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { Select, SelectOption } from "../../../components/ui/Select";
import { Pagination, Box } from "@mui/material";
import { ListingFormDialog } from "../../../components/ListingFormDialog";
import { DeleteConfirmDialog } from "../../../components/admin/DeleteConfirmDialog";
import { Toast } from "../../../components/ui/Toast";
import { cn } from "../../../lib/utils";
import Image from "next/image";
import { useAuth } from "../../../hooks/useAuth";

export default function MyListingsPage() {
  const { t, currentLanguage } = useTranslation();
  const { user, company } = useAuth();
  const isRTL = currentLanguage.code === "ar";

  const {
    listings,
    isLoading: listingsLoading,
    error: listingsError,
    totalCount,
    currentPage,
    limit,
    getMyListings,
    createListing,
    updateListing,
    deleteListing,
    clearError,
    setCurrentPage,
  } = useListings();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
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

  // Helper function to get unit of measure text
  const getUnitOfMeasureText = (unit: string | undefined) => {
    if (!unit) return "";
    const unitLower = unit.toLowerCase();
    const translated = t(`common.unitOfMeasures.${unitLower}`);
    // If translation not found, return original value
    return translated && translated !== `common.unitOfMeasures.${unitLower}`
      ? translated
      : unit;
  };

  // Fetch user's listings
  useEffect(() => {
    if (user?.id) {
      getMyListings({
        page: currentPage,
        limit: limit,
        status: statusFilter || undefined,
      });
    }
  }, [user?.id, currentPage, limit, statusFilter, getMyListings]);

  useEffect(() => {
    if (listingsError) {
      setToast({ message: listingsError, type: "error" });
      clearError();
    }
  }, [listingsError, clearError]);

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
      // Prepare listing data with seller info
      const listingData: CreateListingData = {
        ...data,
        // Add sellerCompanyId or sellerUserId based on what's available
        ...(company?.id ? { sellerCompanyId: company.id } : {}),
        ...(user?.id && !company?.id ? { sellerUserId: user.id } : {}),
      };

      if (editingListing) {
        // Update existing listing
        await updateListing(
          editingListing.id,
          listingData as UpdateListingData
        );
        setToast({
          message:
            t("listing.listingUpdatedSuccess") ||
            "Listing updated successfully",
          type: "success",
        });
      } else {
        // Create new listing
        await createListing(listingData);
        setToast({
          message:
            t("listing.listingCreatedSuccess") ||
            "Listing created successfully",
          type: "success",
        });
      }
      setListingFormOpen(false);
      setEditingListing(null);
      // Refresh listings
      if (user?.id) {
        getMyListings({
          page: currentPage,
          limit: limit,
          status: statusFilter || undefined,
        });
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
      await deleteListing(deletingListing.id);
      setToast({
        message:
          t("listing.listingDeletedSuccess") || "Listing deleted successfully",
        type: "success",
      });
      setDeleteDialogOpen(false);
      setDeletingListing(null);
      // Refresh listings
      if (user?.id) {
        getMyListings({
          page: currentPage,
          limit: limit,
          status: statusFilter || undefined,
        });
      }
    } catch (err) {
      setToast({ message: t("admin.error"), type: "error" });
    }
  };

  // Filter listings by search query
  const filteredListings = listings.filter(
    (listing) =>
      listing.seller?.companyName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      listing.startingPrice?.toString().includes(searchQuery) ||
      listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.material?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Tag className="h-8 w-8 text-purple-600" />
          {t("user.myListings") || "عروضي"}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t("user.manageListings") || "إدارة عروضك"}
        </p>
      </div>

      {/* Search and Filter Bar */}
      <Card className="mb-6 py-5 px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
          {/* Search */}
          <div className="w-full flex flex-col">
            <label
              htmlFor="search-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 h-5 leading-5"
            >
              {t("admin.search") || "بحث"}
            </label>
            <div className="relative w-full">
              <Search
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10",
                  isRTL ? "left-3" : "right-3"
                )}
                style={{
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <Input
                id="search-input"
                type="text"
                placeholder={t("admin.search") || "بحث..."}
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
                    lineHeight: "1.5",
                  },
                }}
              />
            </div>
          </div>
          {/* Status Filter */}
          <div className="w-full flex flex-col">
            <label
              htmlFor="status-filter"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 h-5 leading-5"
            >
              {t("listings.filterByStatus") || "فلترة حسب الحالة"}
            </label>
            <Select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              className="h-10 w-full rounded-md text-sm"
              style={{
                height: "40px",
                fontSize: "14px",
              }}
            >
              <SelectOption value="">
                {t("listings.allStatuses") || "جميع الحالات"}
              </SelectOption>
              <SelectOption value="draft">
                {t("listings.status.draft") || "مسودة"}
              </SelectOption>
              <SelectOption value="active">
                {t("listings.status.active") || "نشط"}
              </SelectOption>
              <SelectOption value="closed">
                {t("listings.status.closed") || "مغلق"}
              </SelectOption>
              <SelectOption value="cancelled">
                {t("listings.status.cancelled") || "ملغي"}
              </SelectOption>
            </Select>
          </div>
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
            {t("listing.addListing") || "إضافة عرض"}
          </span>
        </Button>
      </div>

      {/* Listings View */}
      <div>
        {listingsLoading ? (
          <Card className="p-8 text-center text-gray-600 dark:text-gray-400">
            {t("admin.loading") || "جاري التحميل..."}
          </Card>
        ) : filteredListings.length === 0 ? (
          <Card className="p-8 text-center text-gray-600 dark:text-gray-400">
            {searchQuery
              ? t("admin.noResults") || "لا توجد نتائج"
              : t("listings.noListings") || "لا توجد عروض"}
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
                        alt={listing.title || "Listing"}
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

                  {/* Material Name */}
                  {listing.material && (
                    <CardDescription className="mb-3 text-gray-600 dark:text-gray-400">
                      <Tag className="h-4 w-4 inline mr-1" />
                      {listing.material.i18n?.[currentLanguage.code]?.name ||
                        listing.material.name ||
                        ""}
                    </CardDescription>
                  )}

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
                        {t("listings.price") || "السعر"}
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {listing.startingPrice} {t("currency.sar") || "ر.س"}
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("listings.quantity") || "الكمية"}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {listing.stockAmount}{" "}
                        {getUnitOfMeasureText(
                          listing.material?.i18n?.[currentLanguage.code]
                            ?.unitOfMeasure || listing.unitOfMeasure
                        )}
                      </span>
                    </div>

                    {/* Expiry Date */}
                    {listing.expiresAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t("listing.expiresAt") || "تاريخ الانتهاء"}
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
                          ? t("listings.biddable") || "قابل للمزايدة"
                          : t("listings.direct") || "مباشر"}
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
                      title={t("admin.edit") || "تعديل"}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t("admin.edit") || "تعديل"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteListing(listing)}
                      className="flex-1"
                      title={t("admin.delete") || "حذف"}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("admin.delete") || "حذف"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!listingsLoading &&
        filteredListings.length > 0 &&
        totalCount > limit && (
          <Box className="mt-6 flex justify-center">
            <Pagination
              count={Math.ceil(totalCount / limit)}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              color="primary"
              size="large"
              dir={isRTL ? "rtl" : "ltr"}
            />
          </Box>
        )}

      {/* Dialogs */}
      <ListingFormDialog
        open={listingFormOpen}
        onClose={() => {
          setListingFormOpen(false);
          setEditingListing(null);
        }}
        onSubmit={handleSubmitListing}
        editingListing={editingListing}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={t("listing.deleteListing") || "حذف العرض"}
        description={
          t("listing.deleteListingConfirm") || "هل أنت متأكد من حذف هذا العرض؟"
        }
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
