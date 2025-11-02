import { THAWANI_CONFIG } from "@/config/thawani";
import apiClient from "@/lib/apiClient";

// Thawani Session Interface
export interface ThawaniSession {
  success: boolean;
  data: {
    session_id: string;
    client_reference_id?: string;
  };
}

export interface ThawaniSessionDetails {
  success: boolean;
  data: {
    session_id: string;
    client_reference_id?: string;
    status: "paid" | "unpaid" | "expired";
    total_amount: number;
    currency: string;
    metadata?: Record<string, any>;
  };
}

export interface CreateThawaniSessionData {
  client_reference_id?: string;
  products: Array<{
    name: string;
    quantity: number;
    unit_amount: number;
  }>;
  metadata?: Record<string, any>;
  success_url?: string;
  cancel_url?: string;
  customer_id?: string; // For saved card payment
}

class ThawaniService {
  private getHeaders() {
    const config = THAWANI_CONFIG.getConfig();
    return {
      "thawani-api-key": config.secretKey,
      "Content-Type": "application/json",
    };
  }

  /**
   * Create a payment session with Thawani
   * This should be called from the backend for security
   */
  async createSessionViaBackend(paymentData: {
    orderId: string;
    amount: string;
    method: string;
    transactionId?: string;
    returnUrl?: string;
  }): Promise<{ payment: any; sessionId: string; checkoutUrl: string }> {
    try {
      // First create payment record in our backend
      const paymentResponse = await apiClient.post("/payments", {
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        method: paymentData.method,
        transactionId: paymentData.transactionId,
      });

      // Then create Thawani session via backend API endpoint
      // Note: Backend should have an endpoint like POST /payments/:paymentId/create-thawani-session
      // For now, we'll create it directly (but this should be moved to backend)
      const returnUrl = paymentData.returnUrl || window.location.href;
      const encodedReturn = encodeURIComponent(returnUrl);
      const sessionResponse = await this.createSession({
        client_reference_id: paymentResponse.data.id,
        products: [
          {
            name: "Order Payment",
            quantity: 1,
            unit_amount: Math.round(parseFloat(paymentData.amount) * 100), // Convert to smallest currency unit
          },
        ],
        metadata: {
          payment_id: paymentResponse.data.id,
          order_id: paymentData.orderId,
        },
        success_url: `${window.location.origin}/payments/success?payment_id=${paymentResponse.data.id}&returnUrl=${encodedReturn}`,
        cancel_url: `${window.location.origin}/payments/cancel?payment_id=${paymentResponse.data.id}&returnUrl=${encodedReturn}`,
      });

      const checkoutUrl = THAWANI_CONFIG.getCheckoutUrl(
        sessionResponse.data.session_id
      );

      return {
        payment: paymentResponse.data,
        sessionId: sessionResponse.data.session_id,
        checkoutUrl,
      };
    } catch (error: any) {
      console.error("Thawani payment session creation error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create payment session"
      );
    }
  }

  /**
   * Create a payment session directly with Thawani API
   * Note: This should ideally be done on the backend for security
   */
  async createSession(
    sessionData: CreateThawaniSessionData
  ): Promise<ThawaniSession> {
    try {
      const config = THAWANI_CONFIG.getConfig();
      const response = await fetch(
        `${config.baseUrl}/api/v1/checkout/session`,
        {
          method: "POST",
          headers: this.getHeaders(),
          body: JSON.stringify(sessionData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to create Thawani session"
        );
      }

      return await response.json();
    } catch (error: any) {
      console.error("Thawani create session error:", error);
      throw new Error(
        error.message || "Failed to create payment session with Thawani"
      );
    }
  }

  /**
   * Retrieve session details from Thawani
   */
  async retrieveSession(sessionId: string): Promise<ThawaniSessionDetails> {
    try {
      const config = THAWANI_CONFIG.getConfig();
      const response = await fetch(
        `${config.baseUrl}/api/v1/checkout/session/${sessionId}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to retrieve Thawani session"
        );
      }

      return await response.json();
    } catch (error: any) {
      console.error("Thawani retrieve session error:", error);
      throw new Error(
        error.message || "Failed to retrieve payment session from Thawani"
      );
    }
  }

  /**
   * Get checkout URL for redirect
   */
  getCheckoutUrl(sessionId: string): string {
    return THAWANI_CONFIG.getCheckoutUrl(sessionId);
  }
}

export const thawaniService = new ThawaniService();
