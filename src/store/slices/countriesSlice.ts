import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface Country {
  id: string;
  countryCode: string;
  countryName: string;
}

export interface CountriesState {
  countries: Country[];
  currentCountry: Country | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  limit: number;
}

export interface CreateCountryData {
  countryCode: string;
  countryName: string;
}

export interface UpdateCountryData {
  countryCode?: string;
  countryName?: string;
}

export interface GetCountriesParams {
  page?: number;
  limit?: number;
}

// Initial state
const initialState: CountriesState = {
  countries: [],
  currentCountry: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  limit: 20,
};

// Async thunks
export const getCountries = createAsyncThunk<
  Country[],
  GetCountriesParams | void,
  { rejectValue: string }
>("countries/getCountries", async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `${API_CONFIG.ENDPOINTS.COUNTRIES.LIST}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch countries"
    );
  }
});

export const getCountryById = createAsyncThunk<
  Country,
  string,
  { rejectValue: string }
>("countries/getCountryById", async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.COUNTRIES.DETAIL(id)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch country"
    );
  }
});

export const createCountry = createAsyncThunk<
  Country,
  CreateCountryData,
  { rejectValue: string }
>("countries/createCountry", async (countryData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.COUNTRIES.BASE,
      countryData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to create country"
    );
  }
});

export const updateCountry = createAsyncThunk<
  Country,
  { id: string; data: UpdateCountryData },
  { rejectValue: string }
>("countries/updateCountry", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(
      API_CONFIG.ENDPOINTS.COUNTRIES.DETAIL(id),
      data
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to update country"
    );
  }
});

export const deleteCountry = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("countries/deleteCountry", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.COUNTRIES.DETAIL(id));
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete country"
    );
  }
});

// Countries slice
const countriesSlice = createSlice({
  name: "countries",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCountry: (state) => {
      state.currentCountry = null;
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
      // Get Countries
      .addCase(getCountries.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getCountries.fulfilled,
        (state, action: PayloadAction<Country[]>) => {
          state.isLoading = false;
          state.countries = action.payload;
          state.error = null;
        }
      )
      .addCase(getCountries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch countries";
      })

      // Get Country By ID
      .addCase(getCountryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getCountryById.fulfilled,
        (state, action: PayloadAction<Country>) => {
          state.isLoading = false;
          state.currentCountry = action.payload;
          state.error = null;
        }
      )
      .addCase(getCountryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch country";
      })

      // Create Country
      .addCase(createCountry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createCountry.fulfilled,
        (state, action: PayloadAction<Country>) => {
          state.isLoading = false;
          state.countries.unshift(action.payload);
          state.error = null;
        }
      )
      .addCase(createCountry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create country";
      })

      // Update Country
      .addCase(updateCountry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateCountry.fulfilled,
        (state, action: PayloadAction<Country>) => {
          state.isLoading = false;
          const index = state.countries.findIndex(
            (c) => c.id === action.payload.id
          );
          if (index !== -1) {
            state.countries[index] = action.payload;
          }
          if (state.currentCountry?.id === action.payload.id) {
            state.currentCountry = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updateCountry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update country";
      })

      // Delete Country
      .addCase(deleteCountry.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteCountry.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.countries = state.countries.filter(
            (c) => c.id !== action.payload
          );
          if (state.currentCountry?.id === action.payload) {
            state.currentCountry = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteCountry.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete country";
      });
  },
});

export const { clearError, clearCurrentCountry, setCurrentPage, setLimit } =
  countriesSlice.actions;
export default countriesSlice.reducer;
