import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface Order {
  id: string;
}

export interface Payment {
  id: string;
  orderId: string;
  order?: Order;
  amount: string;
  method: string;
  transactionId?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentsState {
  payments: Payment[];
  currentPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreatePaymentData {
  orderId: string;
  amount: string;
  method: string;
  transactionId?: string;
}

export interface ThawaniCheckoutData {
  successUrl: string;
  cancelUrl: string;
}

export interface ThawaniCheckoutResponse {
  paymentId: string;
  sessionId: string;
  redirectUrl: string;
}

export interface EdfaPayCheckoutData {
  currency?: string;
  description?: string;
  termUrl3ds: string;
  payer: {
    firstName: string;
    lastName: string;
    address: string;
    country: string;
    city: string;
    zip: string;
    email: string;
    phone: string;
    ip: string;
  };
}

export interface EdfaPayCheckoutResponse {
  paymentId: string;
  redirectUrl: string;
}

// Initial state
const initialState: PaymentsState = {
  payments: [],
  currentPayment: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getOrderPayments = createAsyncThunk<
  Payment[],
  string,
  { rejectValue: string }
>("payments/getOrderPayments", async (orderId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.PAYMENTS.GET_BY_ORDER(orderId)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch payments"
    );
  }
});

export const getPaymentById = createAsyncThunk<
  Payment,
  string,
  { rejectValue: string }
>("payments/getPaymentById", async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.PAYMENTS.DETAIL(id)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch payment"
    );
  }
});

export const createPayment = createAsyncThunk<
  Payment,
  CreatePaymentData,
  { rejectValue: string }
>("payments/createPayment", async (paymentData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.PAYMENTS.BASE,
      paymentData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to create payment"
    );
  }
});

export const updatePaymentStatus = createAsyncThunk<
  Payment,
  { id: string; status: string },
  { rejectValue: string }
>(
  "payments/updatePaymentStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        API_CONFIG.ENDPOINTS.PAYMENTS.UPDATE_STATUS(id, status)
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update payment status"
      );
    }
  }
);

export const deletePayment = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("payments/deletePayment", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.PAYMENTS.DETAIL(id));
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete payment"
    );
  }
});

export const thawaniCheckout = createAsyncThunk<
  ThawaniCheckoutResponse,
  { orderId: string; data: ThawaniCheckoutData },
  { rejectValue: string }
>(
  "payments/thawaniCheckout",
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.PAYMENTS.THAWANI_CHECKOUT(orderId),
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create Thawani checkout"
      );
    }
  }
);

export const edfapayCheckout = createAsyncThunk<
  EdfaPayCheckoutResponse,
  { orderId: string; data: EdfaPayCheckoutData },
  { rejectValue: string }
>(
  "payments/edfapayCheckout",
  async ({ orderId, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.PAYMENTS.EDFAPAY_CHECKOUT(orderId),
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create EdfaPay checkout"
      );
    }
  }
);

// Payments slice
const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    setCurrentPayment: (state, action: PayloadAction<Payment>) => {
      state.currentPayment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Order Payments
      .addCase(getOrderPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getOrderPayments.fulfilled,
        (state, action: PayloadAction<Payment[]>) => {
          state.isLoading = false;
          state.payments = action.payload;
          state.error = null;
        }
      )
      .addCase(getOrderPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch payments";
      })

      // Get Payment By ID
      .addCase(getPaymentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getPaymentById.fulfilled,
        (state, action: PayloadAction<Payment>) => {
          state.isLoading = false;
          state.currentPayment = action.payload;
          state.error = null;
        }
      )
      .addCase(getPaymentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch payment";
      })

      // Create Payment
      .addCase(createPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createPayment.fulfilled,
        (state, action: PayloadAction<Payment>) => {
          state.isLoading = false;
          state.payments.push(action.payload);
          state.error = null;
        }
      )
      .addCase(createPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create payment";
      })

      // Update Payment Status
      .addCase(updatePaymentStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updatePaymentStatus.fulfilled,
        (state, action: PayloadAction<Payment>) => {
          state.isLoading = false;
          const index = state.payments.findIndex(
            (p) => p.id === action.payload.id
          );
          if (index !== -1) {
            state.payments[index] = action.payload;
          }
          if (state.currentPayment?.id === action.payload.id) {
            state.currentPayment = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update payment status";
      })

      // Delete Payment
      .addCase(deletePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deletePayment.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.payments = state.payments.filter(
            (p) => p.id !== action.payload
          );
          if (state.currentPayment?.id === action.payload) {
            state.currentPayment = null;
          }
          state.error = null;
        }
      )
      .addCase(deletePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete payment";
      })

      // Thawani Checkout
      .addCase(thawaniCheckout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        thawaniCheckout.fulfilled,
        (state, action: PayloadAction<ThawaniCheckoutResponse>) => {
          state.isLoading = false;
          state.error = null;
          // Thawani checkout returns redirect URL, no need to update state
        }
      )
      .addCase(thawaniCheckout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create Thawani checkout";
      })

      // EdfaPay Checkout
      .addCase(edfapayCheckout.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        edfapayCheckout.fulfilled,
        (state, action: PayloadAction<EdfaPayCheckoutResponse>) => {
          state.isLoading = false;
          state.error = null;
          // EdfaPay checkout returns redirect URL, no need to update state
        }
      )
      .addCase(edfapayCheckout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create EdfaPay checkout";
      });
  },
});

export const { clearError, clearCurrentPayment, setCurrentPayment } =
  paymentsSlice.actions;
export default paymentsSlice.reducer;
