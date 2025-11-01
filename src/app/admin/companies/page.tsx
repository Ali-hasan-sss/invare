"use client";

import React, { useEffect, useState } from "react";
import { Edit, Trash2, Plus, Search } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";
import { useCompanies } from "../../../hooks/useCompanies";
import {
  Company,
  CreateCompanyData,
  UpdateCompanyData,
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
import { DeleteConfirmDialog } from "../../../components/admin/DeleteConfirmDialog";
import { Toast } from "../../../components/ui/Toast";
import { cn } from "../../../lib/utils";

export default function CompaniesManagement() {
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage.code === "ar";
  const {
    companies,
    isLoading,
    error,
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    clearError,
  } = useCompanies();

  const [searchQuery, setSearchQuery] = useState("");
  const [companyFormOpen, setCompanyFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    getCompanies();
  }, []);

  useEffect(() => {
    if (error) {
      setToast({ message: error, type: "error" });
      clearError();
    }
  }, [error]);

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setCompanyFormOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setCompanyFormOpen(true);
  };

  const handleDeleteCompany = (company: Company) => {
    setSelectedCompany(company);
    setDeleteDialogOpen(true);
  };

  const handleSubmitCompany = async (
    data: CreateCompanyData | UpdateCompanyData
  ) => {
    try {
      if (selectedCompany) {
        const result = await updateCompany(
          selectedCompany.id,
          data as UpdateCompanyData
        );
        if (result.type.endsWith("/rejected")) {
          throw new Error("Update failed");
        }
        setToast({
          message: t("admin.companyUpdatedSuccess"),
          type: "success",
        });
      } else {
        const result = await createCompany(data as CreateCompanyData);
        if (result.type.endsWith("/rejected")) {
          throw new Error("Create failed");
        }
        setToast({
          message: t("admin.companyCreatedSuccess"),
          type: "success",
        });
      }
      setCompanyFormOpen(false);
      setSelectedCompany(null);
      await getCompanies();
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
        setToast({
          message: t("admin.companyDeletedSuccess"),
          type: "success",
        });
        setDeleteDialogOpen(false);
        setSelectedCompany(null);
        await getCompanies();
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

  const filteredCompanies = companies.filter(
    (company) =>
      company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.vatNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.website?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <Card className="mb-4 p-3">
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
        {isLoading ? (
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
                    <div className="flex justify-center">
                      {getVerificationBadge(company.verificationStatus)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-gray-900 dark:text-white">
                    {company.owner?.email || "-"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditCompany(company)}
                        title={t("admin.edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCompany(company)}
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

      {/* Dialogs */}
      <CompanyFormDialog
        open={companyFormOpen}
        onOpenChange={setCompanyFormOpen}
        company={selectedCompany}
        onSubmit={handleSubmitCompany}
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
