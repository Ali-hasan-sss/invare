"use client";

import React, { useEffect, useState } from "react";
import { Edit, Trash2, Plus, Search, Globe } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  getCountries,
  createCountry,
  updateCountry,
  deleteCountry,
  clearError,
  Country,
  CreateCountryData,
  UpdateCountryData,
} from "../../../store/slices/countriesSlice";
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
import { CountryFormDialog } from "../../../components/admin/CountryFormDialog";
import { DeleteConfirmDialog } from "../../../components/admin/DeleteConfirmDialog";
import { Toast } from "../../../components/ui/Toast";

export default function CountriesManagement() {
  const { t, currentLanguage } = useTranslation();
  const dispatch = useAppDispatch();
  const isRTL = currentLanguage.code === "ar";
  const { countries, isLoading, error } = useAppSelector(
    (state) => state.countries
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [countryFormOpen, setCountryFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    dispatch(getCountries());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      setToast({ message: error, type: "error" });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAddCountry = () => {
    setSelectedCountry(null);
    setCountryFormOpen(true);
  };

  const handleEditCountry = (country: Country) => {
    setSelectedCountry(country);
    setCountryFormOpen(true);
  };

  const handleDeleteCountry = (country: Country) => {
    setSelectedCountry(country);
    setDeleteDialogOpen(true);
  };

  const handleSubmitCountry = async (
    data: CreateCountryData | UpdateCountryData
  ) => {
    try {
      if (selectedCountry) {
        await dispatch(
          updateCountry({
            id: selectedCountry.id,
            data: data as UpdateCountryData,
          })
        ).unwrap();
        setToast({
          message: t("admin.countryUpdatedSuccess"),
          type: "success",
        });
      } else {
        await dispatch(createCountry(data as CreateCountryData)).unwrap();
        setToast({
          message: t("admin.countryCreatedSuccess"),
          type: "success",
        });
      }
      setCountryFormOpen(false);
      dispatch(getCountries());
    } catch (err) {
      setToast({ message: t("admin.error"), type: "error" });
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedCountry) {
      try {
        await dispatch(deleteCountry(selectedCountry.id)).unwrap();
        setToast({
          message: t("admin.countryDeletedSuccess"),
          type: "success",
        });
        setDeleteDialogOpen(false);
        dispatch(getCountries());
      } catch (err) {
        setToast({ message: t("admin.error"), type: "error" });
      }
    }
  };

  const filteredCountries = countries.filter(
    (country) =>
      country.countryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.countryCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Globe className="h-8 w-8 text-blue-600" />
          {t("admin.countriesManagement")}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t("admin.countries")}
        </p>
      </div>

      {/* Search */}
      <Card className="p-4 mb-4">
        <div className="relative">
          <Search
            className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 ${
              isRTL ? "left-3" : "right-3"
            }`}
          />
          <Input
            type="text"
            placeholder={t("admin.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={isRTL ? "pl-10" : "pr-10"}
          />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="mb-4 flex items-center justify-end">
        <Button
          onClick={handleAddCountry}
          className="!bg-[#2563eb] hover:!bg-[#1d4ed8] dark:!bg-blue-500 dark:hover:!bg-blue-600 font-semibold shadow-md hover:shadow-lg transition-all"
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
          <Plus className="h-5 w-5 mr-2" style={{ color: "white" }} />
          <span style={{ color: "white", fontWeight: 600 }}>
            {t("admin.addCountry")}
          </span>
        </Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            {t("admin.loading")}
          </div>
        ) : filteredCountries.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400">
            {t("admin.noCountries")}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center w-32 text-gray-700 dark:text-gray-200">
                  {t("admin.countryCode")}
                </TableHead>
                <TableHead className="text-center text-gray-700 dark:text-gray-200">
                  {t("admin.countryName")}
                </TableHead>
                <TableHead className="text-center w-32 text-gray-700 dark:text-gray-200">
                  {t("admin.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCountries.map((country) => (
                <TableRow
                  key={country.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <Badge variant="info">{country.countryCode}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium text-gray-900 dark:text-white">
                    {country.countryName}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEditCountry(country)}
                        title={t("admin.edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCountry(country)}
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
      <CountryFormDialog
        open={countryFormOpen}
        onOpenChange={setCountryFormOpen}
        country={selectedCountry}
        onSubmit={handleSubmitCountry}
        isLoading={isLoading}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title={t("admin.deleteCountry")}
        description={t("admin.deleteCountryConfirm")}
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
