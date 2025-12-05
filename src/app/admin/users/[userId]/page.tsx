"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Star,
  Trash2,
  Edit,
  ShoppingCart,
  Calendar,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useUsers } from "@/hooks/useUsers";
import { useMaterials } from "@/hooks/useMaterials";
import { useAppDispatch } from "@/store/hooks";
import {
  getListings,
  updateListing,
  deleteListing,
  createListing,
  Listing,
  CreateListingData,
  UpdateListingData,
} from "@/store/slices/listingsSlice";
import { User, UpdateUserData } from "@/store/slices/usersSlice";
import { Material } from "@/store/slices/materialsSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toast } from "@/components/ui/Toast";
import { ListingFormDialog } from "@/components/ListingFormDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { UserFavoritesDialog } from "@/components/admin/UserFavoritesDialog";
import { Switch } from "@mui/material";
import { cn } from "@/lib/utils";
import { UserFormDialog } from "@/components/admin/UserFormDialog";

const ITEMS_PER_PAGE = 10;

const normalizeFavoritesResponse = (
  favorites: any[]
): { materials: Material[]; map: Map<string, string> } => {
  const favoriteMap = new Map<string, string>();
  const materials: Material[] = [];

  favorites?.forEach((fav: any) => {
    if (fav?.material && fav.id) {
      materials.push(fav.material);
      favoriteMap.set(fav.material.id, fav.id);
    } else if (fav?.favoriteId && fav?.material) {
      materials.push(fav.material);
      favoriteMap.set(fav.material.id, fav.favoriteId);
    } else if (fav?.id) {
      materials.push(fav);
      favoriteMap.set(fav.id, fav.id);
    }
  });

  return { materials, map: favoriteMap };
};

