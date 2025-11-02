import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface Listing {
  id: string;
}

export interface Bidder {
  id: string;
}

export interface Bid {
  id: string;
  amount: string;
  listingId: string;
  listing?: Listing;
  bidderCompanyId?: string;
  bidderUserId?: string;
  bidder?: Bidder;
  createdAt?: string;
}

export interface BidsState {
  bids: Bid[];
  currentBid: Bid | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateBidData {
  amount: string;
  listingId: string;
  bidderCompanyId?: string;
}

// Initial state
const initialState: BidsState = {
  bids: [],
  currentBid: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getListingBids = createAsyncThunk<
  Bid[],
  string,
  { rejectValue: string }
>("bids/getListingBids", async (listingId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.BIDS.GET_BY_LISTING(listingId)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to fetch bids"
    );
  }
});

export const getBidById = createAsyncThunk<
  Bid,
  string,
  { rejectValue: string }
>("bids/getBidById", async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.BIDS.DETAIL(id));
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to fetch bid"
    );
  }
});

export const createBid = createAsyncThunk<
  Bid,
  CreateBidData,
  { rejectValue: string }
>("bids/createBid", async (bidData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.BIDS.BASE,
      bidData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to create bid"
    );
  }
});

export const deleteBid = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("bids/deleteBid", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.BIDS.DETAIL(id));
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to delete bid"
    );
  }
});

// Bids slice
const bidsSlice = createSlice({
  name: "bids",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBid: (state) => {
      state.currentBid = null;
    },
    setCurrentBid: (state, action: PayloadAction<Bid>) => {
      state.currentBid = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Listing Bids
      .addCase(getListingBids.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getListingBids.fulfilled,
        (state, action: PayloadAction<Bid[]>) => {
          state.isLoading = false;
          state.bids = action.payload;
          state.error = null;
        }
      )
      .addCase(getListingBids.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch bids";
      })

      // Get Bid By ID
      .addCase(getBidById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBidById.fulfilled, (state, action: PayloadAction<Bid>) => {
        state.isLoading = false;
        state.currentBid = action.payload;
        state.error = null;
      })
      .addCase(getBidById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch bid";
      })

      // Create Bid
      .addCase(createBid.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBid.fulfilled, (state, action: PayloadAction<Bid>) => {
        state.isLoading = false;
        state.bids.unshift(action.payload);
        state.error = null;
      })
      .addCase(createBid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create bid";
      })

      // Delete Bid
      .addCase(deleteBid.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBid.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.bids = state.bids.filter((bid) => bid.id !== action.payload);
        if (state.currentBid?.id === action.payload) {
          state.currentBid = null;
        }
        state.error = null;
      })
      .addCase(deleteBid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete bid";
      });
  },
});

export const { clearError, clearCurrentBid, setCurrentBid } = bidsSlice.actions;
export default bidsSlice.reducer;
