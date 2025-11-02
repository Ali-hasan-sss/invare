import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface Country {
  id: string;
}

export interface CountrySetting {
  id: string;
  countryId: string;
  country?: Country;
  key: string;
  value: string;
}

export interface CountrySettingsState {
  settings: CountrySetting[];
  currentSetting: CountrySetting | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateCountrySettingData {
  countryId: string;
  key: string;
  value: string;
}

// Initial state
const initialState: CountrySettingsState = {
  settings: [],
  currentSetting: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getCountrySettings = createAsyncThunk<
  CountrySetting[],
  string,
  { rejectValue: string }
>(
  "countrySettings/getCountrySettings",
  async (countryId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.COUNTRY_SETTINGS.GET_BY_COUNTRY(countryId)
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch country settings"
      );
    }
  }
);

export const createCountrySetting = createAsyncThunk<
  CountrySetting,
  CreateCountrySettingData,
  { rejectValue: string }
>(
  "countrySettings/createCountrySetting",
  async (settingData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.COUNTRY_SETTINGS.BASE,
        settingData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create country setting"
      );
    }
  }
);

export const deleteCountrySetting = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("countrySettings/deleteCountrySetting", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.COUNTRY_SETTINGS.DETAIL(id));
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete country setting"
    );
  }
});

// Country Settings slice
const countrySettingsSlice = createSlice({
  name: "countrySettings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentSetting: (state) => {
      state.currentSetting = null;
    },
    setCurrentSetting: (state, action: PayloadAction<CountrySetting>) => {
      state.currentSetting = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Country Settings
      .addCase(getCountrySettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getCountrySettings.fulfilled,
        (state, action: PayloadAction<CountrySetting[]>) => {
          state.isLoading = false;
          state.settings = action.payload;
          state.error = null;
        }
      )
      .addCase(getCountrySettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch country settings";
      })

      // Create Country Setting
      .addCase(createCountrySetting.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createCountrySetting.fulfilled,
        (state, action: PayloadAction<CountrySetting>) => {
          state.isLoading = false;
          state.settings.push(action.payload);
          state.error = null;
        }
      )
      .addCase(createCountrySetting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create country setting";
      })

      // Delete Country Setting
      .addCase(deleteCountrySetting.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteCountrySetting.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.settings = state.settings.filter(
            (s) => s.id !== action.payload
          );
          if (state.currentSetting?.id === action.payload) {
            state.currentSetting = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteCountrySetting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete country setting";
      });
  },
});

export const { clearError, clearCurrentSetting, setCurrentSetting } =
  countrySettingsSlice.actions;
export default countrySettingsSlice.reducer;
