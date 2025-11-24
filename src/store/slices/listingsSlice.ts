import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface MaterialTranslation {
  name?: string;
  unitOfMeasure?: string;
}

export interface MaterialTranslations {
  [lang: string]: MaterialTranslation | undefined;
}

export interface MaterialCategory {
  id: string;
  name: string;
  i18n?: {
    [lang: string]: { name?: string } | undefined;
  };
}

export interface Material {
  id: string;
  name: string;
  unitOfMeasure?: string;
  categoryId?: string;
  categoryName?: string;
  category?: MaterialCategory;
  i18n?: MaterialTranslations;
}

export interface Seller {
  id: string;
  companyName?: string;
  email?: string;
}

export interface Photo {
  id: string;
  url: string;
}

export interface Attribute {
  id: string;
  name: string;
  value: string;
}

export interface ListingLocalization {
  title?: string;
  description?: string;
  unitOfMeasure?: string;
}

export interface ListingTranslations {
  [lang: string]: ListingLocalization | undefined;
}

export interface Listing {
  id: string;
  title: string;
  description?: string;
  unitOfMeasure: string;
  startingPrice: string;
  stockAmount: number;
  status: string;
  expiresAt?: string;
  isBiddable: boolean;
  condition?: string;
  materialColor?: string;
  materialId: string;
  material?: Material;
  sellerCompanyId?: string;
  sellerUserId?: string;
  seller?: Seller;
  photos?: Photo[];
  attributes?: Attribute[];
  i18n?: ListingTranslations;
}

export interface ListingsState {
  listings: Listing[];
  currentListing: Listing | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  limit: number;
}

export interface ListingPhotoInput {
  url: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ListingAttributeInput {
  attrKey: string;
  attrValue: string;
}

export interface CreateListingData {
  title: string;
  description?: string;
  unitOfMeasure: string;
  startingPrice: string;
  stockAmount: number;
  status: string;
  expiresAt?: string;
  isBiddable: boolean;
  condition?: string;
  materialColor?: string;
  materialId: string;
  sellerCompanyId?: string;
  sellerUserId?: string;
  photos?: ListingPhotoInput[];
  attributes?: ListingAttributeInput[];
  i18n?: ListingTranslations;
}

export interface UpdateListingData {
  title?: string;
  description?: string;
  unitOfMeasure?: string;
  startingPrice?: string;
  stockAmount?: number;
  status?: string;
  expiresAt?: string;
  isBiddable?: boolean;
  condition?: string;
  materialColor?: string;
  materialId?: string;
  sellerCompanyId?: string;
  sellerUserId?: string;
  photos?: ListingPhotoInput[];
  attributes?: ListingAttributeInput[];
  i18n?: ListingTranslations;
}

export interface GetListingsParams {
  page?: number;
  limit?: number;
  materialId?: string;
  companyId?: string;
  userId?: string;
  isBiddable?: boolean;
  status?: string;
  condition?: string;
  materialColor?: string;
  onlyActive?: boolean;
  lang?: string;
}

export interface GetListingByIdParams {
  id: string;
  lang?: string;
}

export interface GetMyListingsParams {
  page?: number;
  limit?: number;
  status?: string;
  lang?: string;
}

// Initial state
const initialState: ListingsState = {
  listings: [],
  currentListing: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  limit: 20,
};

// Async thunks
export const getListings = createAsyncThunk<
  Listing[],
  GetListingsParams | void,
  { rejectValue: string }
>("listings/getListings", async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.materialId) queryParams.append("materialId", params.materialId);
    if (params?.companyId) queryParams.append("companyId", params.companyId);
    if (params?.userId) queryParams.append("userId", params.userId);
    if (params?.isBiddable !== undefined) {
      queryParams.append("isBiddable", params.isBiddable.toString());
    }
    if (params?.status) {
      queryParams.append("status", params.status);
    }
    if (params?.condition) {
      queryParams.append("condition", params.condition);
    }
    if (params?.materialColor) {
      queryParams.append("materialColor", params.materialColor);
    }
    if (params?.onlyActive) {
      queryParams.append("onlyActive", params.onlyActive.toString());
    }
    if (params?.lang) {
      queryParams.append("lang", params.lang);
    }

    const url = `${API_CONFIG.ENDPOINTS.LISTINGS.LIST}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch listings"
    );
  }
});

export const getListingById = createAsyncThunk<
  Listing,
  GetListingByIdParams,
  { rejectValue: string }
>("listings/getListingById", async ({ id, lang }, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (lang) queryParams.append("lang", lang);
    const url = `${API_CONFIG.ENDPOINTS.LISTINGS.DETAIL(id)}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch listing"
    );
  }
});

