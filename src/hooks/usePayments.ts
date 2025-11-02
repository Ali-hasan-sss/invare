import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getOrderPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  deletePayment,
  edfapayCheckout,
  clearError,
  clearCurrentPayment,
  setCurrentPayment,
  Payment,
  CreatePaymentData,
  EdfaPayCheckoutData,
  EdfaPayCheckoutResponse,
} from "@/store/slices/paymentsSlice";
import { useOrders } from "./useOrders";
import { useListings } from "./useListings";
import { useAuth } from "./useAuth";
import type { Listing } from "@/store/slices/listingsSlice";
import type { Order } from "@/store/slices/ordersSlice";

export const usePayments = () => {
  const dispatch = useAppDispatch();
  const { payments, currentPayment, isLoading, error } = useAppSelector(
    (state) => state.payments
  );

  const getOrderPaymentsHandler = useCallback(
    (orderId: string) => {
      return dispatch(getOrderPayments(orderId));
    },
    [dispatch]
  );

  const getPaymentByIdHandler = useCallback(
    (id: string) => {
      return dispatch(getPaymentById(id));
    },
    [dispatch]
  );

  const createPaymentHandler = useCallback(
    (paymentData: CreatePaymentData) => {
      return dispatch(createPayment(paymentData));
    },
    [dispatch]
  );

  const updatePaymentStatusHandler = useCallback(
    (id: string, status: string) => {
      return dispatch(updatePaymentStatus({ id, status }));
    },
    [dispatch]
  );

  const deletePaymentHandler = useCallback(
    (id: string) => {
      return dispatch(deletePayment(id));
    },
    [dispatch]
  );

  const clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearCurrentPaymentHandler = useCallback(() => {
    dispatch(clearCurrentPayment());
  }, [dispatch]);

  const setCurrentPaymentHandler = useCallback(
    (payment: Payment) => {
      dispatch(setCurrentPayment(payment));
    },
    [dispatch]
  );

  const edfapayCheckoutHandler = useCallback(
    (orderId: string, data: EdfaPayCheckoutData) => {
      return dispatch(edfapayCheckout({ orderId, data }));
    },
    [dispatch]
  );

  return {
    payments,
    currentPayment,
    isLoading,
    error,
    getOrderPayments: getOrderPaymentsHandler,
    getPaymentById: getPaymentByIdHandler,
    createPayment: createPaymentHandler,
    updatePaymentStatus: updatePaymentStatusHandler,
    deletePayment: deletePaymentHandler,
    edfapayCheckout: edfapayCheckoutHandler,
    clearError: clearErrorHandler,
    clearCurrentPayment: clearCurrentPaymentHandler,
    setCurrentPayment: setCurrentPaymentHandler,
  };
};

/**
 * Validate UUID format
 */
const isValidUUID = (uuid: string | undefined | null): boolean => {
  if (!uuid || typeof uuid !== "string") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid.trim());
};

/**
 * Hook for processing payments via EdfaPay Backend
 */
