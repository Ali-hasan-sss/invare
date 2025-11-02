import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface Company {
  id: string;
  companyName: string;
  vatNumber?: string;
  website?: string;
  verificationStatus?: string;
  countryId?: string;
  country?: {
    id: string;
    countryCode: string;
    countryName: string;
  };
  owner?: {
    id: string;
    email: string;
  };
}

export interface CompaniesState {
  companies: Company[];
  currentCompany: Company | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  limit: number;
}

export interface CreateCompanyData {
  companyName: string;
  vatNumber?: string;
  website?: string;
  verificationStatus?: string;
  countryId?: string;
}

export interface UpdateCompanyData {
  companyName?: string;
  vatNumber?: string;
  website?: string;
  verificationStatus?: string;
  countryId?: string;
}

export interface GetCompaniesParams {
  page?: number;
  limit?: number;
}

// Initial state
const initialState: CompaniesState = {
  companies: [],
  currentCompany: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  limit: 20,
};

// Async thunks
export const getCompanies = createAsyncThunk<
  Company[],
  GetCompaniesParams | void,
  { rejectValue: string }
>("companies/getCompanies", async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `${API_CONFIG.ENDPOINTS.COMPANIES.LIST}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch companies"
    );
  }
});

export const getCompanyById = createAsyncThunk<
  Company,
  string,
  { rejectValue: string }
>("companies/getCompanyById", async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.COMPANIES.DETAIL(id)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch company"
    );
  }
});

export const createCompany = createAsyncThunk<
  Company,
  CreateCompanyData,
  { rejectValue: string }
>("companies/createCompany", async (companyData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.COMPANIES.BASE,
      companyData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to create company"
    );
  }
});

export const updateCompany = createAsyncThunk<
  Company,
  { id: string; data: UpdateCompanyData },
  { rejectValue: string }
>("companies/updateCompany", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(
      API_CONFIG.ENDPOINTS.COMPANIES.DETAIL(id),
      data
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to update company"
    );
  }
});

export const deleteCompany = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("companies/deleteCompany", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.COMPANIES.DETAIL(id));
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete company"
    );
  }
});

// Companies slice
const companiesSlice = createSlice({
  name: "companies",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCompany: (state) => {
      state.currentCompany = null;
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
      // Get Companies
      .addCase(getCompanies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getCompanies.fulfilled,
        (state, action: PayloadAction<Company[]>) => {
          state.isLoading = false;
          state.companies = action.payload;
          state.error = null;
        }
      )
      .addCase(getCompanies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch companies";
      })

      // Get Company By ID
      .addCase(getCompanyById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getCompanyById.fulfilled,
        (state, action: PayloadAction<Company>) => {
          state.isLoading = false;
          state.currentCompany = action.payload;
          state.error = null;
        }
      )
      .addCase(getCompanyById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch company";
      })

      // Create Company
      .addCase(createCompany.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createCompany.fulfilled,
        (state, action: PayloadAction<Company>) => {
          state.isLoading = false;
          state.companies.unshift(action.payload);
          state.error = null;
        }
      )
      .addCase(createCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create company";
      })

      // Update Company
      .addCase(updateCompany.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateCompany.fulfilled,
        (state, action: PayloadAction<Company>) => {
          state.isLoading = false;
          const index = state.companies.findIndex(
            (c) => c.id === action.payload.id
          );
          if (index !== -1) {
            state.companies[index] = action.payload;
          }
          if (state.currentCompany?.id === action.payload.id) {
            state.currentCompany = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updateCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update company";
      })

      // Delete Company
      .addCase(deleteCompany.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteCompany.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.companies = state.companies.filter(
            (c) => c.id !== action.payload
          );
          if (state.currentCompany?.id === action.payload) {
            state.currentCompany = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete company";
      });
  },
});

export const { clearError, clearCurrentCompany, setCurrentPage, setLimit } =
  companiesSlice.actions;
export default companiesSlice.reducer;
