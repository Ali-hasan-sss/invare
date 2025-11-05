"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAdvertisements } from "@/hooks/useAdvertisements";
import type {
  Advertisement,
  CreateAdvertisementData,
  UpdateAdvertisementData,
} from "@/store/slices/advertisementsSlice";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { AdvertisementFormDialog } from "@/components/admin/AdvertisementFormDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import { Toast } from "@/components/ui/Toast";
import { useTranslation } from "@/hooks/useTranslation";
import { Search, Plus, Trash2, Power } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdvertisementsPage() {
  const { t, currentLanguage } = useTranslation();
  const {
    advertisements,
    isLoading,
    error,
    fetchAdvertisements,
    addAdvertisement,
    toggleActive,
    removeAdvertisement,
  } = useAdvertisements();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdvertisement, setSelectedAdvertisement] =
    useState<Advertisement | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const isRTL = currentLanguage.dir === "rtl";

  useEffect(() => {
    fetchAdvertisements(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredAdvertisements = useMemo(() => {
    if (!searchQuery.trim()) return advertisements;
    const query = searchQuery.toLowerCase();
    return advertisements.filter(
      (ad) =>
        ad.listing?.title?.toLowerCase().includes(query) ||
        ad.imageUrl.toLowerCase().includes(query)
    );
  }, [advertisements, searchQuery]);

  const handleAddAdvertisement = () => {
    setSelectedAdvertisement(null);
    setIsFormOpen(true);
  };

  const handleDeleteAdvertisement = (advertisement: Advertisement) => {
    setSelectedAdvertisement(advertisement);
    setIsDeleteDialogOpen(true);
  };

  const handleToggleActive = async (advertisement: Advertisement) => {
    try {
      const result = await toggleActive(advertisement.id);
      if (result.type.endsWith("/rejected")) {
        throw new Error("Toggle failed");
      }
      setToast({
        message: t("admin.advertisementStatusToggled"),
        type: "success",
      });
    } catch (err: any) {
      const errorMessage = err?.message || error || t("admin.error");
      setToast({
        message:
          typeof errorMessage === "string" ? errorMessage : t("admin.error"),
        type: "error",
      });
    }
  };

  const handleSubmitAdvertisement = async (data: any) => {
    try {
      const result = await addAdvertisement(data as CreateAdvertisementData);
      if (result.type.endsWith("/rejected")) {
        throw new Error("Create failed");
      }
      setToast({
        message: t("admin.advertisementCreatedSuccess"),
        type: "success",
      });
      setIsFormOpen(false);
      setSelectedAdvertisement(null);
    } catch (err: any) {
      const errorMessage = err?.message || error || t("admin.error");
      setToast({
        message:
          typeof errorMessage === "string" ? errorMessage : t("admin.error"),
        type: "error",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedAdvertisement) {
      try {
        const result = await removeAdvertisement(selectedAdvertisement.id);
        if (result.type.endsWith("/rejected")) {
          throw new Error("Delete failed");
        }
        setToast({
          message: t("admin.advertisementDeletedSuccess"),
          type: "success",
        });
        setIsDeleteDialogOpen(false);
        setSelectedAdvertisement(null);
      } catch (err: any) {
        const errorMessage = err?.message || error || t("admin.error");
        setToast({
          message:
            typeof errorMessage === "string" ? errorMessage : t("admin.error"),
          type: "error",
        });
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("admin.manageAdvertisements")}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t("admin.advertisements")}
        </p>
      </div>

      {/* Search Bar */}
      <Card className="mb-4 py-5 px-3">
        <div className="relative">
          <Search
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400",
              isRTL ? "left-3" : "right-3"
            )}
          />
          <Input
            type="text"
            placeholder={t("admin.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "h-10 border-0 focus:ring-0 shadow-none",
              isRTL ? "pr-11" : "pl-11"
            )}
          />
        </div>
      </Card>

      {/* Add Button */}
      <div className="mb-4">
        <Button
          onClick={handleAddAdvertisement}
          className="w-full h-10 px-4 !bg-[#2563eb] hover:!bg-[#1d4ed8] dark:!bg-blue-500 dark:hover:!bg-blue-600 font-semibold shadow-md hover:shadow-lg transition-all"
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
            {t("admin.addAdvertisement")}
          </span>
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            {t("admin.loading")}
          </div>
        ) : filteredAdvertisements.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            {t("admin.noAdvertisementsFound")}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("listings.title")}
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.image")}
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("listings.price")}
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.expiresAt")}
                </TableHead>
                <TableHead className="text-center w-28 text-gray-700 dark:text-gray-200">
                  {t("admin.status")}
                </TableHead>
                <TableHead className="text-center w-40 text-gray-700 dark:text-gray-200">
                  {t("admin.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdvertisements.map((advertisement) => (
                <TableRow
                  key={advertisement.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <TableCell className="text-center font-medium text-gray-900 dark:text-white">
                    {advertisement.listing?.title || "N/A"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <img
                        src={advertisement.imageUrl}
                        alt={advertisement.listing?.title}
                        className="h-12 w-20 object-cover rounded bg-gray-100 dark:bg-gray-800"
                        onError={(e) => {
                          e.currentTarget.onerror = null; // Prevent infinite loop
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='48' viewBox='0 0 80 48'%3E%3Crect width='80' height='48' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='10' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-green-600 dark:text-green-400">
                    {advertisement.listing?.startingPrice || "0"}{" "}
                    {t("currency.omr")}
                  </TableCell>
                  <TableCell className="text-center text-gray-900 dark:text-white">
                    {new Date(advertisement.expiresAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Badge
                        variant={advertisement.isActive ? "success" : "error"}
                      >
                        {advertisement.isActive
                          ? t("admin.active")
                          : t("admin.inactive")}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(advertisement)}
                        className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-900/20"
                        title={t("admin.toggleStatus")}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAdvertisement(advertisement)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                        title={t("admin.delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Form Dialog */}
      <AdvertisementFormDialog
        open={isFormOpen}
        advertisement={null}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedAdvertisement(null);
        }}
        onSubmit={handleSubmitAdvertisement}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={t("admin.confirmDelete")}
        description={t("admin.deleteAdvertisementConfirm")}
      />

      {/* Toast Notification */}
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
