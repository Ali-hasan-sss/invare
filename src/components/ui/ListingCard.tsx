"use client";

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import {
  Package,
  Clock,
  Gavel,
  Heart,
  Share2,
  Eye,
  ShoppingCart,
  Star,
} from "lucide-react";
import { Avatar } from "./Avatar";
import { useTranslation } from "@/hooks/useTranslation";
import type { Photo, Seller, Material } from "@/store/slices/listingsSlice";

const COLOR_HEX_MAP: Record<string, string> = {
  black: "#000000",
  blue: "#dbeafe",
  green: "#dcfce7",
  orange: "#ffedd4",
  purple: "#f3e8ff",
  red: "#ffe2e2",
  white: "#f5f5f5",
  yellow: "#fef9c2",
};

export interface ListingCardProps {
  id: string;
  title: string;
  description?: string;
  startingPrice: string;
  unitOfMeasure: string;
  stockAmount: number;
  status: string;
  isBiddable: boolean;
  expiresAt?: string;
  condition?: string;
  materialColor?: string;
  photos?: Photo[];
  seller?: Seller;
  material?: Material;
  onClick?: (id: string) => void;
  onFavoriteClick?: (id: string) => void;
  onShareClick?: (id: string) => void;
  onBuyNowClick?: (data: {
    id: string;
    price: string;
    unitOfMeasure: string;
    stockAmount: number;
  }) => void;
  onStartBiddingClick?: (id: string) => void;
  className?: string;
}

