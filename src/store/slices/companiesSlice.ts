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
  myCompanies: Company[];
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

export interface CreateCompanyWithUserData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userCountryId?: string;
  companyName: string;
  vatNumber?: string;
  website?: string;
  companyCountryId?: string;
}

export interface GetCompaniesParams {
  page?: number;
  limit?: number;
}

// Initial state
const initialState: CompaniesState = {
  companies: [],
  currentCompany: null,
  myCompanies: [],
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

export const createCompanyWithUser = createAsyncThunk<
  Company,
  CreateCompanyWithUserData,
  { rejectValue: string }
>("companies/createCompanyWithUser", async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.COMPANIES.ADMIN_CREATE_WITH_USER,
      payload
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

export const getMyCompanies = createAsyncThunk<
  Company[],
  void,
  { rejectValue: string }
>("companies/getMyCompanies", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.COMPANIES.ME);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch companies"
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
          const myIndex = state.myCompanies.findIndex(
            (c) => c.id === action.payload.id
          );
          if (myIndex !== -1) {
            state.myCompanies[myIndex] = action.payload;
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
          state.myCompanies = state.myCompanies.filter(
            (c) => c.id !== action.payload
          );
          state.error = null;
        }
      )
      .addCase(deleteCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete company";
      })

      // Create Company With User
      .addCase(createCompanyWithUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createCompanyWithUser.fulfilled,
        (state, action: PayloadAction<Company>) => {
          state.isLoading = false;
          state.companies.unshift(action.payload);
          state.myCompanies.unshift(action.payload);
          state.error = null;
        }
      )
      .addCase(createCompanyWithUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create company";
      })

      // Get My Companies
      .addCase(getMyCompanies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getMyCompanies.fulfilled,
        (state, action: PayloadAction<Company[]>) => {
          state.isLoading = false;
          state.myCompanies = action.payload;
          state.error = null;
        }
      )
      .addCase(getMyCompanies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch companies";
      });
  },
});

export const { clearError, clearCurrentCompany, setCurrentPage, setLimit } =
  companiesSlice.actions;
export default companiesSlice.reducer;
