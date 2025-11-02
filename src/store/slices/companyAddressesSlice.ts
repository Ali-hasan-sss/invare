import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface CompanyAddress {
  id: string;
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  countryId: string;
  isDefault: boolean;
  companyId: string;
}

export interface CompanyAddressesState {
  addresses: CompanyAddress[];
  currentAddress: CompanyAddress | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateCompanyAddressData {
  street: string;
  city: string;
  state?: string;
  postalCode: string;
  countryId: string;
  isDefault: boolean;
  companyId: string;
}

// Initial state
const initialState: CompanyAddressesState = {
  addresses: [],
  currentAddress: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getCompanyAddresses = createAsyncThunk<
  CompanyAddress[],
  string,
  { rejectValue: string }
>(
  "companyAddresses/getCompanyAddresses",
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.COMPANY_ADDRESSES.GET_BY_COMPANY(companyId)
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch company addresses"
      );
    }
  }
);

export const createCompanyAddress = createAsyncThunk<
  CompanyAddress,
  CreateCompanyAddressData,
  { rejectValue: string }
>(
  "companyAddresses/createCompanyAddress",
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.COMPANY_ADDRESSES.BASE,
        addressData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create company address"
      );
    }
  }
);

export const deleteCompanyAddress = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("companyAddresses/deleteCompanyAddress", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.COMPANY_ADDRESSES.DETAIL(id));
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete company address"
    );
  }
});

// Company Addresses slice
const companyAddressesSlice = createSlice({
  name: "companyAddresses",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAddress: (state) => {
      state.currentAddress = null;
    },
    setCurrentAddress: (state, action: PayloadAction<CompanyAddress>) => {
      state.currentAddress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Company Addresses
      .addCase(getCompanyAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getCompanyAddresses.fulfilled,
        (state, action: PayloadAction<CompanyAddress[]>) => {
          state.isLoading = false;
          state.addresses = action.payload;
          state.error = null;
        }
      )
      .addCase(getCompanyAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch company addresses";
      })

      // Create Company Address
      .addCase(createCompanyAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createCompanyAddress.fulfilled,
        (state, action: PayloadAction<CompanyAddress>) => {
          state.isLoading = false;
          state.addresses.push(action.payload);
          state.error = null;
        }
      )
      .addCase(createCompanyAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create company address";
      })

      // Delete Company Address
      .addCase(deleteCompanyAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteCompanyAddress.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.addresses = state.addresses.filter(
            (addr) => addr.id !== action.payload
          );
          if (state.currentAddress?.id === action.payload) {
            state.currentAddress = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteCompanyAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete company address";
      });
  },
});

export const { clearError, clearCurrentAddress, setCurrentAddress } =
  companyAddressesSlice.actions;
export default companyAddressesSlice.reducer;
