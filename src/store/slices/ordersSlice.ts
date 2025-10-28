import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface OrderItem {
  listingId: string;
  quantity: number;
  unitPrice: string;
}

export interface Order {
  id: string;
  buyerCompanyId?: string;
  sellerCompanyId?: string;
  createdByUserId?: string;
  orderStatus: string;
  status?: string;
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  limit: number;
}

export interface CreateOrderData {
  buyerCompanyId?: string;
  sellerCompanyId?: string;
  createdByUserId?: string;
  orderStatus?: string;
  items: OrderItem[];
}

export interface GetOrdersParams {
  page?: number;
  limit?: number;
}

// Initial state
const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  limit: 20,
};

// Async thunks
export const getOrders = createAsyncThunk<
  Order[],
  GetOrdersParams | void,
  { rejectValue: string }
>("orders/getOrders", async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `${API_CONFIG.ENDPOINTS.ORDERS.LIST}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to fetch orders"
    );
  }
});

export const getOrderById = createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>("orders/getOrderById", async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.ORDERS.DETAIL(id)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to fetch order"
    );
  }
});

export const createOrder = createAsyncThunk<
  Order,
  CreateOrderData,
  { rejectValue: string }
>("orders/createOrder", async (orderData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.ORDERS.BASE,
      orderData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to create order"
    );
  }
});

export const updateOrderStatus = createAsyncThunk<
  Order,
  { id: string; status: string },
  { rejectValue: string }
>("orders/updateOrderStatus", async ({ id, status }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(
      API_CONFIG.ENDPOINTS.ORDERS.UPDATE_STATUS(id, status)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to update order status"
    );
  }
});

export const deleteOrder = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("orders/deleteOrder", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.ORDERS.DETAIL(id));
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to delete order"
    );
  }
});

// Orders slice
const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Orders
      .addCase(getOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.isLoading = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch orders";
      })

      // Get Order By ID
      .addCase(getOrderById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getOrderById.fulfilled,
        (state, action: PayloadAction<Order>) => {
          state.isLoading = false;
          state.currentOrder = action.payload;
          state.error = null;
        }
      )
      .addCase(getOrderById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch order";
      })

      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
        state.error = null;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create order";
      })

      // Update Order Status
      .addCase(updateOrderStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateOrderStatus.fulfilled,
        (state, action: PayloadAction<Order>) => {
          state.isLoading = false;
          const index = state.orders.findIndex(
            (o) => o.id === action.payload.id
          );
          if (index !== -1) {
            state.orders[index] = action.payload;
          }
          if (state.currentOrder?.id === action.payload.id) {
            state.currentOrder = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update order status";
      })

      // Delete Order
      .addCase(deleteOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteOrder.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.orders = state.orders.filter((o) => o.id !== action.payload);
          if (state.currentOrder?.id === action.payload) {
            state.currentOrder = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete order";
      });
  },
});

export const { clearError, clearCurrentOrder, setCurrentPage, setLimit } =
  ordersSlice.actions;
export default ordersSlice.reducer;