export const usePaymentProcessing = () => {
  const paymentHooks = usePayments();
  const { createOrder, getOrderById } = useOrders();
  const { getListingById } = useListings();
  const { user, company } = useAuth();

  /**
   * Start EdfaPay checkout session
   */
  const startEdfapayCheckout = useCallback(
    async (orderId: string, checkoutData: EdfaPayCheckoutData) => {
      try {
        const result = await paymentHooks.edfapayCheckout(
          orderId,
          checkoutData
        );

        if (result.type !== "payments/edfapayCheckout/fulfilled") {
          const errorMessage =
            typeof result.payload === "string"
              ? result.payload
              : "Failed to create EdfaPay checkout";
          throw new Error(errorMessage);
        }

        const response = result.payload as EdfaPayCheckoutResponse;

        // Redirect to EdfaPay checkout page
        if (response.redirectUrl) {
          window.location.href = response.redirectUrl;
        }

        return response;
      } catch (error: any) {
        console.error("EdfaPay checkout error:", error);
        paymentHooks.clearError();
        throw error;
      }
    },
    [paymentHooks]
  );

  /**
   * Process payment for a listing (buy now)
   * Creates Order first, then Payment, then redirects to EdfaPay checkout
   */
  const processPayment = useCallback(
    async (
      listingId: string,
      quantity: number,
      unitPrice: string,
      totalAmount: string
    ) => {
      try {
        // Step 1: Get listing details to extract sellerCompanyId
        const listingResult = await getListingById(listingId);

        if (listingResult.type !== "listings/getListingById/fulfilled") {
          const errorMessage =
            typeof listingResult.payload === "string"
              ? listingResult.payload
              : "Failed to fetch listing details";
          throw new Error(errorMessage);
        }

        const listing = listingResult.payload as Listing;
        if (!listing || typeof listing === "string") {
          throw new Error("Listing not found");
        }

        // Get sellerCompanyId from listing (direct or from seller object)
        const sellerCompanyId =
          listing.sellerCompanyId ||
          (listing.seller ? (listing.seller as any).id : null);

        // Validate UUIDs before creating order
        const buyerCompanyId = company?.id;
        const createdByUserId = user?.id;

        // Validate listingId (required)
        if (!isValidUUID(listing.id)) {
          throw new Error("Listing ID is not a valid UUID");
        }

        // Step 2: Create Order
        // Build order data with optional UUIDs (only include if valid)
        const orderData: any = {
          orderStatus: "pending",
          items: [
            {
              listingId: listing.id.trim(),
              quantity: quantity,
              unitPrice: unitPrice,
            },
          ],
        };

        // Include buyerCompanyId only if valid UUID
        if (buyerCompanyId && isValidUUID(buyerCompanyId)) {
          orderData.buyerCompanyId = buyerCompanyId.trim();
        }

        // Include sellerCompanyId only if valid UUID
        if (sellerCompanyId && isValidUUID(sellerCompanyId)) {
          orderData.sellerCompanyId = sellerCompanyId.trim();
        }

        // Include createdByUserId only if valid UUID
        if (createdByUserId && isValidUUID(createdByUserId)) {
          orderData.createdByUserId = createdByUserId.trim();
        }

        console.log("Creating order with data:", orderData);

        const orderResult = await createOrder(orderData);

        if (orderResult.type !== "orders/createOrder/fulfilled") {
          const errorMessage =
            typeof orderResult.payload === "string"
              ? orderResult.payload
              : "Failed to create order";
          throw new Error(errorMessage);
        }

        const order = orderResult.payload as Order;
        if (!order || typeof order === "string" || !order.id) {
          throw new Error("Order was not created successfully");
        }

        console.log("Order created successfully:", order.id);

        // Step 3: Create Payment with Order ID
        const paymentData: CreatePaymentData = {
          orderId: order.id,
          amount: totalAmount,
          method: "card", // Default payment method
        };

        console.log("Creating payment with data:", paymentData);

        // Create payment via backend
        const paymentResult = await paymentHooks.createPayment(paymentData);

        if (paymentResult.type !== "payments/createPayment/fulfilled") {
          const errorMessage =
            paymentResult.payload ||
            paymentHooks.error ||
            "Failed to create payment record";
          throw new Error(
            typeof errorMessage === "string"
              ? errorMessage
              : "Failed to create payment record"
          );
        }

        const payment = paymentResult.payload as Payment;

        // Check if payment was created successfully
        if (!payment || !payment.id) {
          throw new Error("Payment record was not created successfully");
        }

        // Step 4: Use EdfaPay for payment
        if (!user) {
          throw new Error("User information is required for payment");
        }

        // Get user IP (simplified - in production, get real IP)
        const ip = "176.44.76.222"; // Default IP, should be fetched from API

        // Build return URL
        const baseUrl = window.location.origin;

        const edfapayData: EdfaPayCheckoutData = {
          currency: "SAR",
          description: `Order Payment - ${listing.title || "Order"}`,
          termUrl3ds: `${baseUrl}/payments/edfapay/return`,
          payer: {
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            address: "", // Could be fetched from user addresses
            country: "SA",
            city: "", // Could be fetched from user addresses
            zip: "",
            email: user.email,
            phone: (user as any).phone || "966500000000", // Default phone if not available
            ip: ip,
          },
        };

        await startEdfapayCheckout(order.id, edfapayData);

        return {
          success: true,
          payment,
          order,
        };
      } catch (error: any) {
        console.error("Payment processing error:", error);
        paymentHooks.clearError();
        throw error;
      }
    },
    [
      paymentHooks,
      createOrder,
      getListingById,
      user,
      company,
      startEdfapayCheckout,
    ]
  );

  return {
    ...paymentHooks,
    startEdfapayCheckout,
    processPayment,
  };
};
