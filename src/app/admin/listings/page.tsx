"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  Calendar,
  DollarSign,
  ShoppingCart,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@mui/material";
import ListingsFilter, {
  ListingsFilterData,
} from "@/components/ui/ListingsFilter";
import { ListingFormDialog } from "@/components/ListingFormDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useAppDispatch } from "@/store/hooks";
import {
  getListings,
  createListing,
  updateListing,
  deleteListing,
  clearError as clearListingError,
  Listing,
  CreateListingData,
  UpdateListingData,
} from "@/store/slices/listingsSlice";

const ITEMS_PER_PAGE = 10;

export default function AdminListingsPage() {
  const { t, currentLanguage } = useTranslation();
  const dispatch = useAppDispatch();
  const { user, company } = useAuth();
  const isRTL = currentLanguage.code === "ar";

  const [filters, setFilters] = useState<ListingsFilterData>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [listingFormOpen, setListingFormOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [suppressPageLoader, setSuppressPageLoader] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [loadedListings, setLoadedListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const fetchListingsPage = useCallback(
    async (targetPage: number, replace = false) => {
      setIsFetchingMore(true);
      try {
        const result = await dispatch(
          getListings({
            page: targetPage,
            limit: ITEMS_PER_PAGE,
            ...filters,
          })
        ).unwrap();

        setLoadedListings((prev) => {
          if (replace) {
            return result;
          }
          const existingIds = new Set(prev.map((l) => l.id));
          const merged = result.filter((l) => !existingIds.has(l.id));
          return [...prev, ...merged];
        });
        setHasMore(result.length === ITEMS_PER_PAGE);
      } catch (error: any) {
        setHasMore(false);
        setToast({
          message: error?.message || t("admin.error"),
          type: "error",
        });
      } finally {
        setIsFetchingMore(false);
      }
    },
    [dispatch, filters]
  );

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setLoadedListings([]);
    fetchListingsPage(1, true);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchListingsPage(nextPage);
  }, [fetchListingsPage, hasMore, isFetchingMore, page]);

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [handleLoadMore, hasMore]);

  useEffect(() => {
    return () => {
      dispatch(clearListingError());
    };
  }, [dispatch]);

  const filteredListings = useMemo(() => {
    if (!normalizedSearch) return loadedListings;
    return loadedListings.filter((listing) => {
      const titleEn = listing.i18n?.en?.title || "";
      const titleAr = listing.i18n?.ar?.title || "";
      const title = listing.title || "";
      const descriptionEn = listing.i18n?.en?.description || "";
      const descriptionAr = listing.i18n?.ar?.description || "";
      const description = listing.description || "";

      return (
        listing.seller?.companyName?.toLowerCase().includes(normalizedSearch) ||
        listing.startingPrice?.toString().includes(normalizedSearch) ||
        title.toLowerCase().includes(normalizedSearch) ||
        titleEn.toLowerCase().includes(normalizedSearch) ||
        titleAr.toLowerCase().includes(normalizedSearch) ||
        description.toLowerCase().includes(normalizedSearch) ||
        descriptionEn.toLowerCase().includes(normalizedSearch) ||
        descriptionAr.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [loadedListings, normalizedSearch]);

  const getStatusText = (status: string) => {
    switch ((status || "").toLowerCase()) {
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

  const getUnitOfMeasureText = (unit: string | undefined) => {
    if (!unit) return "";
    const unitLower = unit.toLowerCase();
    const translated = t(`common.unitOfMeasures.${unitLower}`);
    return translated && translated !== `common.unitOfMeasures.${unitLower}`
      ? translated
      : unit;
  };

  const handleFilterChange = (newFilters: ListingsFilterData) => {
    setFilters(newFilters);
  };

  const listingBasePayload = (data: CreateListingData) => {
    return {
      ...data,
      ...(company?.id ? { sellerCompanyId: company.id } : {}),
      ...(user?.id && !company?.id ? { sellerUserId: user.id } : {}),
    };
  };

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
    const successUpdateMessage =
      t("successMessages.listingUpdated") ||
      t("listing.listingUpdatedSuccess") ||
      t("notifications.updateSuccess") ||
      t("admin.success");
    const errorUpdateMessage = t("errors.updateListing") || t("admin.error");

    try {
      setSuppressPageLoader(true);
      const payload = listingBasePayload(data);

      if (editingListing) {
        const result = await dispatch(
          updateListing({
            id: editingListing.id,
            data: payload as UpdateListingData,
          })
        ).unwrap();
        setLoadedListings((prev) =>
          prev.map((l) => (l.id === result.id ? result : l))
        );
        setToast({ message: successUpdateMessage, type: "success" });
      } else {
        const created = await dispatch(createListing(payload)).unwrap();
        setLoadedListings((prev) => [created, ...prev]);
        setToast({
          message:
            t("listing.listingCreatedSuccess") ||
            t("notifications.createSuccess") ||
            t("admin.success"),
          type: "success",
        });
      }
      setListingFormOpen(false);
      setEditingListing(null);
    } catch (err: any) {
      setToast({
        message: err?.message || errorUpdateMessage,
        type: "error",
      });
    } finally {
      setSuppressPageLoader(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingListing) return;
    try {
      setSuppressPageLoader(true);
      await dispatch(deleteListing(deletingListing.id)).unwrap();
      setLoadedListings((prev) =>
        prev.filter((listing) => listing.id !== deletingListing.id)
      );
      setToast({
        message:
          t("listing.listingDeletedSuccess") ||
          t("notifications.deleteSuccess") ||
          t("admin.success"),
        type: "success",
      });
      setDeleteDialogOpen(false);
      setDeletingListing(null);
    } catch (err: any) {
      setToast({ message: err?.message || t("admin.error"), type: "error" });
    } finally {
      setSuppressPageLoader(false);
    }
  };

  const handleToggleListingStatus = async (listing: Listing) => {
    if (!listing) return;
    const nextStatus = listing.status === "active" ? "draft" : "active";
    setStatusUpdatingId(listing.id);
    setSuppressPageLoader(true);
    const successToggleMessage =
      t("successMessages.listingUpdated") ||
      t("listing.listingUpdatedSuccess") ||
      t("notifications.updateSuccess") ||
      t("admin.success");
    const errorToggleMessage = t("errors.updateListing") || t("admin.error");
    try {
      const updated = await dispatch(
        updateListing({
          id: listing.id,
          data: { status: nextStatus },
        })
      ).unwrap();
      setLoadedListings((prev) =>
        prev.map((l) => (l.id === updated.id ? updated : l))
      );
      setToast({ message: successToggleMessage, type: "success" });
    } catch (err: any) {
      setToast({
        message: err?.message || errorToggleMessage,
        type: "error",
      });
    } finally {
      setStatusUpdatingId(null);
      setSuppressPageLoader(false);
    }
  };

  const isInitialLoading =
    isFetchingMore && page === 1 && loadedListings.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("listings.allListings")}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {t("admin.manageAllListings") || t("listings.title")}
          </p>
        </div>
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
          <Plus className={cn("h-5 w-5", isRTL ? "ml-2" : "mr-2")} />
          <span style={{ color: "white", fontWeight: 600 }}>
            {t("listing.addListing") || "Add Listing"}
          </span>
        </Button>
      </div>

      <Button
        variant="secondary"
        onClick={() => setShowFilters((prev) => !prev)}
        className="flex items-center gap-2 w-full md:w-auto"
      >
        <Filter className="h-4 w-4" />
        {showFilters
          ? t("filters.hideFilters") || t("common.hide")
          : t("filters.showFilters") || t("common.show")}
      </Button>

      {showFilters && (
        <ListingsFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          className="bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700"
        />
      )}

      <Card className="py-3 px-4">
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

      {isInitialLoading && !suppressPageLoader ? (
        <Card className="p-8 text-center text-gray-600 dark:text-gray-400">
          {t("admin.loading")}
        </Card>
      ) : filteredListings.length === 0 ? (
        <Card className="p-8 text-center text-gray-600 dark:text-gray-400">
          {t("listings.noListings")}
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredListings.map((listing) => (
              <Card
                key={listing.id}
                className="hover:shadow-lg transition-shadow duration-200"
              >
                <CardContent className="p-4">
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

                  <CardTitle className="text-lg font-semibold mb-2 text-gray-900 dark:text-white line-clamp-2">
                    {listing.i18n?.[currentLanguage.code]?.title ||
                      listing.title ||
                      "N/A"}
                  </CardTitle>

                  {listing.i18n?.[currentLanguage.code]?.description ||
                  listing.description ? (
                    <CardDescription className="mb-2 text-gray-600 dark:text-gray-400 line-clamp-2">
                      {listing.i18n?.[currentLanguage.code]?.description ||
                        listing.description}
                    </CardDescription>
                  ) : null}

                  {listing.seller?.companyName && (
                    <CardDescription className="mb-3 text-gray-600 dark:text-gray-400">
                      <ShoppingCart className="h-4 w-4 inline mr-1" />
                      {listing.seller.companyName}
                    </CardDescription>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("listings.price")}
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        <DollarSign className="h-4 w-4 inline" />
                        {listing.startingPrice} {t("currency.omr")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t("listings.quantity")}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {listing.stockAmount}{" "}
                        {getUnitOfMeasureText(
                          listing.material?.unitOfMeasure ||
                            listing.unitOfMeasure
                        )}
                      </span>
                    </div>

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

                  <div
                    className="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-700 mb-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t("listings.statusLabel") || t("admin.status")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getStatusText(listing.status)}
                      </span>
                      <Switch
                        size="small"
                        color="primary"
                        checked={listing.status === "active"}
                        disabled={
                          statusUpdatingId === listing.id ||
                          (listing.status !== "active" &&
                            listing.status !== "draft")
                        }
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleListingStatus(listing);
                        }}
                      />
                    </div>
                  </div>

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

          <div
            ref={loadMoreRef}
            className="py-4 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            {isFetchingMore && hasMore
              ? t("admin.loading")
              : hasMore
              ? t("admin.scrollToLoadMore") || "استمر بالنزول لتحميل المزيد"
              : t("admin.noMoreUsers") || "لا توجد بيانات إضافية"}
          </div>
        </>
      )}

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
        title={t("listing.deleteListing") || "Delete Listing"}
        description={t("listing.deleteListingConfirm")}
        isLoading={isFetchingMore}
      />

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