export default function AdminUserDetailsPage() {
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage.code === "ar";
  const params = useParams();
  const router = useRouter();
  const userId = params?.userId as string;
  const dispatch = useAppDispatch();
  const {
    getUserById,
    updateUser: updateUserAction,
    deleteUser: deleteUserAction,
    clearError,
    isLoading: usersLoading,
  } = useUsers();
  const { getUserFavoriteMaterials, deleteUserFavoriteMaterial } =
    useMaterials();

  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [favorites, setFavorites] = useState<Material[]>([]);
  const [favoriteIdMap, setFavoriteIdMap] = useState<Map<string, string>>(
    new Map()
  );
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesDialogOpen, setFavoritesDialogOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [deleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);

  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [listingFormOpen, setListingFormOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [suppressListingsLoader, setSuppressListingsLoader] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      setIsLoadingUser(true);
      try {
        const result = await getUserById(userId);
        if (result.type.endsWith("/fulfilled")) {
          setUser(result.payload as User);
        }
      } catch (error: any) {
        setToast({
          message: error?.message || t("admin.error"),
          type: "error",
        });
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, [userId, getUserById]);

  const fetchFavorites = useCallback(async () => {
    if (!userId) return;
    setFavoritesLoading(true);
    try {
      const result = await getUserFavoriteMaterials({
        userId,
        lang: currentLanguage.code,
      });
      if (result.type.endsWith("/fulfilled")) {
        const payload = (result.payload as any[]) || [];
        const { materials, map } = normalizeFavoritesResponse(payload);
        setFavorites(materials);
        setFavoriteIdMap(map);
      }
    } catch (error: any) {
      setToast({
        message: error?.message || t("admin.error"),
        type: "error",
      });
    } finally {
      setFavoritesLoading(false);
    }
  }, [userId, getUserFavoriteMaterials, currentLanguage.code]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleDeleteFavorite = async (materialId: string) => {
    if (!userId) return;
    const favoriteId = favoriteIdMap.get(materialId) || materialId;
    try {
      await deleteUserFavoriteMaterial({
        userId,
        favoriteId,
      });
      await fetchFavorites();
      setToast({
        message: t("notifications.deleteSuccess") || t("admin.removeFavorite"),
        type: "success",
      });
    } catch (error: any) {
      setToast({
        message: error?.message || t("admin.error"),
        type: "error",
      });
    }
  };

  const fetchListingsPage = useCallback(
    async (targetPage: number, replace = false) => {
      if (!userId) return;
      setIsFetchingMore(true);
      try {
        const data = await dispatch(
          getListings({
            page: targetPage,
            limit: ITEMS_PER_PAGE,
            userId,
          })
        ).unwrap();

        setUserListings((prev) => {
          if (replace) {
            return data;
          }
          const existingIds = new Set(prev.map((listing) => listing.id));
          const merged = data.filter((listing) => !existingIds.has(listing.id));
          return [...prev, ...merged];
        });
        setHasMore(data.length === ITEMS_PER_PAGE);
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
    [dispatch, userId]
  );

  useEffect(() => {
    if (!userId) return;
    setPage(1);
    setHasMore(true);
    setUserListings([]);
    fetchListingsPage(1, true);
  }, [userId, fetchListingsPage]);

  const handleLoadMore = useCallback(() => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchListingsPage(nextPage);
  }, [isFetchingMore, hasMore, page, fetchListingsPage]);

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

  const handleBack = () => {
    router.push("/admin/users");
  };

  const handleOpenFavoritesDialog = () => {
    setFavoritesDialogOpen(true);
  };

  const handleCloseFavoritesDialog = (open: boolean) => {
    setFavoritesDialogOpen(open);
    if (!open) {
      fetchFavorites();
    }
  };

  const handleEditListing = (listing: Listing) => {
    setEditingListing(listing);
    setListingFormOpen(true);
  };

  const handleEditUser = () => {
    setUserFormOpen(true);
  };

  const handleDeleteUserRequest = () => {
    setDeleteUserDialogOpen(true);
  };

  const handleAddListing = () => {
    setEditingListing(null);
    setListingFormOpen(true);
  };

  const listingBasePayload = (data: CreateListingData) => {
    return {
      ...data,
      sellerUserId: userId,
    };
  };

  const handleSubmitListing = async (data: CreateListingData) => {
    if (!userId) return;
    const successMessage =
      t("successMessages.listingUpdated") ||
      t("listing.listingUpdatedSuccess") ||
      t("notifications.updateSuccess") ||
      t("admin.success");
    try {
      setSuppressListingsLoader(true);
      const payload = listingBasePayload(data);
      if (editingListing) {
        const result = await dispatch(
          updateListing({
            id: editingListing.id,
            data: payload as UpdateListingData,
          })
        ).unwrap();
        setUserListings((prev) =>
          prev.map((listing) => (listing.id === result.id ? result : listing))
        );
      } else {
        const created = await dispatch(createListing(payload)).unwrap();
        setUserListings((prev) => [created, ...prev]);
      }
      setListingFormOpen(false);
      setEditingListing(null);
      setToast({ message: successMessage, type: "success" });
    } catch (error: any) {
      setToast({
        message: error?.message || t("admin.error"),
        type: "error",
      });
    } finally {
      setSuppressListingsLoader(false);
    }
  };

  const handleSubmitUser = async (
    data: UpdateUserData,
    materialIds?: string[]
  ) => {
    if (!user) return;
    try {
      const result = await updateUserAction(user.id, data);
      if (result.type.endsWith("/rejected")) {
        throw new Error("Update failed");
      }
      const updatedUser = result.payload as User;
      setUser(updatedUser);
      setToast({ message: t("admin.userUpdatedSuccess"), type: "success" });
      setUserFormOpen(false);
    } catch (error: any) {
      setToast({
        message: error?.message || t("admin.error"),
        type: "error",
      });
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!user) return;
    try {
      const result = await deleteUserAction(user.id);
      if (result.type.endsWith("/rejected")) {
        throw new Error("Delete failed");
      }
      setToast({ message: t("admin.userDeletedSuccess"), type: "success" });
      setDeleteUserDialogOpen(false);
      router.push("/admin/users");
    } catch (error: any) {
      setToast({
        message: error?.message || t("admin.error"),
        type: "error",
      });
    }
  };

  const handleRequestDeleteListing = (listing: Listing) => {
    setListingToDelete(listing);
  };

  const handleConfirmDeleteListing = async () => {
    if (!listingToDelete) return;
    try {
      await dispatch(deleteListing(listingToDelete.id)).unwrap();
      setUserListings((prev) =>
        prev.filter((listing) => listing.id !== listingToDelete.id)
      );
      setToast({
        message:
          t("listing.listingDeletedSuccess") ||
          t("notifications.deleteSuccess") ||
          t("admin.success"),
        type: "success",
      });
      setListingToDelete(null);
    } catch (error: any) {
      setToast({
        message: error?.message || t("admin.error"),
        type: "error",
      });
    }
  };

  const handleToggleListingStatus = async (listing: Listing) => {
    const nextStatus = listing.status === "active" ? "draft" : "active";
    setStatusUpdatingId(listing.id);
    setSuppressListingsLoader(true);
    const successToggleMessage =
      t("successMessages.listingUpdated") ||
      t("listing.listingUpdatedSuccess") ||
      t("notifications.updateSuccess") ||
      t("admin.success");
    try {
      const updated = await dispatch(
        updateListing({
          id: listing.id,
          data: { status: nextStatus },
        })
      ).unwrap();
      setUserListings((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setToast({ message: successToggleMessage, type: "success" });
    } catch (error: any) {
      setToast({
        message: error?.message || t("admin.error"),
        type: "error",
      });
    } finally {
      setStatusUpdatingId(null);
      setSuppressListingsLoader(false);
    }
  };

  const isInitialListingsLoading =
    isFetchingMore && page === 1 && userListings.length === 0;

  const userName = useMemo(() => {
    if (!user) return "";
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user.email;
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("admin.userDetails")}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {userName || t("admin.userInfo")}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleBack}>
            {isRTL ? (
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            ) : (
              <ArrowLeft className="h-4 w-4 mr-2" />
            )}
            {t("admin.backToUsers")}
          </Button>
          <Button onClick={handleAddListing} className="bg-blue-600 text-white">
            <Edit className="h-4 w-4 mr-2" />
            {t("listing.addListing") || "Add Listing"}
          </Button>
          <Button variant="secondary" onClick={handleOpenFavoritesDialog}>
            <Star className="h-4 w-4 mr-2 text-yellow-500" />
            {t("admin.manageFavorites")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-blue-500" />
            {t("admin.userInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingUser ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("admin.loading")}
            </div>
          ) : user ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("admin.firstName")} / {t("admin.lastName")}
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {user.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span
                  className="font-mono text-gray-900 dark:text-white"
                  dir="ltr"
                >
                  {user.phone || "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900 dark:text-white">
                  {(user.country as any)?.name || user.countryId || "-"}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("admin.accountStatus")}
                </p>
                <Badge variant="success">
                  {user.accountStatus || "active"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("admin.subscriptionTier")}
                </p>
                <Badge variant="info">{user.subscriptionTier || "free"}</Badge>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              {t("admin.error")}
            </p>
          )}
        </CardContent>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <Button
              className="flex-1"
              onClick={handleEditUser}
              disabled={isLoadingUser || !user}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t("admin.editUser")}
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteUserRequest}
              disabled={isLoadingUser || !user}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("admin.deleteUser")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              {t("admin.userFavorites") || t("admin.manageFavorites")}
            </CardTitle>
          </div>
          <Button variant="secondary" onClick={handleOpenFavoritesDialog}>
            <Star className="h-4 w-4 mr-2 text-yellow-500" />
            {t("admin.manageFavorites")}
          </Button>
        </CardHeader>
        <CardContent>
          {favoritesLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("admin.loading")}
            </div>
          ) : favorites.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              {t("admin.noFavorites")}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {favorites.map((material) => (
                <div
                  key={material.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col gap-2 bg-gray-50 dark:bg-gray-900/40"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {material.i18n?.[currentLanguage.code]?.name ||
                        material.name}
                    </p>
                    {material.category?.name && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {material.category.name}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    className="self-start text-red-500 hover:text-red-600"
                    onClick={() => handleDeleteFavorite(material.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t("admin.removeFavorite")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-green-500" />
            {t("admin.userListings")}
          </CardTitle>
          <CardDescription>
            {t("listings.foundResults").replace(
              "{count}",
              userListings.length.toString()
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isInitialListingsLoading && !suppressListingsLoader ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              {t("admin.loading")}
            </div>
          ) : userListings.length === 0 ? (
            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              {t("admin.noUserListings")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userListings.map((listing) => (
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
                          <ShoppingCart className="h-12 w-12 text-gray-400" />
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

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {t("listings.price")}
                        </span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
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
                        onClick={() => handleRequestDeleteListing(listing)}
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
        </CardContent>
      </Card>

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

      <ListingFormDialog
        open={listingFormOpen}
        onClose={() => {
          setListingFormOpen(false);
          setEditingListing(null);
        }}
        onSubmit={handleSubmitListing}
        editingListing={editingListing}
      />

      <UserFormDialog
        open={userFormOpen}
        onOpenChange={setUserFormOpen}
        user={user}
        onSubmit={handleSubmitUser}
        isLoading={usersLoading}
      />

      <DeleteConfirmDialog
        open={Boolean(listingToDelete)}
        onOpenChange={(open) => {
          if (!open) setListingToDelete(null);
        }}
        onConfirm={handleConfirmDeleteListing}
        title={t("listing.deleteListing") || "Delete Listing"}
        description={t("listing.deleteListingConfirm")}
        isLoading={isFetchingMore}
      />

      <DeleteConfirmDialog
        open={deleteUserDialogOpen}
        onOpenChange={setDeleteUserDialogOpen}
        onConfirm={handleConfirmDeleteUser}
        title={t("admin.deleteUser")}
        description={t("admin.deleteUserConfirm")}
        isLoading={usersLoading}
      />

      <UserFavoritesDialog
        open={favoritesDialogOpen}
        onOpenChange={handleCloseFavoritesDialog}
        user={user}
        userId={userId}
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
