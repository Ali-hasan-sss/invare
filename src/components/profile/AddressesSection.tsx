"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useUserAddresses } from "@/hooks/useUserAddresses";
import { useCompanyAddresses } from "@/hooks/useCompanyAddresses";
import { Button } from "@/components/ui/Button";
import { Alert, Snackbar, Tabs, Tab, Box } from "@mui/material";
import { MapPin, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { User, Company } from "@/store/slices/authSlice";
import AddressCard from "./AddressCard";
import AddressFormDialog from "./AddressFormDialog";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";

interface AddressesSectionProps {
  user: User;
  company: Company | null;
}

export default function AddressesSection({
  user,
  company,
}: AddressesSectionProps) {
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage.dir === "rtl";

  const {
    addresses: userAddresses,
    isLoading: userLoading,
    getUserAddresses,
    deleteUserAddress,
  } = useUserAddresses();

  const {
    addresses: companyAddresses,
    isLoading: companyLoading,
    getCompanyAddresses,
    deleteCompanyAddress,
  } = useCompanyAddresses();

  const [activeTab, setActiveTab] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<"success" | "error">(
    "success"
  );

  useEffect(() => {
    if (user?.id) {
      getUserAddresses(user.id);
    }
  }, [user?.id, getUserAddresses]);

  useEffect(() => {
    if (company?.id) {
      getCompanyAddresses(company.id);
    }
  }, [company?.id, getCompanyAddresses]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;

    try {
      let result;
      if (activeTab === 0) {
        result = await deleteUserAddress(addressToDelete);
      } else {
        result = await deleteCompanyAddress(addressToDelete);
      }

      if (result.type.endsWith("/fulfilled")) {
        setToastMessage(t("profile.addressDeleted"));
        setToastSeverity("success");
        setToastOpen(true);
      } else {
        throw new Error("Delete failed");
      }
    } catch (error) {
      setToastMessage(t("profile.addressDeleteError"));
      setToastSeverity("error");
      setToastOpen(true);
    } finally {
      setAddressToDelete(null);
    }
  };

  const currentAddresses = activeTab === 0 ? userAddresses : companyAddresses;
  const isLoading = activeTab === 0 ? userLoading : companyLoading;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("profile.myAddresses")}
        </h2>
        <Button
          variant="primary"
          onClick={() => setIsDialogOpen(true)}
          className="gap-2"
        >
          <Plus size={20} />
          <span>{t("profile.addAddress")}</span>
        </Button>
      </div>

      {/* Tabs for User/Company Addresses */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          className={cn(isRTL && "flex-row-reverse")}
          sx={{
            "& .MuiTabs-flexContainer": {
              flexDirection: isRTL ? "row-reverse" : "row",
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
            },
          }}
        >
          <Tab label={t("profile.userAddresses")} />
          {company && <Tab label={t("profile.companyAddresses")} />}
        </Tabs>
      </Box>

      {/* Addresses Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {t("profile.loading")}
          </p>
        </div>
      ) : currentAddresses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <MapPin size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {t("profile.noAddresses")}
          </p>
          <Button
            variant="outline"
            onClick={() => setIsDialogOpen(true)}
            className="gap-2"
          >
            <Plus size={20} />
            <span>{t("profile.addFirstAddress")}</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentAddresses.map((address: any) => (
            <AddressCard
              key={address.id}
              address={address}
              onDelete={() => setAddressToDelete(address.id)}
            />
          ))}
        </div>
      )}

      {/* Add Address Dialog */}
      <AddressFormDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        userId={activeTab === 0 ? user.id : undefined}
        companyId={activeTab === 1 && company ? company.id : undefined}
        onSuccess={() => {
          setToastMessage(t("profile.addressAdded"));
          setToastSeverity("success");
          setToastOpen(true);
          if (activeTab === 0 && user?.id) {
            getUserAddresses(user.id);
          } else if (activeTab === 1 && company?.id) {
            getCompanyAddresses(company.id);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!addressToDelete}
        onOpenChange={(open) => !open && setAddressToDelete(null)}
        onConfirm={handleDeleteAddress}
        title={t("profile.deleteAddress")}
        description={t("profile.deleteAddressConfirm")}
      />

      {/* Toast Notification */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: isRTL ? "left" : "right",
        }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity={toastSeverity}
          sx={{ width: "100%" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