export const createListing = createAsyncThunk<
  Listing,
  CreateListingData,
  { rejectValue: string }
>("listings/createListing", async (listingData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.LISTINGS.BASE,
      listingData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to create listing"
    );
  }
});

export const updateListing = createAsyncThunk<
  Listing,
  { id: string; data: UpdateListingData },
  { rejectValue: string }
>("listings/updateListing", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(
      API_CONFIG.ENDPOINTS.LISTINGS.DETAIL(id),
      data
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to update listing"
    );
  }
});

export const deleteListing = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("listings/deleteListing", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.LISTINGS.DETAIL(id));
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete listing"
    );
  }
});

export const getMyListings = createAsyncThunk<
  Listing[],
  GetMyListingsParams | undefined,
  { rejectValue: string }
>("listings/getMyListings", async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    // Don't send lang parameter to get i18n object with both languages

    const url = `${API_CONFIG.ENDPOINTS.LISTINGS.ME_USER}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch my listings"
    );
  }
});

export const getMyUserListings = createAsyncThunk<
  Listing[],
  GetMyListingsParams | undefined,
  { rejectValue: string }
>("listings/getMyUserListings", async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    // Don't send lang parameter to get i18n object with both languages

    const url = `${API_CONFIG.ENDPOINTS.LISTINGS.ME_USER}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch my user listings"
    );
  }
});

export const getMyCompanyListings = createAsyncThunk<
  Listing[],
  GetMyListingsParams | undefined,
  { rejectValue: string }
>("listings/getMyCompanyListings", async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.lang) queryParams.append("lang", params.lang);

    const url = `${API_CONFIG.ENDPOINTS.LISTINGS.ME_COMPANY}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch my company listings"
    );
  }
});

// Listings slice
const listingsSlice = createSlice({
  name: "listings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentListing: (state) => {
      state.currentListing = null;
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
      // Get Listings
      .addCase(getListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getListings.fulfilled,
        (state, action: PayloadAction<Listing[]>) => {
          state.isLoading = false;
          state.listings = action.payload;
          state.error = null;
        }
      )
      .addCase(getListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch listings";
      })

      // Get My Listings
      .addCase(getMyListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getMyListings.fulfilled,
        (state, action: PayloadAction<Listing[]>) => {
          state.isLoading = false;
          state.listings = action.payload;
          state.error = null;
        }
      )
      .addCase(getMyListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch my listings";
      })

      // Get My User Listings
      .addCase(getMyUserListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getMyUserListings.fulfilled,
        (state, action: PayloadAction<Listing[]>) => {
          state.isLoading = false;
          state.listings = action.payload;
          state.error = null;
        }
      )
      .addCase(getMyUserListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch my user listings";
      })

      // Get My Company Listings
      .addCase(getMyCompanyListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getMyCompanyListings.fulfilled,
        (state, action: PayloadAction<Listing[]>) => {
          state.isLoading = false;
          state.listings = action.payload;
          state.error = null;
        }
      )
      .addCase(getMyCompanyListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch my company listings";
      })

      // Get Listing By ID
      .addCase(getListingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getListingById.fulfilled,
        (state, action: PayloadAction<Listing>) => {
          state.isLoading = false;
          state.currentListing = action.payload;
          state.error = null;
        }
      )
      .addCase(getListingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch listing";
      })

      // Create Listing
      .addCase(createListing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createListing.fulfilled,
        (state, action: PayloadAction<Listing>) => {
          state.isLoading = false;
          state.listings.unshift(action.payload);
          state.error = null;
        }
      )
      .addCase(createListing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create listing";
      })

      // Update Listing
      .addCase(updateListing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateListing.fulfilled,
        (state, action: PayloadAction<Listing>) => {
          state.isLoading = false;
          const index = state.listings.findIndex(
            (l) => l.id === action.payload.id
          );
          if (index !== -1) {
            state.listings[index] = action.payload;
          }
          if (state.currentListing?.id === action.payload.id) {
            state.currentListing = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updateListing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update listing";
      })

      // Delete Listing
      .addCase(deleteListing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteListing.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.listings = state.listings.filter(
            (l) => l.id !== action.payload
          );
          if (state.currentListing?.id === action.payload) {
            state.currentListing = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteListing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete listing";
      });
  },
});

export const { clearError, clearCurrentListing, setCurrentPage, setLimit } =
  listingsSlice.actions;
export default listingsSlice.reducer;
