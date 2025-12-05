"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import { ArrowLeft, Package } from "lucide-react";
import { useListings } from "@/hooks/useListings";
import { useMaterials } from "@/hooks/useMaterials";
import { useTranslation } from "@/hooks/useTranslation";
import { usePaymentProcessing } from "@/hooks/usePayments";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import ListingCard from "@/components/ui/ListingCard";
import ClientOnly from "@/components/ClientOnly";

// PaymentMethod removed - using EdfaPay only
import PaymentFlowDialogs from "@/components/payments/PaymentFlowDialogs";
import BiddingDialog from "@/components/bidding/BiddingDialog";
import { useBidding } from "@/hooks/useBids";

const MaterialListingsPage: React.FC = () => {
  const { materialId } = useParams();
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const searchParams = useSearchParams();
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
  const { isAuthenticated, company, user } = useAuth();
  const {
    processPayment,
    isLoading: isPaymentLoading,
    error: paymentError,
  } = usePaymentProcessing();
  const { createNewChat, isLoading: isChatLoading } = useChat();

  // Payment method selection dialog state
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
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  // Bidding dialog state
  const {
    placeBid,
    isLoading: isBidLoading,
    clearError: clearBidError,
  } = useBidding();
  const [isBiddingDialogOpen, setIsBiddingDialogOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");

  useEffect(() => {
    if (materialId && typeof materialId === "string") {
      // Fetch material details
      getMaterialById(materialId, currentLanguage.code);
      // Fetch listings for this material
      getListings({
        materialId,
        page: currentPageLocal,
        limit: 12,
        lang: currentLanguage.code,
      });
    }
  }, [
    materialId,
    currentPageLocal,
    getMaterialById,
    getListings,
    currentLanguage.code,
  ]);

  // Show purchase success toast if returned from payment
  useEffect(() => {
    const success = searchParams.get("purchaseSuccess");
    if (success === "1") {
      setToastMessage(t("payments.purchaseSuccess"));
      setToastSeverity("success");
      setToastOpen(true);
      // remove the flag from URL without reload
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("purchaseSuccess");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [searchParams, t]);

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

  const handleStartBiddingClick = (listingId: string) => {
    if (!isAuthenticated) {
      setToastMessage(t("bidding.loginRequired"));
      setToastSeverity("warning");
      setToastOpen(true);
      return;
    }
    setSelectedListingId(listingId);
    setIsBiddingDialogOpen(true);
  };

  const handleChatClick = async (data: {
    listingId: string;
    sellerUserId: string;
    listingTitle: string;
  }) => {
    if (!isAuthenticated || !user?.id) {
      setToastMessage(t("bidding.loginRequired") || "يجب تسجيل الدخول أولاً");
      setToastSeverity("warning");
      setToastOpen(true);
      return;
    }

    try {
      // Get the full listing to access sellerUser if available
      const listing = listings.find((l) => l.id === data.listingId);

      // Try to get sellerUserId from listing
      // sellerUserId is the user ID of the seller (not company ID)
      const sellerUserId =
        listing?.sellerUserId ||
        (listing as any)?.sellerUser?.id ||
        data.sellerUserId;

      if (!sellerUserId) {
        setToastMessage(
          t("chat.sellerNotFound") || "لم يتم العثور على معلومات البائع"
        );
        setToastSeverity("error");
        setToastOpen(true);
        return;
      }

      // Don't allow user to chat with themselves
      if (String(user.id) === String(sellerUserId)) {
        setToastMessage(
          t("chat.cannotChatWithSelf") || "لا يمكنك المحادثة مع نفسك"
        );
        setToastSeverity("warning");
        setToastOpen(true);
        return;
      }

      // Create new chat with POST request
      const result = await createNewChat({
        topic: data.listingTitle,
        createdByUserId: user.id,
        participantUserIds: [user.id, sellerUserId],
        listingId: data.listingId,
      });

      if (result.type === "chat/createChat/fulfilled") {
        setToastMessage(t("chat.chatCreated") || "تم إنشاء المحادثة بنجاح");
        setToastSeverity("success");
        setToastOpen(true);
        // Optionally redirect to chat page or open chat dialog
        router.push("/chat");
      } else {
        const errorMessage =
          typeof result.payload === "string"
            ? result.payload
            : t("chat.createChat") || "فشل في إنشاء المحادثة";
        setToastMessage(errorMessage);
        setToastSeverity("error");
        setToastOpen(true);
      }
    } catch (error: any) {
      setToastMessage(
        error?.message || t("chat.createChat") || "فشل في إنشاء المحادثة"
      );
      setToastSeverity("error");
      setToastOpen(true);
    }
  };

  const handleSubmitBidFromDialog = async () => {
    if (!selectedListingId || !bidAmount) return;
    try {
      clearBidError();
      const result = await placeBid(selectedListingId, bidAmount, company?.id);
      if (result.type === "bids/createBid/fulfilled") {
        setToastMessage(t("bidding.placeBidSuccess"));
        setToastSeverity("success");
        setToastOpen(true);
        setIsBiddingDialogOpen(false);
        setBidAmount("");
      } else {
        const message =
          typeof result.payload === "string"
            ? result.payload
            : t("bidding.placeBidError");
        setToastMessage(message);
        setToastSeverity("error");
        setToastOpen(true);
      }
    } catch (e: any) {
      setToastMessage(e?.message || t("bidding.placeBidError"));
      setToastSeverity("error");
      setToastOpen(true);
    }
  };

  const handleBuyNowClick = (data: {
    id: string;
    price: string;
    unitOfMeasure: string;
    stockAmount: number;
  }) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      setToastMessage(t("bidding.loginRequired"));
      setToastSeverity("warning");
      setToastOpen(true);
      return;
    }

    // Set listing data
    setSelectedListingId(data.id);
    setSelectedListingPrice(data.price);
    setSelectedListingUnitOfMeasure(data.unitOfMeasure);
    setSelectedListingStockAmount(data.stockAmount);
    setPurchaseQuantity(1); // Reset to 1
    setIsPaymentMethodDialogOpen(true);
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
      setToastSeverity("error");
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
      setToastSeverity("error");
      setToastOpen(true);
      return;
    }

    // Close payment method selection dialog
    setIsPaymentMethodDialogOpen(false);

    // Set total amount for processing
    setSelectedListingAmount(calculatedTotalAmount);

    // Open payment processing dialog
    setIsPaymentDialogOpen(true);

    try {
      // Validate required data
      if (!selectedListingId || !selectedListingPrice) {
        throw new Error(t("payments.missingData") || "بيانات ناقصة");
      }

      // Process payment with selected method
      await processPayment(
        selectedListingId,
        purchaseQuantity,
        selectedListingPrice,
        calculatedTotalAmount
      );
      // Note: processPayment will redirect to payment gateway
      // The dialog will close after redirect
    } catch (error: any) {
      console.error("Payment processing error:", error);
      setToastMessage(error.message || t("payments.paymentFailed"));
      setToastSeverity("error");
      setToastOpen(true);
      setIsPaymentDialogOpen(false);
      // Reopen payment method selection dialog on error
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

  const handleCloseToast = () => {
    setToastOpen(false);
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
                  condition={listing.condition}
                  materialColor={listing.materialColor}
                  photos={listing.photos}
                  seller={listing.seller}
                  material={listing.material}
                  onClick={handleListingClick}
                  onFavoriteClick={handleFavoriteClick}
                  onShareClick={handleShareClick}
                  onBuyNowClick={handleBuyNowClick}
                  onStartBiddingClick={handleStartBiddingClick}
                  onChatClick={handleChatClick}
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

      {/* Toast Notification */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toastSeverity}
          sx={{
            width: "100%",
            "&.MuiAlert-standardWarning": {
              backgroundColor: "#fef3c7",
              color: "#92400e",
            },
            "&.MuiAlert-standardSuccess": {
              backgroundColor: "#d1fae5",
              color: "#065f46",
            },
            "&.MuiAlert-standardError": {
              backgroundColor: "#fee2e2",
              color: "#991b1b",
            },
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MaterialListingsPage;
