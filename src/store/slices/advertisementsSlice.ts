import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface Listing {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  description: string;
  unitOfMeasure: string;
  startingPrice: string;
  stockAmount: number;
  status: string;
  isBiddable: boolean;
  expiresAt: string;
}

export interface Advertisement {
  id: string;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  expiresAt: string;
  listing: Listing;
  isActive: boolean;
}

export interface AdvertisementsState {
  advertisements: Advertisement[];
  currentAdvertisement: Advertisement | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateAdvertisementData {
  imageUrl: string;
  listingId: string;
  expiresAt: string;
}

export interface UpdateAdvertisementData {
  imageUrl?: string;
  listingId?: string;
  expiresAt?: string;
}

// Initial state
const initialState: AdvertisementsState = {
  advertisements: [],
  currentAdvertisement: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getAdvertisements = createAsyncThunk<
  Advertisement[],
  { activeOnly?: boolean } | void,
  { rejectValue: string }
>("advertisements/getAdvertisements", async (params, { rejectWithValue }) => {
  try {
    const queryParam = params?.activeOnly ? "?activeOnly=true" : "";
    const response = await apiClient.get(
      `${API_CONFIG.ENDPOINTS.ADVERTISEMENTS.LIST}${queryParam}`
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch advertisements"
    );
  }
});

export const getAdvertisementById = createAsyncThunk<
  Advertisement,
  string,
  { rejectValue: string }
>("advertisements/getAdvertisementById", async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.ADVERTISEMENTS.DETAIL(id)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch advertisement"
    );
  }
});

export const createAdvertisement = createAsyncThunk<
  Advertisement,
  CreateAdvertisementData,
  { rejectValue: string }
>(
  "advertisements/createAdvertisement",
  async (advertisementData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.ADVERTISEMENTS.BASE,
        advertisementData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create advertisement"
      );
    }
  }
);

export const updateAdvertisement = createAsyncThunk<
  Advertisement,
  { id: string; data: UpdateAdvertisementData },
  { rejectValue: string }
>(
  "advertisements/updateAdvertisement",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        API_CONFIG.ENDPOINTS.ADVERTISEMENTS.DETAIL(id),
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update advertisement"
      );
    }
  }
);

export const toggleAdvertisementActive = createAsyncThunk<
  Advertisement,
  string,
  { rejectValue: string }
>(
  "advertisements/toggleAdvertisementActive",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        API_CONFIG.ENDPOINTS.ADVERTISEMENTS.TOGGLE_ACTIVE(id)
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to toggle advertisement status"
      );
    }
  }
);

export const deleteAdvertisement = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("advertisements/deleteAdvertisement", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.ADVERTISEMENTS.DETAIL(id));
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete advertisement"
    );
  }
});

// Advertisements slice
const advertisementsSlice = createSlice({
  name: "advertisements",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAdvertisement: (state) => {
      state.currentAdvertisement = null;
    },
    setCurrentAdvertisement: (state, action: PayloadAction<Advertisement>) => {
      state.currentAdvertisement = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Advertisements
      .addCase(getAdvertisements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getAdvertisements.fulfilled,
        (state, action: PayloadAction<Advertisement[]>) => {
          state.isLoading = false;
          state.advertisements = action.payload;
          state.error = null;
        }
      )
      .addCase(getAdvertisements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch advertisements";
      })

      // Get Advertisement By ID
      .addCase(getAdvertisementById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getAdvertisementById.fulfilled,
        (state, action: PayloadAction<Advertisement>) => {
          state.isLoading = false;
          state.currentAdvertisement = action.payload;
          state.error = null;
        }
      )
      .addCase(getAdvertisementById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch advertisement";
      })

      // Create Advertisement
      .addCase(createAdvertisement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createAdvertisement.fulfilled,
        (state, action: PayloadAction<Advertisement>) => {
          state.isLoading = false;
          state.advertisements.push(action.payload);
          state.error = null;
        }
      )
      .addCase(createAdvertisement.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create advertisement";
      })

      // Update Advertisement
      .addCase(updateAdvertisement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateAdvertisement.fulfilled,
        (state, action: PayloadAction<Advertisement>) => {
          state.isLoading = false;
          const index = state.advertisements.findIndex(
            (ad) => ad.id === action.payload.id
          );
          if (index !== -1) {
            state.advertisements[index] = action.payload;
          }
          if (state.currentAdvertisement?.id === action.payload.id) {
            state.currentAdvertisement = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updateAdvertisement.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update advertisement";
      })

      // Toggle Advertisement Active
      .addCase(toggleAdvertisementActive.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        toggleAdvertisementActive.fulfilled,
        (state, action: PayloadAction<Advertisement>) => {
          state.isLoading = false;
          const index = state.advertisements.findIndex(
            (ad) => ad.id === action.payload.id
          );
          if (index !== -1) {
            state.advertisements[index] = action.payload;
          }
          if (state.currentAdvertisement?.id === action.payload.id) {
            state.currentAdvertisement = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(toggleAdvertisementActive.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to toggle advertisement status";
      })

      // Delete Advertisement
      .addCase(deleteAdvertisement.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteAdvertisement.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.advertisements = state.advertisements.filter(
            (ad) => ad.id !== action.payload
          );
          if (state.currentAdvertisement?.id === action.payload) {
            state.currentAdvertisement = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteAdvertisement.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete advertisement";
      });
  },
});

export const {
  clearError,
  clearCurrentAdvertisement,
  setCurrentAdvertisement,
} = advertisementsSlice.actions;
export default advertisementsSlice.reducer;
