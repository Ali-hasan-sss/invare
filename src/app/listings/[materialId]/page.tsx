"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Container,
  Link,
  Pagination,
} from "@mui/material";
import {
  ArrowLeft,
  Package,
  Clock,
  DollarSign,
  User,
  Gavel,
} from "lucide-react";
import { useListings } from "@/hooks/useListings";
import { useMaterials } from "@/hooks/useMaterials";
import { useTranslation } from "@/hooks/useTranslation";
import { Avatar } from "@/components/ui/Avatar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import ClientOnly from "@/components/ClientOnly";

const MaterialListingsPage: React.FC = () => {
  const { materialId } = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const {
    listings,
    isLoading,
    error,
    getListings,
    totalCount,
    currentPage,
    limit,
    setCurrentPage,
  } = useListings();
  const { getMaterialById, currentMaterial } = useMaterials();
  const [currentPageLocal, setCurrentPageLocal] = useState(1);

  useEffect(() => {
    if (materialId && typeof materialId === "string") {
      // Fetch material details
      getMaterialById(materialId);
      // Fetch listings for this material
      getListings({ materialId, page: currentPageLocal, limit: 12 });
    }
  }, [materialId, currentPageLocal, getMaterialById, getListings]);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPageLocal(value);
    setCurrentPage(value);
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleListingClick = (listingId: string) => {
    router.push(`/listings/detail/${listingId}`);
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(parseFloat(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA");
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
        return t("listings.active");
      case "pending":
        return t("listings.pending");
      case "expired":
        return t("listings.expired");
      default:
        return status;
    }
  };

  if (isLoading && !listings.length) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !listings.length) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={16} />}
          onClick={handleBackClick}
        >
          {t("common.back")}
        </Button>
      </Container>
    );
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <Container maxWidth="lg" className="py-8">
      {/* Header */}
      <Box className="mb-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          className="mb-6"
          variant="default"
          size="md"
          items={[
            {
              label: t("common.home"),
              href: "/",
            },
            {
              label: t("navigation.materials"),
              onClick: handleBackClick,
              icon: <Package size={14} />,
            },
            {
              label: currentMaterial?.name || t("listings.materialListings"),
            },
          ]}
        />

        {/* Page Title */}
        <Box className="flex items-center justify-between">
          <Box>
            <Typography
              variant="h4"
              component="h1"
              className="font-bold text-gray-900 dark:text-gray-100 mb-2"
            >
              {currentMaterial?.name
                ? `${t("listings.offersFor")} ${currentMaterial.name}`
                : t("listings.materialListings")}
            </Typography>
            <Typography
              variant="body1"
              className="text-gray-600 dark:text-gray-400"
            >
              {t("listings.foundResults").replace(
                "{count}",
                totalCount.toString()
              )}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={16} />}
            onClick={handleBackClick}
            className="hidden sm:flex"
          >
            {t("common.back")}
          </Button>
        </Box>
      </Box>

      {/* Listings Grid */}
      {listings.length > 0 ? (
        <>
          <Grid container spacing={3} className="mb-6">
            {listings.map((listing) => (
              <Grid item xs={12} sm={6} md={4} key={listing.id}>
                <Card
                  className="h-full cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => handleListingClick(listing.id)}
                >
                  {/* Listing Image */}
                  <CardMedia
                    component="div"
                    className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center"
                  >
                    {listing.photos && listing.photos.length > 0 ? (
                      <img
                        src={listing.photos[0].url}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={48} className="text-gray-400" />
                    )}
                  </CardMedia>

                  <CardContent className="p-4">
                    {/* Status Chip */}
                    <Box className="flex justify-between items-start mb-3">
                      <Chip
                        label={getStatusText(listing.status)}
                        color={getStatusColor(listing.status) as any}
                        size="small"
                        className="mb-2"
                      />
                      {listing.isBiddable && (
                        <Chip
                          icon={<Gavel size={16} />}
                          label={t("listings.auction")}
                          variant="outlined"
                          size="small"
                          className="text-purple-600 border-purple-600"
                        />
                      )}
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      component="h3"
                      className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2"
                    >
                      {listing.title}
                    </Typography>

                    {/* Description */}
                    {listing.description && (
                      <Typography
                        variant="body2"
                        className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2"
                      >
                        {listing.description}
                      </Typography>
                    )}

                    {/* Price and Quantity */}
                    <Box className="flex items-center justify-between mb-3">
                      <Box className="flex items-center text-green-600 dark:text-green-400">
                        <DollarSign size={16} className="mr-1" />
                        <Typography
                          variant="body2"
                          component="span"
                          className="font-semibold"
                        >
                          {formatPrice(listing.startingPrice)}
                        </Typography>
                        <Typography
                          variant="caption"
                          className="text-gray-500 ml-1"
                        >
                          / {listing.unitOfMeasure}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        {listing.stockAmount} {listing.unitOfMeasure}
                      </Typography>
                    </Box>

                    {/* Seller Info */}
                    {listing.seller && (
                      <Box className="flex items-center mb-3">
                        <Avatar
                          size="small"
                          fallback={
                            listing.seller.companyName ||
                            listing.seller.email ||
                            "S"
                          }
                        />
                        <Typography
                          variant="body2"
                          className="text-gray-600 dark:text-gray-400 ml-2"
                        >
                          {listing.seller.companyName || listing.seller.email}
                        </Typography>
                      </Box>
                    )}

                    {/* Expiry Date */}
                    {listing.expiresAt && (
                      <Box className="flex items-center text-gray-500 dark:text-gray-400">
                        <Clock size={14} className="mr-1" />
                        <Typography variant="caption">
                          {t("listings.expiresOn")}{" "}
                          {formatDate(listing.expiresAt)}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" className="mt-8">
              <Pagination
                count={totalPages}
                page={currentPageLocal}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      ) : (
        <Box className="text-center py-12">
          <Package size={64} className="text-gray-400 mx-auto mb-4" />
          <Typography
            variant="h6"
            className="text-gray-600 dark:text-gray-400 mb-2"
          >
            {t("listings.noListingsFound")}
          </Typography>
          <Typography
            variant="body2"
            className="text-gray-500 dark:text-gray-500 mb-4"
          >
            {t("listings.noListingsDescription")}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowLeft size={16} />}
            onClick={handleBackClick}
          >
            {t("common.back")}
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default MaterialListingsPage;
