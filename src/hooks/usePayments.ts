import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getOrderPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  deletePayment,
  clearError,
  clearCurrentPayment,
  setCurrentPayment,
  Payment,
  CreatePaymentData,
} from "@/store/slices/paymentsSlice";
import { thawaniService } from "@/services/thawaniService";
import { PaymentMethod } from "@/config/thawani";
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
 * Map PaymentMethod enum to API method values
 */
const mapPaymentMethodToApiValue = (paymentMethod: PaymentMethod): string => {
  switch (paymentMethod) {
    case PaymentMethod.THAWANI:
      return "card"; // Thawani uses card payment
    case PaymentMethod.STRIPE:
      return "card";
    case PaymentMethod.PAYPAL:
      return "card";
    default:
      return "card";
  }
};

/**
 * Hook for processing payments with different payment gateways
 */
export const usePaymentProcessing = () => {
  const paymentHooks = usePayments();
  const { createOrder, getOrderById } = useOrders();
  const { getListingById } = useListings();
  const { user, company } = useAuth();

  /**
   * Process payment for a listing (buy now)
   * Creates Order first, then Payment, then redirects to payment gateway
   */
  const processPayment = useCallback(
    async (
      listingId: string,
      quantity: number,
      unitPrice: string,
      totalAmount: string,
      paymentMethod: PaymentMethod = PaymentMethod.THAWANI
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
        // Map payment method to API value
        const apiMethod = mapPaymentMethodToApiValue(paymentMethod);

        const paymentData: CreatePaymentData = {
          orderId: order.id, // Use Order ID instead of listingId
          amount: totalAmount,
          method: apiMethod,
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

        // Process payment based on method
        if (paymentMethod === PaymentMethod.THAWANI) {
          const returnUrl = window.location.href;
          const session = await thawaniService.createSessionViaBackend({
            orderId: order.id, // Use Order ID
            amount: payment.amount,
            method: payment.method,
            transactionId: payment.transactionId,
            returnUrl,
          });

          // Redirect to Thawani checkout
          window.location.href = session.checkoutUrl;

          return {
            success: true,
            payment,
            sessionId: session.sessionId,
            checkoutUrl: session.checkoutUrl,
          };
        }

        // Add other payment methods here
        throw new Error(
          `Payment method ${paymentMethod} is not yet implemented`
        );
      } catch (error: any) {
        console.error("Payment processing error:", error);
        paymentHooks.clearError();
        throw error;
      }
    },
    [paymentHooks, createOrder, getListingById, user, company]
  );

  /**
   * Check payment status after redirect
   */
  const checkPaymentStatus = useCallback(async (sessionId: string) => {
    try {
      const session = await thawaniService.retrieveSession(sessionId);
      return session;
    } catch (error: any) {
      console.error("Payment status check error:", error);
      throw error;
    }
  }, []);

  return {
    ...paymentHooks,
    processPayment,
    checkPaymentStatus,
  };
};