const ListingCard: React.FC<ListingCardProps> = ({
  id,
  title,
  description,
  startingPrice,
  unitOfMeasure,
  stockAmount,
  status,
  isBiddable,
  expiresAt,
  condition,
  materialColor,
  photos,
  seller,
  material,
  onClick,
  onFavoriteClick,
  onShareClick,
  onBuyNowClick,
  onStartBiddingClick,
  className = "",
}) => {
  const { t } = useTranslation();

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(parseFloat(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      month: "short",
      day: "numeric",
    });
  };

  const getTranslatedUnitOfMeasure = (unit: string) => {
    const unitKey = unit.toLowerCase();
    const translated = t(`common.unitOfMeasures.${unitKey}`);
    // If translation returns the key itself (not found), return original unit
    return translated === `common.unitOfMeasures.${unitKey}`
      ? unit
      : translated;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "expired":
        return "error";
      default:
        return "default";
    }
  };

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

  const hasImages = photos && photos.length > 0;
  const primaryImage = hasImages ? photos[0] : null;
  const conditionLabel = condition
    ? t(`listing.conditionOptions.${condition}`)
    : undefined;
  const materialColorLabel = materialColor
    ? t(`listing.materialColorOptions.${materialColor}`)
    : undefined;
  const materialColorHex =
    (materialColor && COLOR_HEX_MAP[materialColor]) || undefined;

  const handleCardClick = () => {
    if (onClick) {
      onClick(id);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteClick) {
      onFavoriteClick(id);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShareClick) {
      onShareClick(id);
    }
  };

  const handleBuyNowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBuyNowClick) {
      onBuyNowClick({
        id,
        price: startingPrice,
        unitOfMeasure,
        stockAmount,
      });
    }
  };

  const handleStartBiddingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStartBiddingClick) {
      onStartBiddingClick(id);
    }
  };

  return (
    <Box className={`relative group rounded-xl ${className}`}>
      {/* Main Card - Full height image with overlay content */}
      <Card
        className="relative  dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 overflow-hidden h-80"
        onClick={handleCardClick}
      >
        {/* Full Size Background Image */}
        <Box className="absolute inset-0 rounded-2xl overflow-hidden">
          {hasImages && primaryImage ? (
            <img
              src={primaryImage.url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl"
            />
          ) : (
            <Box className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 dark:from-gray-600 dark:via-gray-700 dark:to-gray-800 flex items-center justify-center rounded-2xl">
              <Package size={64} className="text-gray-500 dark:text-gray-400" />
            </Box>
          )}
          {/* Dark overlay for better text readability */}
          <Box className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent rounded-2xl" />
        </Box>

        {/* Top Right Actions */}
        <Box className="absolute top-4  ltr:right-4 rtl:left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <IconButton
            size="small"
            onClick={handleFavoriteClick}
            className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg"
          >
            <Heart size={16} />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleShareClick}
            className="bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white shadow-lg"
          >
            <Share2 size={16} />
          </IconButton>
        </Box>

        {/* Top Left Status Badge */}
        <Box className="absolute top-4 ltr:left-4 rtl:right-4 z-10">
          <Chip
            label={getStatusText(status)}
            color={getStatusColor(status) as any}
            size="small"
            className="bg-white/95 backdrop-blur-sm text-xs font-medium shadow-lg"
          />
        </Box>

        {/* Auction Badge */}
        {isBiddable && (
          <Box className="absolute top-16 ltr:left-4 rtl:right-4 z-10">
            <Chip
              variant="filled"
              size="small"
              className="bg-purple-600 text-white text-xs font-medium shadow-lg"
              label={
                <Box className="flex items-center gap-1">
                  <Gavel size={14} />
                  <span>{t("listings.auction")}</span>
                </Box>
              }
            />
          </Box>
        )}

        {/* Bottom Content Container - Rounded overlay */}
        <Box className="absolute m-2 bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl px-5 py-4 space-y-3 z-10">
          {/* Price */}
          <Box className="flex items-baseline justify-between">
            <Typography
              variant="h6"
              className="text-green-600 dark:text-green-400 font-bold text-xl"
            >
              {formatPrice(startingPrice)}
            </Typography>
            <Typography
              variant="body2"
              className="text-gray-500 dark:text-gray-400 text-sm"
            >
              / {getTranslatedUnitOfMeasure(unitOfMeasure)}
            </Typography>
          </Box>

          {(conditionLabel || materialColorLabel) && (
            <Box className="flex flex-wrap items-center gap-2">
              {conditionLabel && (
                <Chip
                  size="small"
                  label={conditionLabel}
                  className="bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200 text-xs"
                />
              )}
              {materialColorLabel && (
                <Chip
                  size="small"
                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                  label={
                    <Box className="flex items-center gap-2">
                      {materialColorHex && (
                        <span
                          className="inline-block h-3 w-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: materialColorHex }}
                        />
                      )}
                      <span>{materialColorLabel}</span>
                    </Box>
                  }
                />
              )}
            </Box>
          )}

          {/* Title */}
          <Typography
            variant="body1"
            component="h3"
            className="font-semibold text-gray-900 dark:text-white line-clamp-1 text-base leading-tight"
          >
            {title}
          </Typography>

          {/* Seller & Rating */}
          {seller && (
            <Box className="flex items-center justify-between">
              <Box className="flex items-center gap-2">
                <Avatar
                  size="small"
                  fallback={seller.companyName || seller.email || "S"}
                />
                <Typography
                  variant="body2"
                  className="font-medium text-gray-700 dark:text-gray-300 text-sm"
                >
                  {seller.companyName || t("listings.privateSeller")}
                </Typography>
              </Box>

              {/* Star Rating - Mock data since we don't have rating */}
              <Box className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    className="text-yellow-400 fill-current"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Quantity Info */}
          <Box className="flex items-center justify-between text-gray-600 dark:text-gray-400">
            <Box className="flex items-center gap-1">
              <ShoppingCart size={12} />
              <Typography variant="caption" className="text-xs">
                {stockAmount} {getTranslatedUnitOfMeasure(unitOfMeasure)}{" "}
                {t("common.available")}
              </Typography>
            </Box>

            {/* Verification Badge */}
            {(seller as any)?.verificationStatus === "verified" && (
              <Chip
                size="small"
                label={t("seller.verified")}
                className="bg-green-100 text-green-700 text-xs h-5"
              />
            )}
          </Box>
        </Box>
      </Card>

      {/* Action Button - Separated from card */}
      <Box className="mt-4 px-1">
        {isBiddable && status.toLowerCase() === "active" ? (
          <Button
            variant="contained"
            fullWidth
            size="large"
            className="text-white font-semibold rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, #8BC540 0%, #3A95C4 50%, #854A97 100%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #7bb038 0%, #2d85b3 50%, #764388 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #8BC540 0%, #3A95C4 50%, #854A97 100%)";
            }}
            onClick={handleStartBiddingClick}
          >
            <Box className="flex items-center justify-center gap-2">
              <Gavel size={20} />
              <span>{t("bidding.startBidding")}</span>
            </Box>
          </Button>
        ) : (
          <Button
            variant="contained"
            fullWidth
            size="large"
            className="text-white font-semibold rounded-2xl py-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, #8BC540 0%, #3A95C4 50%, #854A97 100%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #7bb038 0%, #2d85b3 50%, #764388 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #8BC540 0%, #3A95C4 50%, #854A97 100%)";
            }}
            onClick={handleBuyNowClick}
          >
            <Box className="flex items-center justify-center gap-2">
              <ShoppingCart size={20} />
              <span>{t("common.buyNow")}</span>
            </Box>
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ListingCard;
