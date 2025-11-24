"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Edit, Trash2, Plus, Search, Heart, MoreVertical } from "lucide-react";
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useTranslation } from "../../../hooks/useTranslation";
import { useCompanies } from "../../../hooks/useCompanies";
import { useMaterials } from "../../../hooks/useMaterials";
import {
  Company,
  UpdateCompanyData,
  CreateCompanyWithUserData,
} from "../../../store/slices/companiesSlice";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/Table";
import { CompanyFormDialog } from "../../../components/admin/CompanyFormDialog";
import { CreateCompanyWithUserDialog } from "../../../components/admin/CreateCompanyWithUserDialog";
import { DeleteConfirmDialog } from "../../../components/admin/DeleteConfirmDialog";
import { UserFavoritesDialog } from "../../../components/admin/UserFavoritesDialog";
import { Toast } from "../../../components/ui/Toast";
import { cn } from "../../../lib/utils";
import { getCountryFlag, getCountryName } from "../../../lib/countryUtils";

export default function CompaniesManagement() {
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage.code === "ar";
  const {
    isLoading,
    error,
    getCompanies,
    createCompanyWithUser,
    updateCompany,
    deleteCompany,
    clearError,
  } = useCompanies();
  const { addUserFavoriteMaterials } = useMaterials();

  const [searchQuery, setSearchQuery] = useState("");
  const [editCompanyFormOpen, setEditCompanyFormOpen] = useState(false);
  const [createCompanyDialogOpen, setCreateCompanyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [favoritesDialogOpen, setFavoritesDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<{
    [key: string]: HTMLElement | null;
  }>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loadedCompanies, setLoadedCompanies] = useState<Company[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const ITEMS_PER_PAGE = 10;
  const normalizedSearch = debouncedSearch.toLowerCase();
  const addCompanyToState = useCallback((company: Company) => {
    setLoadedCompanies((prev) => {
      const existingIndex = prev.findIndex((c) => c.id === company.id);
      if (existingIndex !== -1) {
        const clone = [...prev];
        clone[existingIndex] = company;
        return clone;
      }
      return [company, ...prev];
    });
  }, []);

  const updateCompanyInState = useCallback((company: Company) => {
    setLoadedCompanies((prev) =>
      prev.map((c) => (c.id === company.id ? company : c))
    );
  }, []);

  const removeCompanyFromState = useCallback((id: string) => {
    setLoadedCompanies((prev) => prev.filter((c) => c.id !== id));
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchCompaniesPage = useCallback(
    async (targetPage: number, replace = false) => {
      setIsFetchingMore(true);
      const result = await getCompanies({
        page: targetPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
      });
      if (result.type.endsWith("/fulfilled")) {
        const data = (result.payload as Company[]) || [];
        setLoadedCompanies((prev) => {
          if (replace) {
            return data;
          }
          const existingIds = new Set(prev.map((c) => c.id));
          const merged = data.filter((c) => !existingIds.has(c.id));
          return [...prev, ...merged];
        });
        setHasMore(data.length === ITEMS_PER_PAGE);
      } else {
        setHasMore(false);
      }
      setIsFetchingMore(false);
    },
    [getCompanies, debouncedSearch]
  );

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchCompaniesPage(1, true);
  }, [fetchCompaniesPage]);

  const handleLoadMore = useCallback(() => {
    if (isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCompaniesPage(nextPage);
  }, [isFetchingMore, hasMore, page, fetchCompaniesPage]);

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

    return () => {
      observer.disconnect();
    };
  }, [handleLoadMore, hasMore]);

  useEffect(() => {
    if (error) {
      setToast({ message: error, type: "error" });
      clearError();
    }
  }, [error]);

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setCreateCompanyDialogOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setEditCompanyFormOpen(true);
    handleMenuClose(company.id);
  };

  const handleDeleteCompany = (company: Company) => {
    setSelectedCompany(company);
    setDeleteDialogOpen(true);
    handleMenuClose(company.id);
  };

  const handleManageOwnerFavorites = (company: Company) => {
    if (company.owner?.id) {
      setSelectedOwnerId(company.owner.id);
      setFavoritesDialogOpen(true);
    }
    handleMenuClose(company.id);
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    companyId: string
  ) => {
    setMenuAnchor({ ...menuAnchor, [companyId]: event.currentTarget });
  };

  const handleMenuClose = (companyId: string) => {
    setMenuAnchor({ ...menuAnchor, [companyId]: null });
  };

  const handleSubmitCompany = async (data: UpdateCompanyData) => {
    try {
      if (!selectedCompany) return;
      const result = await updateCompany(selectedCompany.id, data);
      if (result.type.endsWith("/rejected")) {
        throw new Error("Update failed");
      }
      const updatedCompany = result.payload as Company;
      if (updatedCompany) {
        updateCompanyInState(updatedCompany);
      }
      setToast({
        message: t("admin.companyUpdatedSuccess"),
        type: "success",
      });
      setEditCompanyFormOpen(false);
      setSelectedCompany(null);
    } catch (err: any) {
      const errorMessage = err?.message || error || t("admin.error");
      setToast({
        message:
          typeof errorMessage === "string" ? errorMessage : t("admin.error"),
        type: "error",
      });
    }
  };

  const handleSubmitCreateCompany = async (
    data: CreateCompanyWithUserData,
    materialIds?: string[]
  ) => {
    try {
      const result = await createCompanyWithUser(data);
      if (result.type.endsWith("/rejected")) {
        throw new Error("Create failed");
      }
      const createdCompany = result.payload as Company;
      if (createdCompany) {
        addCompanyToState(createdCompany);
      }

      if (materialIds && materialIds.length > 0 && createdCompany?.owner?.id) {
        try {
          const favResult = await addUserFavoriteMaterials({
            userId: createdCompany.owner.id,
            materialIds,
          });
          if (favResult.type.endsWith("/fulfilled")) {
            setToast({
              message:
                t("admin.companyCreatedSuccess") +
                ". " +
                (t("admin.favoriteMaterialsAddedSuccess") ||
                  "تمت إضافة الاهتمامات بنجاح"),
              type: "success",
            });
          } else {
            setToast({
              message:
                t("admin.companyCreatedSuccess") +
                ". " +
                (t("admin.error") || "حدث خطأ في إضافة الاهتمامات"),
              type: "error",
            });
          }
        } catch (favError) {
          console.error("Failed to add favorites:", favError);
          setToast({
            message:
              t("admin.companyCreatedSuccess") +
              ". " +
              (t("admin.error") || "حدث خطأ في إضافة الاهتمامات"),
            type: "error",
          });
        }
      } else {
        setToast({
          message: t("admin.companyCreatedSuccess"),
          type: "success",
        });
      }
      setCreateCompanyDialogOpen(false);
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
    if (selectedCompany) {
      try {
        const result = await deleteCompany(selectedCompany.id);
        if (result.type.endsWith("/rejected")) {
          throw new Error("Delete failed");
        }
        removeCompanyFromState(selectedCompany.id);
        setToast({
          message: t("admin.companyDeletedSuccess"),
          type: "success",
        });
        setDeleteDialogOpen(false);
        setSelectedCompany(null);
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

  const filteredCompanies = loadedCompanies.filter((company) => {
    if (!normalizedSearch) return true;
    return (
      company.companyName?.toLowerCase().includes(normalizedSearch) ||
      company.vatNumber?.toLowerCase().includes(normalizedSearch) ||
      company.website?.toLowerCase().includes(normalizedSearch) ||
      company.owner?.email?.toLowerCase().includes(normalizedSearch)
    );
  });

  const getVerificationBadge = (status?: string) => {
    switch (status) {
      case "verified":
        return <Badge variant="success">{t("admin.verified")}</Badge>;
      case "pending":
        return <Badge variant="warning">{t("admin.pending")}</Badge>;
      case "rejected":
        return <Badge variant="error">{t("admin.rejected")}</Badge>;
      case "unverified":
        return <Badge variant="default">{t("admin.unverified")}</Badge>;
      default:
        return <Badge>{status || "-"}</Badge>;
    }
  };

  const showInitialLoader = isLoading && loadedCompanies.length === 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("admin.companiesManagement")}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t("admin.companies")}
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

      {/* Add Button */}
      <div className="mb-4">
        <Button
          onClick={handleAddCompany}
          className="w-full h-10 px-4 !bg-[#2563eb] hover:!bg-[#1d4ed8] dark:!bg-blue-500 dark:hover:!bg-blue-600 font-semibold shadow-md hover:shadow-lg transition-all"
          sx={{
            color: "white !important",
            backgroundColor: "#2563eb !important",
            "&:hover": {
              color: "white !important",
              backgroundColor: "#1d4ed8 !important",
            },
            "&.dark": {
              backgroundColor: "#3b82f6 !important",
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
            {t("admin.addCompany")}
          </span>
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {showInitialLoader ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            {t("admin.loading")}
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            {t("admin.noCompanies")}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.companyName")}
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.vatNumber")}
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.website")}
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.country") || t("common.country")}
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.verificationStatus")}
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.owner")}
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow
                  key={company.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <TableCell className="text-center font-medium text-gray-900 dark:text-white">
                    {company.companyName}
                  </TableCell>
                  <TableCell className="text-center text-gray-900 dark:text-white">
                    {company.vatNumber || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {company.website}
                      </a>
                    ) : (
                      <span className="text-gray-900 dark:text-white">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {company.country?.countryCode ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">
                          {getCountryFlag(company.country.countryCode)}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          {getCountryName(
                            company.country.countryCode,
                            currentLanguage.code as "ar" | "en"
                          ) ||
                            company.country.countryName ||
                            "-"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">
                        -
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      {getVerificationBadge(company.verificationStatus)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-gray-900 dark:text-white">
                    {company.owner?.email || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, company.id)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[company.id]}
                        open={Boolean(menuAnchor[company.id])}
                        onClose={() => handleMenuClose(company.id)}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: isRTL ? "left" : "right",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: isRTL ? "left" : "right",
                        }}
                        slotProps={{
                          paper: {
                            className: "bg-white dark:bg-gray-800",
                          },
                        }}
                      >
                        <MenuItem
                          onClick={() => {
                            handleEditCompany(company);
                            handleMenuClose(company.id);
                          }}
                          className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <ListItemIcon>
                            <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          </ListItemIcon>
                          <ListItemText>{t("admin.edit")}</ListItemText>
                        </MenuItem>
                        {company.owner?.id && (
                          <MenuItem
                            onClick={() => {
                              handleManageOwnerFavorites(company);
                              handleMenuClose(company.id);
                            }}
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <ListItemIcon>
                              <Heart className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </ListItemIcon>
                            <ListItemText>
                              {t("admin.manageFavorites") || "إدارة الاهتمامات"}
                            </ListItemText>
                          </MenuItem>
                        )}
                        <MenuItem
                          onClick={() => {
                            handleDeleteCompany(company);
                            handleMenuClose(company.id);
                          }}
                          className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <ListItemIcon>
                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </ListItemIcon>
                          <ListItemText className="text-red-600 dark:text-red-400">
                            {t("admin.delete")}
                          </ListItemText>
                        </MenuItem>
                      </Menu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!showInitialLoader && (
          <div
            ref={loadMoreRef}
            className="py-4 text-center text-sm text-gray-500 dark:text-gray-400"
          >
            {isFetchingMore && hasMore
              ? t("admin.loading")
              : hasMore
              ? t("admin.scrollToLoadMore") || "استمر بالنزول لتحميل المزيد"
              : !hasMore
              ? t("admin.noMoreUsers") || "لا توجد بيانات إضافية"
              : null}
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <CompanyFormDialog
        open={editCompanyFormOpen}
        onOpenChange={setEditCompanyFormOpen}
        company={selectedCompany}
        onSubmit={handleSubmitCompany}
        isLoading={isLoading}
      />

      <CreateCompanyWithUserDialog
        open={createCompanyDialogOpen}
        onOpenChange={setCreateCompanyDialogOpen}
        onSubmit={handleSubmitCreateCompany}
        isLoading={isLoading}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={t("admin.deleteCompany")}
        description={t("admin.deleteCompanyConfirm")}
        isLoading={isLoading}
      />

      <UserFavoritesDialog
        open={favoritesDialogOpen}
        onOpenChange={(open) => {
          setFavoritesDialogOpen(open);
          if (!open) {
            setSelectedOwnerId(null);
          }
        }}
        userId={selectedOwnerId}
        companyName={selectedCompany?.companyName}
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
