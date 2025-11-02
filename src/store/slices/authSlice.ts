import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isAdmin?: boolean;
}

export interface Company {
  id: string;
  companyName: string;
  vatNumber?: string;
  website?: string;
}

export interface AuthState {
  user: User | null;
  company: Company | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  otp: string;
}

export interface RegisterUserData {
  email: string;
  firstName: string;
  lastName: string;
  countryId?: string;
}

export interface RegisterCompanyData {
  companyName: string;
  vatNumber: string;
  website: string;
  countryId?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface RegisterResponse {
  id: string;
  email: string;
  accessToken?: string;
  user?: User;
}

// Initial state
const initialState: AuthState = {
  user: null,
  company: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginCredentials,
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    const data = response.data;

    // Store token and user data in localStorage and cookies
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Store in cookies for middleware access
      document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${
        7 * 24 * 60 * 60
      }`; // 7 days
      document.cookie = `user=${encodeURIComponent(
        JSON.stringify(data.user)
      )}; path=/; max-age=${7 * 24 * 60 * 60}`;
    }

    return data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Login failed"
    );
  }
});

export const registerUser = createAsyncThunk<
  RegisterResponse,
  RegisterUserData,
  { rejectValue: string }
>("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER_USER,
      userData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Registration failed"
    );
  }
});

export const registerCompany = createAsyncThunk<
  RegisterResponse,
  RegisterCompanyData,
  { rejectValue: string }
>("auth/registerCompany", async (companyData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER_COMPANY,
      companyData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Company registration failed"
    );
  }
});

export const getCurrentUser = createAsyncThunk<
  { user: User },
  void,
  { rejectValue: string }
>("auth/getCurrentUser", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUTH.ME);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to get user data"
    );
  }
});

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.company = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;

      // Clear localStorage and cookies
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        // Clear cookies
        document.cookie = "accessToken=; path=/; max-age=0";
        document.cookie = "user=; path=/; max-age=0";
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    initializeAuth: (state) => {
      // Initialize auth state from localStorage
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          try {
            const user = JSON.parse(userStr);
            state.accessToken = token;
            state.user = user;
            state.isAuthenticated = true;

            // Update cookies for middleware access
            document.cookie = `accessToken=${token}; path=/; max-age=${
              7 * 24 * 60 * 60
            }`; // 7 days
            document.cookie = `user=${encodeURIComponent(
              userStr
            )}; path=/; max-age=${7 * 24 * 60 * 60}`;
          } catch (error) {
            // Clear invalid data
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            document.cookie = "accessToken=; path=/; max-age=0";
            document.cookie = "user=; path=/; max-age=0";
          }
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isLoading = false;
          state.accessToken = action.payload.accessToken;
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
        state.isAuthenticated = false;
      })

      // Register User
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        registerUser.fulfilled,
        (state, action: PayloadAction<RegisterResponse>) => {
          state.isLoading = false;
          state.error = null;

          // If registration response includes token and user, log them in
          if (action.payload.accessToken && action.payload.user) {
            state.accessToken = action.payload.accessToken;
            state.user = action.payload.user;
            state.isAuthenticated = true;

            // Store in localStorage and cookies
            if (typeof window !== "undefined") {
              localStorage.setItem("accessToken", action.payload.accessToken);
              localStorage.setItem("user", JSON.stringify(action.payload.user));

              // Store in cookies for middleware access
              document.cookie = `accessToken=${
                action.payload.accessToken
              }; path=/; max-age=${7 * 24 * 60 * 60}`;
              document.cookie = `user=${encodeURIComponent(
                JSON.stringify(action.payload.user)
              )}; path=/; max-age=${7 * 24 * 60 * 60}`;
            }
          }
        }
      )
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed";
      })

      // Register Company
      .addCase(registerCompany.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        registerCompany.fulfilled,
        (state, action: PayloadAction<RegisterResponse>) => {
          state.isLoading = false;
          state.error = null;
          // Note: Registration doesn't automatically log in the user
        }
      )
      .addCase(registerCompany.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Company registration failed";
      })

      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getCurrentUser.fulfilled,
        (state, action: PayloadAction<{ user: User }>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.error = null;

          // Update localStorage and cookies
          if (typeof window !== "undefined") {
            const userStr = JSON.stringify(action.payload.user);
            localStorage.setItem("user", userStr);

            // Update cookies for middleware access
            document.cookie = `user=${encodeURIComponent(
              userStr
            )}; path=/; max-age=${7 * 24 * 60 * 60}`;
          }
        }
      )
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to get user data";
        state.isAuthenticated = false;
        // Clear invalid token
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
        }
      });
  },
});

export const { logout, clearError, initializeAuth } = authSlice.actions;
export default authSlice.reducer;
