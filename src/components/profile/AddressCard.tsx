"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MapPin, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Address {
  id: string;
  addressLine1?: string;
  addressLine2?: string;
  street?: string; // for backward compatibility
  city: string;
  state?: string;
  postalCode: string;
  country?: {
    countryName: string;
  };
  countryId?: string;
  isDefault?: boolean;
}

interface AddressCardProps {
  address: Address;
  onDelete: () => void;
}

export default function AddressCard({ address, onDelete }: AddressCardProps) {
  const { t, currentLanguage } = useTranslation();
  const isRTL = currentLanguage.dir === "rtl";

  return (
    <Card className="p-5 hover:shadow-lg transition-all duration-200 relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {address.isDefault && (
        <div
          className={cn(
            "absolute top-3 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-yellow-200 dark:border-yellow-800",
            isRTL ? "left-3" : "right-3"
          )}
        >
          <Star size={12} fill="currentColor" />
          <span>{t("profile.isDefault")}</span>
        </div>
      )}

      <div className="flex items-start gap-3 mb-4">
        <div className="p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800">
          <MapPin size={18} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 dark:text-white">
            {address.addressLine1 || address.street}
          </p>
          {address.addressLine2 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {address.addressLine2}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {address.city}
          {address.state && `, ${address.state}`}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {address.postalCode}
        </p>
        {address.country && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {address.country.countryName}
          </p>
        )}
      </div>

      <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 size={16} />
          <span>{t("profile.deleteAddress")}</span>
        </Button>
      </div>
    </Card>
  );
}
