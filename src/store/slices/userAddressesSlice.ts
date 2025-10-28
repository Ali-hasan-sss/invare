import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface UserAddress {
  id: string;
  street: string;
  city: string;
  postalCode: string;
  countryId: string;
  isDefault: boolean;
  userId: string;
}

export interface UserAddressesState {
  addresses: UserAddress[];
  currentAddress: UserAddress | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateUserAddressData {
  street: string;
  city: string;
  postalCode: string;
  countryId: string;
  isDefault: boolean;
  userId: string;
}

// Initial state
const initialState: UserAddressesState = {
  addresses: [],
  currentAddress: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getUserAddresses = createAsyncThunk<
  UserAddress[],
  string,
  { rejectValue: string }
>("userAddresses/getUserAddresses", async (userId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.USER_ADDRESSES.GET_BY_USER(userId)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch user addresses"
    );
  }
});

export const createUserAddress = createAsyncThunk<
  UserAddress,
  CreateUserAddressData,
  { rejectValue: string }
>(
  "userAddresses/createUserAddress",
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.USER_ADDRESSES.BASE,
        addressData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create user address"
      );
    }
  }
);

export const deleteUserAddress = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("userAddresses/deleteUserAddress", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.USER_ADDRESSES.DETAIL(id));
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete user address"
    );
  }
});

// User Addresses slice
const userAddressesSlice = createSlice({
  name: "userAddresses",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAddress: (state) => {
      state.currentAddress = null;
    },
    setCurrentAddress: (state, action: PayloadAction<UserAddress>) => {
      state.currentAddress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get User Addresses
      .addCase(getUserAddresses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getUserAddresses.fulfilled,
        (state, action: PayloadAction<UserAddress[]>) => {
          state.isLoading = false;
          state.addresses = action.payload;
          state.error = null;
        }
      )
      .addCase(getUserAddresses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch user addresses";
      })

      // Create User Address
      .addCase(createUserAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createUserAddress.fulfilled,
        (state, action: PayloadAction<UserAddress>) => {
          state.isLoading = false;
          state.addresses.push(action.payload);
          state.error = null;
        }
      )
      .addCase(createUserAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create user address";
      })

      // Delete User Address
      .addCase(deleteUserAddress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteUserAddress.fulfilled,
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
      .addCase(deleteUserAddress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete user address";
      });
  },
});

export const { clearError, clearCurrentAddress, setCurrentAddress } =
  userAddressesSlice.actions;
export default userAddressesSlice.reducer;
