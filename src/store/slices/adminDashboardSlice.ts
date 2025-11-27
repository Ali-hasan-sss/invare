import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

export interface AdminDashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalListings: number;
  activeListings: number;
  totalIncome: number;
}

interface AdminDashboardState {
  stats: AdminDashboardStats;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialStats: AdminDashboardStats = {
  totalUsers: 0,
  totalCompanies: 0,
  totalListings: 0,
  activeListings: 0,
  totalIncome: 0,
};

const initialState: AdminDashboardState = {
  stats: initialStats,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

export const fetchAdminDashboard = createAsyncThunk<
  AdminDashboardStats,
  void,
  { rejectValue: string }
>("adminDashboard/fetch", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to load dashboard metrics"
    );
  }
});

const adminDashboardSlice = createSlice({
  name: "adminDashboard",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchAdminDashboard.fulfilled,
        (state, action: PayloadAction<AdminDashboardStats>) => {
          state.isLoading = false;
          state.stats = action.payload;
          state.lastUpdated = new Date().toISOString();
          state.error = null;
        }
      )
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to load dashboard metrics";
      });
  },
});

export const { clearError } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;


