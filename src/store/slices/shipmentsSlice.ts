import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface Order {
  id: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  order?: Order;
  carrier: string;
  trackingNumber: string;
  status: string;
  shippedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShipmentsState {
  shipments: Shipment[];
  currentShipment: Shipment | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateShipmentData {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  status: string;
  shippedAt?: string;
}

export interface UpdateShipmentData {
  carrier?: string;
  trackingNumber?: string;
  status?: string;
  shippedAt?: string;
}

// Initial state
const initialState: ShipmentsState = {
  shipments: [],
  currentShipment: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getOrderShipments = createAsyncThunk<
  Shipment[],
  string,
  { rejectValue: string }
>("shipments/getOrderShipments", async (orderId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.SHIPMENTS.GET_BY_ORDER(orderId)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch shipments"
    );
  }
});

export const getShipmentById = createAsyncThunk<
  Shipment,
  string,
  { rejectValue: string }
>("shipments/getShipmentById", async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.SHIPMENTS.DETAIL(id)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch shipment"
    );
  }
});

export const createShipment = createAsyncThunk<
  Shipment,
  CreateShipmentData,
  { rejectValue: string }
>("shipments/createShipment", async (shipmentData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.SHIPMENTS.BASE,
      shipmentData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to create shipment"
    );
  }
});

export const updateShipment = createAsyncThunk<
  Shipment,
  { id: string; data: UpdateShipmentData },
  { rejectValue: string }
>("shipments/updateShipment", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(
      API_CONFIG.ENDPOINTS.SHIPMENTS.DETAIL(id),
      data
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to update shipment"
    );
  }
});

export const deleteShipment = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("shipments/deleteShipment", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.SHIPMENTS.DETAIL(id));
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete shipment"
    );
  }
});

// Shipments slice
const shipmentsSlice = createSlice({
  name: "shipments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentShipment: (state) => {
      state.currentShipment = null;
    },
    setCurrentShipment: (state, action: PayloadAction<Shipment>) => {
      state.currentShipment = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Order Shipments
      .addCase(getOrderShipments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getOrderShipments.fulfilled,
        (state, action: PayloadAction<Shipment[]>) => {
          state.isLoading = false;
          state.shipments = action.payload;
          state.error = null;
        }
      )
      .addCase(getOrderShipments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch shipments";
      })

      // Get Shipment By ID
      .addCase(getShipmentById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getShipmentById.fulfilled,
        (state, action: PayloadAction<Shipment>) => {
          state.isLoading = false;
          state.currentShipment = action.payload;
          state.error = null;
        }
      )
      .addCase(getShipmentById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch shipment";
      })

      // Create Shipment
      .addCase(createShipment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createShipment.fulfilled,
        (state, action: PayloadAction<Shipment>) => {
          state.isLoading = false;
          state.shipments.push(action.payload);
          state.error = null;
        }
      )
      .addCase(createShipment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create shipment";
      })

      // Update Shipment
      .addCase(updateShipment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateShipment.fulfilled,
        (state, action: PayloadAction<Shipment>) => {
          state.isLoading = false;
          const index = state.shipments.findIndex(
            (s) => s.id === action.payload.id
          );
          if (index !== -1) {
            state.shipments[index] = action.payload;
          }
          if (state.currentShipment?.id === action.payload.id) {
            state.currentShipment = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updateShipment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update shipment";
      })

      // Delete Shipment
      .addCase(deleteShipment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteShipment.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.shipments = state.shipments.filter(
            (s) => s.id !== action.payload
          );
          if (state.currentShipment?.id === action.payload) {
            state.currentShipment = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteShipment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete shipment";
      });
  },
});

export const { clearError, clearCurrentShipment, setCurrentShipment } =
  shipmentsSlice.actions;
export default shipmentsSlice.reducer;
