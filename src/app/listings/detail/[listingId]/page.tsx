"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Container,
  Link,
  Divider,
  Avatar as MuiAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Snackbar,
  TextField,
  DialogActions,
} from "@mui/material";
import {
  ArrowLeft,
  Package,
  Clock,
  Gavel,
  Phone,
  Mail,
  MapPin,
  Share2,
  Heart,
  MessageCircle,
  Calendar,
  Weight,
  Ruler,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useListings } from "@/hooks/useListings";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import PaymentFlowDialogs from "@/components/payments/PaymentFlowDialogs";
// PaymentMethod removed - using EdfaPay only
import { usePaymentProcessing } from "@/hooks/usePayments";
import BiddingDialog from "@/components/bidding/BiddingDialog";
import { useBidding } from "@/hooks/useBids";
import { Avatar } from "@/components/ui/Avatar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import ClientOnly from "@/components/ClientOnly";
import { ChatDialog } from "@/components/ChatDialog";

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

const ListingDetailPage: React.FC = () => {
  const { listingId } = useParams();
  const router = useRouter();
  const { t, currentLanguage } = useTranslation();
  const { getListingById, currentListing, isLoading, error } = useListings();
  const { isAuthenticated, user, company } = useAuth();
  const {
    placeBid,
    isLoading: isBidLoading,
    error: bidError,
    clearError,
  } = useBidding();

  // Image gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  // Bidding state
  const [isBiddingDialogOpen, setIsBiddingDialogOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");

  // Chat state
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastSeverity, setToastSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  // Buy Now (Payment) state
  const { processPayment, isLoading: isPaymentLoading } =
    usePaymentProcessing();
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
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null
  );
  const [selectedListingAmount, setSelectedListingAmount] = useState<
    string | null
  >(null);
  const [calculatedTotalAmount, setCalculatedTotalAmount] =
    useState<string>("0");

  useEffect(() => {
    if (listingId && typeof listingId === "string") {
      getListingById(listingId, currentLanguage.code);
    }
  }, [listingId, getListingById, currentLanguage.code]);

  const handleBackClick = () => {
    router.back();
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      setToastMessage(t("home.loginRequired"));
      setToastSeverity("warning");
      setToastOpen(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
      return;
    }

    // Check if seller user information is available
    // sellerUser is required for chat (seller can be null if it's a user listing)
    const sellerUser = (listing as any).sellerUser;
    if (!sellerUser || !sellerUser.id) {
      setToastMessage(
        t("chat.sellerInfoNotAvailable") || "معلومات البائع غير متوفرة"
      );
      setToastSeverity("error");
      setToastOpen(true);
      return;
    }

    // Open chat dialog
    setIsChatDialogOpen(true);
  };

  const handlePlaceBid = async () => {
    if (!isAuthenticated) {
      // Show toast for login required
      setToastMessage(t("bidding.loginRequired"));
      setToastSeverity("warning");
      setToastOpen(true);
      return;
    }

    // Open bidding dialog if user is authenticated
    setIsBiddingDialogOpen(true);
  };

  const handleSubmitBid = async () => {
    if (!listingId || typeof listingId !== "string" || !bidAmount) {
      return;
    }

    // Debug logging for company data
    console.log("User and company data:", {
      user: user,
      company: company,
      companyId: company?.id,
    });

    // Do not warn if user doesn't have a company (per request)

    try {
      // Clear any previous errors
      clearError();

      // Place bid using Redux slice
      const result = await placeBid(listingId, bidAmount, company?.id);

      if (result.type === "bids/createBid/fulfilled") {
        setToastMessage(t("bidding.placeBidSuccess"));
        setToastSeverity("success");
        setToastOpen(true);
        setIsBiddingDialogOpen(false);
        setBidAmount("");
      } else {
        // Handle rejected case - show more specific error
        const errorMessage =
          (typeof result.payload === "string" ? result.payload : bidError) ||
          t("bidding.placeBidError");
        console.error("Bid creation failed:", result);
        setToastMessage(errorMessage);
        setToastSeverity("error");
        setToastOpen(true);
      }
    } catch (error: any) {
      console.error("Place bid error:", error);

      // Show more specific error message if available
      let errorMessage = t("bidding.placeBidError");
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (bidError) {
        errorMessage = bidError;
      }

      setToastMessage(errorMessage);
      setToastSeverity("error");
      setToastOpen(true);
    }
  };

  const handleCloseBiddingDialog = () => {
    setIsBiddingDialogOpen(false);
    setBidAmount("");
    clearError(); // Clear any bid errors when closing dialog
  };

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  // Payment helpers
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

  const handleBuyNowClick = () => {
    if (!currentListing) return;
    if (!isAuthenticated) {
      setToastMessage(t("bidding.loginRequired"));
      setToastSeverity("warning");
      setToastOpen(true);
      return;
    }
    setSelectedListingId(currentListing.id);
    setSelectedListingPrice(currentListing.startingPrice);
    setSelectedListingUnitOfMeasure(currentListing.unitOfMeasure);
    setSelectedListingStockAmount(currentListing.stockAmount);
    setPurchaseQuantity(1);
    setIsPaymentMethodDialogOpen(true);
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

  const handleClosePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setSelectedListingId(null);
    setSelectedListingAmount(null);
  };

  const handleProceedToPayment = async () => {
    if (
      !selectedListingId ||
      !calculatedTotalAmount ||
      parseFloat(calculatedTotalAmount) <= 0
    )
      return;
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
    setIsPaymentMethodDialogOpen(false);
    setSelectedListingAmount(calculatedTotalAmount);
    setIsPaymentDialogOpen(true);
    try {
      if (!selectedListingId || !selectedListingPrice)
        throw new Error(t("payments.missingData") || "بيانات ناقصة");
      await processPayment(
        selectedListingId,
        purchaseQuantity,
        selectedListingPrice,
        calculatedTotalAmount
      );
    } catch (error: any) {
      setToastMessage(error.message || t("payments.paymentFailed"));
      setToastSeverity("error");
      setToastOpen(true);
      setIsPaymentDialogOpen(false);
      setIsPaymentMethodDialogOpen(true);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: currentListing?.title,
          text: currentListing?.description,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert(t("actions.shareSuccess"));
      }
    } catch (error) {
      console.error("Share error:", error);
      // Try clipboard as fallback
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert(t("actions.shareSuccess"));
      } catch (clipboardError) {
        alert(t("actions.shareError"));
      }
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
    }).format(parseFloat(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const nextImage = () => {
    if (currentListing?.photos && currentListing.photos.length > 0) {
      setSelectedImageIndex((prev) =>
        prev === currentListing.photos!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (currentListing?.photos && currentListing.photos.length > 0) {
      setSelectedImageIndex((prev) =>
        prev === 0 ? currentListing.photos!.length - 1 : prev - 1
      );
    }
  };

  if (isLoading) {
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

  if (error || !currentListing) {
    return (
      <Container maxWidth="lg" className="py-8">
        <Alert severity="error" className="mb-4">
          {error || t("listings.notFound")}
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

  const listing = currentListing;
  const hasImages = listing.photos && listing.photos.length > 0;

  // Check if current user is the seller
  // Check multiple possible ways the seller information might be stored
  const sellerUser = (listing as any).sellerUser;
  const sellerUserId = listing.sellerUserId || sellerUser?.id;
  const sellerCompanyId = listing.sellerCompanyId || listing.seller?.id;

  // Debug logging (remove after testing)
  if (process.env.NODE_ENV === "development") {
    console.log("Owner check:", {
      user: user?.id,
      company: company?.id,
      listingSellerUserId: listing.sellerUserId,
      listingSellerCompanyId: listing.sellerCompanyId,
      sellerUserId,
      sellerCompanyId,
      sellerUser: sellerUser?.id,
      seller: listing.seller?.id,
      userEmail: user?.email,
      sellerUserEmail: sellerUser?.email,
      sellerEmail: listing.seller?.email,
    });
  }

  const isOwner =
    (user?.id && sellerUserId && String(user.id) === String(sellerUserId)) ||
    (company?.id &&
      sellerCompanyId &&
      String(company.id) === String(sellerCompanyId)) ||
    (user?.id &&
      listing.seller?.id &&
      String(user.id) === String(listing.seller.id)) ||
    (user?.email && sellerUser?.email && user.email === sellerUser.email) ||
    (user?.email &&
      listing.seller?.email &&
      user.email === listing.seller.email);

  // Debug logging (remove after testing)
  if (process.env.NODE_ENV === "development") {
    console.log("isOwner result:", isOwner);
  }

  return (
    <Container maxWidth="lg" className="py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs
        className="mb-8"
        variant="elevated"
        size="md"
        items={[
          {
            label: t("common.home"),
            href: "/",
          },
          {
            label: listing.material?.name || t("navigation.materials"),
            onClick: handleBackClick,
            icon: <Package size={14} />,
          },
          {
            label: listing.title,
          },
        ]}
      />

      <Grid container spacing={4}>
        {/* Left Column - Images and Gallery */}
        <Grid item xs={12} md={7}>
          <Card className="mb-4 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-0">
              {hasImages ? (
                <Box className="relative">
                  {/* Main Image */}
                  <Box
                    className="h-96 bg-gray-100 dark:bg-gray-700 cursor-pointer overflow-hidden"
                    onClick={() => setIsImageDialogOpen(true)}
                  >
                    <img
                      src={listing.photos![selectedImageIndex].url}
                      alt={listing.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Box>

                  {/* Navigation Arrows */}
                  {listing.photos!.length > 1 && (
                    <>
                      <IconButton
                        className="absolute ltr:left-2 rtl:right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 z-10"
                        onClick={prevImage}
                      >
                        <ChevronLeft
                          size={24}
                          className="ltr:block rtl:hidden"
                        />
                        <ChevronRight
                          size={24}
                          className="ltr:hidden rtl:block"
                        />
                      </IconButton>
                      <IconButton
                        className="absolute ltr:right-2 rtl:left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 z-10"
                        onClick={nextImage}
                      >
                        <ChevronRight
                          size={24}
                          className="ltr:block rtl:hidden"
                        />
                        <ChevronLeft
                          size={24}
                          className="ltr:hidden rtl:block"
                        />
                      </IconButton>
                    </>
                  )}

                  {/* Image Counter */}
                  <Box className="absolute bottom-4 ltr:right-4 rtl:left-4 bg-black/70 text-white px-2 py-1 rounded-md text-sm">
                    {selectedImageIndex + 1} / {listing.photos!.length}
                  </Box>
                </Box>
              ) : (
                <Box className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  <Package size={80} className="text-gray-400" />
                </Box>
              )}

              {/* Thumbnail Gallery */}
              {hasImages && listing.photos!.length > 1 && (
                <Box className="p-4">
                  <Grid container spacing={1}>
                    {listing.photos!.map((photo, index) => (
                      <Grid item xs={3} sm={2} key={photo.id}>
                        <Box
                          className={`h-16 cursor-pointer rounded-md overflow-hidden border-2 transition-colors ${
                            index === selectedImageIndex
                              ? "border-purple-500"
                              : "border-gray-200 dark:border-gray-600"
                          }`}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img
                            src={photo.url}
                            alt={`${listing.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent>
              <Typography
                variant="h6"
                className="font-semibold mb-3 text-gray-900 dark:text-white"
              >
                {t("listings.description")}
              </Typography>
              <Typography
                variant="body1"
                className="text-gray-700 dark:text-gray-300 leading-relaxed"
              >
                {listing.description || t("listings.noDescription")}
              </Typography>
            </CardContent>
          </Card>

          {/* Attributes */}
          {listing.attributes && listing.attributes.length > 0 && (
            <Card className="mt-4 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent>
                <Typography
                  variant="h6"
                  className="font-semibold mb-3 text-gray-900 dark:text-white"
                >
                  {t("listings.specifications")}
                </Typography>
                <TableContainer className="dark:bg-gray-800">
                  <Table>
                    <TableBody>
                      {listing.attributes.map((attribute) => (
                        <TableRow
                          key={attribute.id}
                          className="dark:border-gray-700"
                        >
                          <TableCell className="font-medium w-1/3 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
                            {(attribute as any).attrKey ||
                              (attribute as any).name}
                          </TableCell>
                          <TableCell className="text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700">
                            {(attribute as any).attrValue ||
                              (attribute as any).value}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column - Details and Actions */}
        <Grid item xs={12} md={5}>
          <Card className="sticky top-4 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent>
              {/* Status and Type */}
              <Box className="flex items-center justify-between mb-4 gap-2">
                <Chip
                  label={getStatusText(listing.status)}
                  color={getStatusColor(listing.status) as any}
                  size="medium"
                  className="dark:text-white"
                />
                {listing.isBiddable && (
                  <Chip
                    variant="outlined"
                    className="text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400"
                    label={
                      <Box className="flex items-center gap-1">
                        <Gavel size={16} />
                        <span>{t("listings.auction")}</span>
                      </Box>
                    }
                  />
                )}
              </Box>

              {/* Title */}
              <Typography
                variant="h4"
                component="h1"
                className="font-bold mb-4 text-gray-900 dark:text-white"
              >
                {listing.title}
              </Typography>

              {/* Price */}
              <Box className="mb-6">
                <Typography
                  variant="h5"
                  className="text-green-600 dark:text-green-400 font-bold flex items-center gap-2"
                >
                  {formatPrice(listing.startingPrice)}
                  <Typography
                    component="span"
                    variant="body1"
                    className="text-gray-500 dark:text-gray-400"
                  >
                    / {listing.unitOfMeasure}
                  </Typography>
                </Typography>
                {listing.isBiddable && (
                  <Typography
                    variant="body2"
                    className="text-gray-600 dark:text-gray-400 mt-1"
                  >
                    {t("listings.startingPrice")}
                  </Typography>
                )}
              </Box>

              {/* Key Information */}
              <Box className="mb-6 space-y-4">
                <Box className="flex items-center gap-3">
                  <Weight
                    size={20}
                    className="text-gray-500 dark:text-gray-400"
                  />
                  <Box>
                    <Typography
                      variant="body2"
                      className="text-gray-600 dark:text-gray-400"
                    >
                      {t("listings.availableQuantity")}
                    </Typography>
                    <Typography
                      variant="body1"
                      className="font-medium text-gray-900 dark:text-white"
                    >
                      {listing.stockAmount} {listing.unitOfMeasure}
                    </Typography>
                  </Box>
                </Box>

                {listing.material && (
                  <Box className="flex items-center gap-3">
                    <Package
                      size={20}
                      className="text-gray-500 dark:text-gray-400"
                    />
                    <Box>
                      <Typography
                        variant="body2"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        {t("listings.material")}
                      </Typography>
                      <Typography
                        variant="body1"
                        className="font-medium text-gray-900 dark:text-white"
                      >
                        {listing.material.name}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {listing.condition && (
                  <Box className="flex items-center gap-3">
                    <Gavel
                      size={20}
                      className="text-gray-500 dark:text-gray-400"
                    />
                    <Box>
                      <Typography
                        variant="body2"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        {t("listing.condition")}
                      </Typography>
                      <Typography
                        variant="body1"
                        className="font-medium text-gray-900 dark:text-white"
                      >
                        {t(`listing.conditionOptions.${listing.condition}`)}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {listing.materialColor && (
                  <Box className="flex items-center gap-3">
                    <Box
                      className="h-5 w-5 rounded-full border border-gray-300"
                      sx={{
                        backgroundColor:
                          COLOR_HEX_MAP[listing.materialColor] || "#f5f5f5",
                      }}
                    />
                    <Box>
                      <Typography
                        variant="body2"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        {t("listing.materialColor")}
                      </Typography>
                      <Typography
                        variant="body1"
                        className="font-medium text-gray-900 dark:text-white"
                      >
                        {t(
                          `listing.materialColorOptions.${listing.materialColor}`
                        )}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {listing.expiresAt && (
                  <Box className="flex items-center gap-3">
                    <Clock
                      size={20}
                      className="text-gray-500 dark:text-gray-400"
                    />
                    <Box>
                      <Typography
                        variant="body2"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        {t("listings.expiresOn")}
                      </Typography>
                      <Typography
                        variant="body1"
                        className="font-medium text-gray-900 dark:text-white"
                      >
                        {formatDate(listing.expiresAt)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              <Divider className="my-4" />

              {/* Seller Information */}
              {listing.seller && (
                <Box className="mb-6">
                  <Typography
                    variant="h6"
                    className="font-semibold mb-3 text-gray-900 dark:text-white"
                  >
                    {t("listings.seller")}
                  </Typography>
                  <Box className="flex items-start gap-3">
                    <Avatar
                      size="large"
                      fallback={
                        listing.seller.companyName ||
                        (listing as any).sellerUser?.firstName ||
                        listing.seller.email ||
                        "S"
                      }
                    />
                    <Box className="flex-1">
                      <Typography
                        variant="body1"
                        className="font-medium text-gray-900 dark:text-white"
                      >
                        {listing.seller.companyName ||
                          t("listings.privateSeller")}
                      </Typography>

                      {/* Seller User Information */}
                      {(listing as any).sellerUser && (
                        <Typography
                          variant="body2"
                          className="text-gray-600 dark:text-gray-400 mb-1"
                        >
                          {(listing as any).sellerUser.firstName}{" "}
                          {(listing as any).sellerUser.lastName}
                        </Typography>
                      )}

                      {/* Email */}
                      {(listing.seller.email ||
                        (listing as any).sellerUser?.email) && (
                        <Typography
                          variant="body2"
                          className="text-gray-600 dark:text-gray-400 mb-1"
                        >
                          {listing.seller.email ||
                            (listing as any).sellerUser?.email}
                        </Typography>
                      )}

                      {/* Phone */}
                      {(listing as any).sellerUser?.phone && (
                        <Typography
                          variant="body2"
                          className="text-gray-600 dark:text-gray-400 mb-1"
                        >
                          {(listing as any).sellerUser.phone}
                        </Typography>
                      )}

                      {/* Website */}
                      {(listing.seller as any).website && (
                        <Link
                          href={(listing.seller as any).website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          {(listing.seller as any).website}
                        </Link>
                      )}

                      {/* Verification Status */}
                      {(listing.seller as any).verificationStatus && (
                        <Box className="mt-2">
                          <Chip
                            size="small"
                            label={
                              (listing.seller as any).verificationStatus ===
                              "verified"
                                ? t("seller.verified")
                                : (listing.seller as any).verificationStatus ===
                                  "pending"
                                ? t("seller.pending")
                                : t("seller.unverified")
                            }
                            color={
                              (listing.seller as any).verificationStatus ===
                              "verified"
                                ? "success"
                                : (listing.seller as any).verificationStatus ===
                                  "pending"
                                ? "warning"
                                : "default"
                            }
                            className="text-xs"
                          />
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}

              <Divider className="my-4" />

              {/* Action Buttons */}
              <Box className="space-y-3">
                {listing.isBiddable ? (
                  <>
                    {listing.status.toLowerCase() === "active" ? (
                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        className="bg-purple-600 hover:bg-purple-700 text-white py-3"
                        onClick={handlePlaceBid}
                      >
                        <Box className="flex items-center justify-center gap-2">
                          <Gavel size={20} />
                          <span>{t("bidding.startBidding")}</span>
                        </Box>
                      </Button>
                    ) : listing.status.toLowerCase() === "expired" ? (
                      <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        disabled
                        className="py-3"
                      >
                        <Box className="flex items-center justify-center gap-2">
                          <Gavel size={20} />
                          <span>{t("bidding.biddingEnded")}</span>
                        </Box>
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="large"
                        fullWidth
                        disabled
                        className="py-3"
                      >
                        <Box className="flex items-center justify-center gap-2">
                          <Gavel size={20} />
                          <span>{t("bidding.biddingNotStarted")}</span>
                        </Box>
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3"
                    onClick={handleBuyNowClick}
                  >
                    <Box className="flex items-center justify-center gap-2">
                      <span>{t("common.buyNow")}</span>
                    </Box>
                  </Button>
                )}

                {/* Contact Seller Button - Only show if user is not the owner */}
                {!isOwner && (
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    className="py-3"
                    onClick={handleContactSeller}
                  >
                    <Box className="flex items-center justify-center gap-2">
                      <MessageCircle size={20} />
                      <span>{t("listings.contactSeller")}</span>
                    </Box>
                  </Button>
                )}

                <Box className="flex gap-2">
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={handleShare}
                    className="flex-1"
                  >
                    <Box className="flex items-center justify-center gap-2">
                      <Share2 size={16} />
                      <span>{t("common.share")}</span>
                    </Box>
                  </Button>
                  <Button
                    variant="outlined"
                    size="medium"
                    className="flex-1"
                    onClick={() => {
                      // TODO: Implement add to favorites functionality
                      alert(t("actions.addToFavorites"));
                    }}
                  >
                    <Box className="flex items-center justify-center gap-2">
                      <Heart size={16} />
                      <span>{t("common.favorite")}</span>
                    </Box>
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Image Gallery Dialog */}
      <Dialog
        open={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          className: "dark:bg-gray-800 dark:text-white",
          sx: {
            bgcolor: "background.paper",
          },
        }}
      >
        <DialogTitle className="flex items-center justify-between dark:bg-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700">
          <Typography
            component="span"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {listing.title}
          </Typography>
          <IconButton
            onClick={() => setIsImageDialogOpen(false)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X size={24} />
          </IconButton>
        </DialogTitle>
        <DialogContent className="p-0 dark:bg-gray-800">
          {hasImages && (
            <Box className="relative bg-black/5 dark:bg-gray-900">
              <img
                src={listing.photos![selectedImageIndex].url}
                alt={listing.title}
                className="w-full h-auto max-h-[80vh] object-contain mx-auto block"
              />

              {/* Navigation Arrows */}
              {listing.photos!.length > 1 && (
                <>
                  <IconButton
                    className="absolute ltr:left-4 rtl:right-4 top-1/2 transform -translate-y-1/2 bg-black/60 dark:bg-gray-800/80 text-white hover:bg-black/80 dark:hover:bg-gray-700/90 transition-all duration-200 z-10"
                    onClick={prevImage}
                  >
                    <ChevronLeft size={32} className="ltr:block rtl:hidden" />
                    <ChevronRight size={32} className="ltr:hidden rtl:block" />
                  </IconButton>
                  <IconButton
                    className="absolute ltr:right-4 rtl:left-4 top-1/2 transform -translate-y-1/2 bg-black/60 dark:bg-gray-800/80 text-white hover:bg-black/80 dark:hover:bg-gray-700/90 transition-all duration-200 z-10"
                    onClick={nextImage}
                  >
                    <ChevronRight size={32} className="ltr:block rtl:hidden" />
                    <ChevronLeft size={32} className="ltr:hidden rtl:block" />
                  </IconButton>
                </>
              )}

              {/* Image Counter */}
              {listing.photos!.length > 1 && (
                <Box className="absolute bottom-4 ltr:right-4 rtl:left-4 bg-black/70 dark:bg-gray-800/90 text-white px-3 py-1 rounded-lg text-sm font-medium">
                  {selectedImageIndex + 1} / {listing.photos!.length}
                </Box>
              )}

              {/* Close button for mobile */}
              <IconButton
                className="absolute top-4 ltr:right-4 rtl:left-4 bg-black/60 dark:bg-gray-800/80 text-white hover:bg-black/80 dark:hover:bg-gray-700/90 transition-all duration-200 z-10 md:hidden"
                onClick={() => setIsImageDialogOpen(false)}
              >
                <X size={24} />
              </IconButton>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Bidding Dialog */}
      <BiddingDialog
        open={isBiddingDialogOpen}
        onClose={handleCloseBiddingDialog}
        onSubmit={handleSubmitBid}
        isLoading={isBidLoading}
        bidAmount={bidAmount}
        setBidAmount={setBidAmount}
        currentPriceLabel={`${formatPrice(listing.startingPrice)} / ${
          listing.unitOfMeasure
        }`}
      />

      {/* Payment Flow Dialogs for Buy Now */}
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

      {/* Chat Dialog */}
      {isChatDialogOpen && (listing as any).sellerUser && (
        <ChatDialog
          open={isChatDialogOpen}
          onClose={() => setIsChatDialogOpen(false)}
          sellerUserId={(listing as any).sellerUser.id}
          sellerName={
            `${(listing as any).sellerUser.firstName || ""} ${
              (listing as any).sellerUser.lastName || ""
            }`.trim() ||
            (listing as any).sellerUser.email ||
            t("listings.seller")
          }
          listingTitle={listing.title}
          listingId={listing.id}
        />
      )}

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

export default ListingDetailPage;
