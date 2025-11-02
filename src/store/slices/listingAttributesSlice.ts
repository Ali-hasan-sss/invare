import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface ListingAttribute {
  id: string;
  listingId: string;
  attrKey: string;
  attrValue: string;
}

export interface ListingAttributesState {
  attributes: ListingAttribute[];
  currentAttribute: ListingAttribute | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateListingAttributeData {
  listingId: string;
  attrKey: string;
  attrValue: string;
}

// Initial state
const initialState: ListingAttributesState = {
  attributes: [],
  currentAttribute: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getListingAttributes = createAsyncThunk<
  ListingAttribute[],
  string,
  { rejectValue: string }
>(
  "listingAttributes/getListingAttributes",
  async (listingId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.LISTING_ATTRIBUTES.GET_BY_LISTING(listingId)
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch listing attributes"
      );
    }
  }
);

export const createListingAttribute = createAsyncThunk<
  ListingAttribute,
  CreateListingAttributeData,
  { rejectValue: string }
>(
  "listingAttributes/createListingAttribute",
  async (attributeData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.LISTING_ATTRIBUTES.BASE,
        attributeData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create listing attribute"
      );
    }
  }
);

export const deleteListingAttribute = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "listingAttributes/deleteListingAttribute",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(
        API_CONFIG.ENDPOINTS.LISTING_ATTRIBUTES.DETAIL(id)
      );
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete listing attribute"
      );
    }
  }
);

// Listing Attributes slice
const listingAttributesSlice = createSlice({
  name: "listingAttributes",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAttribute: (state) => {
      state.currentAttribute = null;
    },
    setCurrentAttribute: (state, action: PayloadAction<ListingAttribute>) => {
      state.currentAttribute = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Listing Attributes
      .addCase(getListingAttributes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getListingAttributes.fulfilled,
        (state, action: PayloadAction<ListingAttribute[]>) => {
          state.isLoading = false;
          state.attributes = action.payload;
          state.error = null;
        }
      )
      .addCase(getListingAttributes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch listing attributes";
      })

      // Create Listing Attribute
      .addCase(createListingAttribute.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createListingAttribute.fulfilled,
        (state, action: PayloadAction<ListingAttribute>) => {
          state.isLoading = false;
          state.attributes.push(action.payload);
          state.error = null;
        }
      )
      .addCase(createListingAttribute.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create listing attribute";
      })

      // Delete Listing Attribute
      .addCase(deleteListingAttribute.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteListingAttribute.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.attributes = state.attributes.filter(
            (attr) => attr.id !== action.payload
          );
          if (state.currentAttribute?.id === action.payload) {
            state.currentAttribute = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteListingAttribute.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete listing attribute";
      });
  },
});

export const { clearError, clearCurrentAttribute, setCurrentAttribute } =
  listingAttributesSlice.actions;
export default listingAttributesSlice.reducer;
