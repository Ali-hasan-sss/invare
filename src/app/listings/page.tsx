"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Container,
  Pagination,
  Snackbar,
} from "@mui/material";
import { Package } from "lucide-react";
import { useListings } from "@/hooks/useListings";
import { useTranslation } from "@/hooks/useTranslation";
import { usePaymentProcessing } from "@/hooks/usePayments";
import { useMaterialsList } from "@/hooks/useMaterials";
import { useCompaniesList } from "@/hooks/useCompanies";
import { useUsersList } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import ListingCard from "@/components/ui/ListingCard";
import ListingsFilter, {
  ListingsFilterData,
} from "@/components/ui/ListingsFilter";
// PaymentMethod removed - using EdfaPay only
import PaymentFlowDialogs from "@/components/payments/PaymentFlowDialogs";
import BiddingDialog from "@/components/bidding/BiddingDialog";
import { useBidding } from "@/hooks/useBids";

const ListingsPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
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
  const { isAuthenticated } = useAuth();
  const { processPayment } = usePaymentProcessing();
  const {
    placeBid,
    isLoading: isBidLoading,
    error: bidError,
    clearError: clearBidError,
  } = useBidding();
  const { materials, getMaterials } = useMaterialsList();
  const { companies, getCompanies } = useCompaniesList();
  const { users, getUsers } = useUsersList();

  // Payment method selection dialog state (legacy, not used anymore)
  const [isPaymentMethodDialogOpen, setIsPaymentMethodDialogOpen] =
    useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);
  const [selectedListingPrice, setSelectedListingPrice] = useState<
    string | null
  >(null);
  const [selectedListingUnitOfMeasure, setSelectedListingUnitOfMeasure] =
    useState<string | null>(null);
  const [selectedListingStockAmount, setSelectedListingStockAmount] = useState<
    number | null
  >(null);

  // Payment processing dialog state
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null
  );
  const [selectedListingAmount, setSelectedListingAmount] = useState<
    string | null
  >(null);
  const [calculatedTotalAmount, setCalculatedTotalAmount] =
    useState<string>("0");

  // Bidding dialog state
  const [isBiddingDialogOpen, setIsBiddingDialogOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");

  // Get filters from URL params
  const getInitialFilters = (): ListingsFilterData => {
    return {
      materialId: searchParams.get("materialId") || undefined,
      companyId: searchParams.get("companyId") || undefined,
      userId: searchParams.get("userId") || undefined,
      isBiddable:
        searchParams.get("isBiddable") === null
          ? undefined
          : searchParams.get("isBiddable") === "true",
    };
  };

  const [filters, setFilters] = useState<ListingsFilterData>(getInitialFilters);
  const [currentPageLocal, setCurrentPageLocal] = useState(
    parseInt(searchParams.get("page") || "1")
  );

  // Update URL when filters or page change
  useEffect(() => {
    const params = new URLSearchParams();
    params.append("page", currentPageLocal.toString());
    params.append("limit", limit.toString());

    if (filters.materialId) params.append("materialId", filters.materialId);
    if (filters.companyId) params.append("companyId", filters.companyId);
    if (filters.userId) params.append("userId", filters.userId);
    if (filters.isBiddable !== undefined) {
      params.append("isBiddable", filters.isBiddable.toString());
    }

    router.push(`/listings?${params.toString()}`);
  }, [filters, currentPageLocal, limit, router]);

  // Fetch listings when filters or page change
  useEffect(() => {
    const fetchListings = async () => {
      await getListings({
        page: currentPageLocal,
        limit,
        ...filters,
      });
    };
    fetchListings();
  }, [filters, currentPageLocal, limit, getListings]);

  // Show purchase success toast if returned from payment
  useEffect(() => {
    const success = searchParams.get("purchaseSuccess");
    if (success === "1") {
      setToastMessage(t("payments.purchaseSuccess"));
      setToastOpen(true);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("purchaseSuccess");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [searchParams, t]);

  // Ensure names are available for dynamic title
  useEffect(() => {
    const ensureLookups = async () => {
      if (filters.materialId && materials.length === 0) {
        await getMaterials({ limit: 100 });
      }
      if (filters.companyId && companies.length === 0) {
        await getCompanies({ limit: 100 });
      }
      if (filters.userId && users.length === 0) {
        await getUsers({ limit: 100 });
      }
    };
    ensureLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.materialId, filters.companyId, filters.userId]);

  const getDynamicTitle = (): string => {
    const parts: string[] = [];

    if (filters.isBiddable === true) parts.push(t("listings.auction"));
    if (filters.isBiddable === false) parts.push(t("filters.buyNow"));

    if (filters.materialId) {
      const m = materials.find((x) => x.id === filters.materialId);
      if (m?.name) parts.push(m.name);
    }
    if (filters.companyId) {
      const c = companies.find((x) => x.id === filters.companyId);
      if (c?.companyName) parts.push(c.companyName);
    }
    if (filters.userId) {
      const u = users.find((x) => x.id === filters.userId);
      if (u)
        parts.push(
          u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.email
        );
    }

    if (parts.length === 0) return t("listings.allListings");
    return `${t("listings.allListings")} – ${parts.join(" • ")}`;
  };

  // Calculate total amount when quantity or price changes
  useEffect(() => {
    if (selectedListingPrice && purchaseQuantity > 0) {
      const total = (
        parseFloat(selectedListingPrice) * purchaseQuantity
      ).toFixed(2);
      setCalculatedTotalAmount(total);
    } else {
      setCalculatedTotalAmount("0");
    }
  }, [selectedListingPrice, purchaseQuantity]);

  const handleProceedToPayment = async () => {
    if (
      !selectedListingId ||
      !calculatedTotalAmount ||
      parseFloat(calculatedTotalAmount) <= 0
    ) {
      return;
    }

    // Validate quantity
    if (purchaseQuantity <= 0) {
      setToastMessage(t("payments.invalidQuantity") || "الكمية غير صحيحة");
      setToastOpen(true);
      return;
    }

    if (
      selectedListingStockAmount &&
      purchaseQuantity > selectedListingStockAmount
    ) {
      setToastMessage(
        t("payments.quantityExceedsStock") ||
          "الكمية المطلوبة تتجاوز الكمية المتاحة"
      );
      setToastOpen(true);
      return;
    }

    // Close selection dialog
    setIsPaymentMethodDialogOpen(false);
    // Set total amount for processing
    setSelectedListingAmount(calculatedTotalAmount);
    // Open processing dialog
    setIsPaymentDialogOpen(true);

    try {
      if (!selectedListingId || !selectedListingPrice) {
        throw new Error(t("payments.missingData") || "بيانات ناقصة");
      }

      // Payment gateway will be selected automatically based on NEXT_PUBLIC_PAYMENT_COUNTRY
      await processPayment(
        selectedListingId,
        purchaseQuantity,
        selectedListingPrice,
        calculatedTotalAmount
      );
      // processPayment will redirect
    } catch (error: any) {
      console.error("Payment processing error:", error);
      setToastMessage(error.message || t("payments.paymentFailed"));
      setToastOpen(true);
      setIsPaymentDialogOpen(false);
      setIsPaymentMethodDialogOpen(true);
    }
  };

  const handleClosePaymentMethodDialog = () => {
    setIsPaymentMethodDialogOpen(false);
    setSelectedListingId(null);
    setSelectedListingPrice(null);
    setSelectedListingUnitOfMeasure(null);
    setSelectedListingStockAmount(null);
    setSelectedListingAmount(null);
    setPurchaseQuantity(1);
    setCalculatedTotalAmount("0");
    setSelectedPaymentMethod(null);
  };

  const handleQuantityChange = (value: number) => {
    if (value < 1) {
      setPurchaseQuantity(1);
      return;
    }
    if (selectedListingStockAmount && value > selectedListingStockAmount) {
      setPurchaseQuantity(selectedListingStockAmount);
      return;
    }
    setPurchaseQuantity(value);
  };

  const handleClosePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setSelectedListingId(null);
    setSelectedListingAmount(null);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPageLocal(value);
    setCurrentPage(value);
  };

  const handleFilterChange = (newFilters: ListingsFilterData) => {
    setFilters(newFilters);
    setCurrentPageLocal(1); // Reset to first page when filters change
    setCurrentPage(1);
  };

  const handleListingClick = (listingId: string) => {
    router.push(`/listings/detail/${listingId}`);
  };

  const handleFavoriteClick = (listingId: string) => {
    console.log("Add to favorites:", listingId);
    alert(t("actions.addToFavorites"));
  };

  const handleShareClick = (listingId: string) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/listings/detail/${listingId}`
    );
    alert(t("actions.shareSuccess"));
  };

  const handleStartBiddingClick = (listingId: string) => {
    if (!isAuthenticated) {
      setToastMessage(t("bidding.loginRequired"));
      setToastOpen(true);
      return;
    }
    setSelectedListingId(listingId);
    setIsBiddingDialogOpen(true);
  };

  const handleSubmitBidFromDialog = async () => {
    if (!selectedListingId || !bidAmount) return;
    try {
      clearBidError();
      const result = await placeBid(selectedListingId, bidAmount);
      if (result.type === "bids/createBid/fulfilled") {
        setToastMessage(t("bidding.placeBidSuccess"));
        setToastOpen(true);
        setIsBiddingDialogOpen(false);
        setBidAmount("");
      } else {
        const message =
          typeof result.payload === "string"
            ? result.payload
            : t("bidding.placeBidError");
        setToastMessage(message);
        setToastOpen(true);
      }
    } catch (e: any) {
      setToastMessage(e?.message || t("bidding.placeBidError"));
      setToastOpen(true);
    }
  };

  const handleBuyNowClick = (data: {
    id: string;
    price: string;
    unitOfMeasure: string;
    stockAmount: number;
  }) => {
    if (!isAuthenticated) {
      setToastMessage(t("bidding.loginRequired"));
      setToastOpen(true);
      return;
    }

    // Configure and open payment method selection dialog
    setSelectedListingId(data.id);
    setSelectedListingPrice(data.price);
    setSelectedListingUnitOfMeasure(data.unitOfMeasure);
    setSelectedListingStockAmount(data.stockAmount);
    setPurchaseQuantity(1);
    setIsPaymentMethodDialogOpen(true);
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
              label: t("listings.allListings"),
            },
          ]}
        />

        {/* Page Title */}
        <Typography
          variant="h4"
          component="h1"
          className="font-bold text-gray-900 dark:text-gray-100 mb-2"
        >
          {getDynamicTitle()}
        </Typography>
        <Typography
          variant="body1"
          className="text-gray-600 dark:text-gray-400"
        >
          {t("listings.foundResults").replace("{count}", totalCount.toString())}
        </Typography>
      </Box>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Filter Sidebar */}
        <Grid item xs={12} md={3}>
          <ListingsFilter
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </Grid>

        {/* Listings Grid */}
        <Grid item xs={12} md={9}>
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
                      onBuyNowClick={handleBuyNowClick}
                      onStartBiddingClick={handleStartBiddingClick}
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
            </Box>
          )}
        </Grid>
      </Grid>
      {/* Toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
      {/* Payment Method Selection Dialog */}
      <PaymentFlowDialogs
        isPaymentMethodDialogOpen={isPaymentMethodDialogOpen}
        onClosePaymentMethodDialog={handleClosePaymentMethodDialog}
        selectedPaymentMethod={selectedPaymentMethod}
        setSelectedPaymentMethod={(m) => setSelectedPaymentMethod(m)}
        purchaseQuantity={purchaseQuantity}
        handleQuantityChange={handleQuantityChange}
        selectedListingUnitOfMeasure={selectedListingUnitOfMeasure}
        selectedListingPrice={selectedListingPrice}
        selectedListingStockAmount={selectedListingStockAmount}
        calculatedTotalAmount={calculatedTotalAmount}
        onProceedToPayment={handleProceedToPayment}
        isPaymentDialogOpen={isPaymentDialogOpen}
        onClosePaymentDialog={handleClosePaymentDialog}
        selectedListingAmount={selectedListingAmount}
      />

      {/* Bidding Dialog (locks scroll by default) */}
      <BiddingDialog
        open={isBiddingDialogOpen}
        onClose={() => {
          setIsBiddingDialogOpen(false);
          setBidAmount("");
        }}
        onSubmit={handleSubmitBidFromDialog}
        isLoading={isBidLoading}
        bidAmount={bidAmount}
        setBidAmount={setBidAmount}
        currentPriceLabel={(() => {
          const l = listings.find((x) => x.id === selectedListingId);
          return l ? `${l.startingPrice} ${t("common.currency")}` : "";
        })()}
        minAmount={(() => {
          const l = listings.find((x) => x.id === selectedListingId);
          return l ? l.startingPrice : undefined;
        })()}
      />
    </Container>
  );
};

const ListingsPage: React.FC = () => {
  return (
    <Suspense
      fallback={
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
      }
    >
      <ListingsPageContent />
    </Suspense>
  );
};

export default ListingsPage;
