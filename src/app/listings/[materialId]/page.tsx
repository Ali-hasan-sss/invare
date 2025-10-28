"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Container,
  Pagination,
} from "@mui/material";
import { ArrowLeft, Package } from "lucide-react";
import { useListings } from "@/hooks/useListings";
import { useMaterials } from "@/hooks/useMaterials";
import { useTranslation } from "@/hooks/useTranslation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import ListingCard from "@/components/ui/ListingCard";
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

  const handleFavoriteClick = (listingId: string) => {
    // TODO: Implement add to favorites functionality
    console.log("Add to favorites:", listingId);
    alert(t("actions.addToFavorites"));
  };

  const handleShareClick = (listingId: string) => {
    // TODO: Implement share functionality
    console.log("Share listing:", listingId);
    navigator.clipboard.writeText(
      `${window.location.origin}/listings/detail/${listingId}`
    );
    alert(t("actions.shareSuccess"));
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
          <Grid container spacing={4} className="mb-6">
            {listings.map((listing) => (
              <Grid item xs={12} sm={6} lg={4} key={listing.id}>
                <ListingCard
                  id={listing.id}
                  title={listing.title}
                  description={listing.description}
                  startingPrice={listing.startingPrice}
                  unitOfMeasure={listing.unitOfMeasure}
                  stockAmount={listing.stockAmount}
                  status={listing.status}
                  isBiddable={listing.isBiddable}
                  expiresAt={listing.expiresAt}
                  photos={listing.photos}
                  seller={listing.seller}
                  material={listing.material}
                  onClick={handleListingClick}
                  onFavoriteClick={handleFavoriteClick}
                  onShareClick={handleShareClick}
                />
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
