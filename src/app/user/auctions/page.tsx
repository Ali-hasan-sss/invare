"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Pagination,
} from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import { useListings } from "@/hooks/useListings";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useTranslation } from "@/hooks/useTranslation";
import ListingCard from "@/components/ui/ListingCard";

const UserAuctionsContent: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
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
  const [currentPageLocal, setCurrentPageLocal] = useState(1);

  useEffect(() => {
    if (!user) return;
    getListings({
      page: currentPageLocal,
      limit: 12,
      userId: user.id,
      isBiddable: true,
    });
  }, [getListings, user, currentPageLocal]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPageLocal(value);
    setCurrentPage(value);
  };

  const handleListingClick = (listingId: string) => {
    router.push(`/listings/detail/${listingId}`);
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <Container maxWidth="lg" className="py-8">
      <Breadcrumbs
        className="mb-6"
        variant="default"
        size="md"
        items={[
          { label: t("common.home"), href: "/" },
          { label: t("user.myAuctions") || "مزاداتي" },
        ]}
      />

      <Typography
        variant="h4"
        component="h1"
        className="font-bold mb-4 text-gray-900 dark:text-gray-100"
      >
        {t("user.myAuctions") || "مزاداتي"}
      </Typography>

      {isLoading && !listings.length ? (
        <Box className="flex items-center justify-center min-h-[300px]">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      ) : listings.length === 0 ? (
        <Box className="text-center py-12">
          <Typography variant="h6" className="text-gray-600 dark:text-gray-400">
            {t("listings.noListingsFound")}
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {listings.map((l) => (
              <Grid item xs={12} sm={6} lg={4} key={l.id}>
                <ListingCard
                  id={l.id}
                  title={l.title}
                  description={l.description}
                  startingPrice={l.startingPrice}
                  unitOfMeasure={l.unitOfMeasure}
                  stockAmount={l.stockAmount}
                  status={l.status}
                  isBiddable={l.isBiddable}
                  expiresAt={l.expiresAt}
                  photos={l.photos}
                  seller={l.seller}
                  material={l.material}
                  onClick={handleListingClick}
                />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box className="mt-8 flex justify-center">
              <Pagination
                count={totalPages}
                page={currentPageLocal}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

const UserAuctionsPage: React.FC = () => {
  return (
    <Suspense
      fallback={
        <Container maxWidth="lg" className="py-8">
          <Box className="flex items-center justify-center min-h-[300px]">
            <CircularProgress />
          </Box>
        </Container>
      }
    >
      <UserAuctionsContent />
    </Suspense>
  );
};

export default UserAuctionsPage;
