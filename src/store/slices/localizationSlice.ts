import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface LocalizationKey {
  id: string;
  keyName: string;
  description: string;
}

export interface TranslationResponse {
  languageCode: string;
  translations: Record<string, string>;
}

export interface LocalizationState {
  keys: LocalizationKey[];
  currentKey: LocalizationKey | null;
  translations: Record<string, string>;
  isLoading: boolean;
  error: string | null;
}

export interface CreateKeyData {
  keyName: string;
  description: string;
}

export interface CreateTranslationData {
  keyName: string;
  languageCode: string;
  value: string;
}

// Initial state
const initialState: LocalizationState = {
  keys: [],
  currentKey: null,
  translations: {},
  isLoading: false,
  error: null,
};

// Async thunks
export const getLocalizationKeys = createAsyncThunk<
  LocalizationKey[],
  void,
  { rejectValue: string }
>("localization/getKeys", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.LOCALIZATION.KEYS_LIST
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch localization keys"
    );
  }
});

export const createLocalizationKey = createAsyncThunk<
  LocalizationKey,
  CreateKeyData,
  { rejectValue: string }
>("localization/createKey", async (keyData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.LOCALIZATION.KEYS_BASE,
      keyData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to create localization key"
    );
  }
});

export const createTranslation = createAsyncThunk<
  any,
  CreateTranslationData,
  { rejectValue: string }
>(
  "localization/createTranslation",
  async (translationData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.LOCALIZATION.TRANSLATE,
        translationData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create translation"
      );
    }
  }
);

export const getTranslationsByLang = createAsyncThunk<
  TranslationResponse,
  string,
  { rejectValue: string }
>(
  "localization/getTranslationsByLang",
  async (languageCode, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.LOCALIZATION.GET_BY_LANG(languageCode)
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch translations"
      );
    }
  }
);

export const deleteLocalizationKey = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("localization/deleteKey", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.LOCALIZATION.KEY_DETAIL(id));
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete localization key"
    );
  }
});

// Localization slice
const localizationSlice = createSlice({
  name: "localization",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentKey: (state) => {
      state.currentKey = null;
    },
    setCurrentKey: (state, action: PayloadAction<LocalizationKey>) => {
      state.currentKey = action.payload;
    },
    clearTranslations: (state) => {
      state.translations = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Localization Keys
      .addCase(getLocalizationKeys.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getLocalizationKeys.fulfilled,
        (state, action: PayloadAction<LocalizationKey[]>) => {
          state.isLoading = false;
          state.keys = action.payload;
          state.error = null;
        }
      )
      .addCase(getLocalizationKeys.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch localization keys";
      })

      // Create Localization Key
      .addCase(createLocalizationKey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createLocalizationKey.fulfilled,
        (state, action: PayloadAction<LocalizationKey>) => {
          state.isLoading = false;
          state.keys.unshift(action.payload);
          state.error = null;
        }
      )
      .addCase(createLocalizationKey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create localization key";
      })

      // Create Translation
      .addCase(createTranslation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTranslation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(createTranslation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create translation";
      })

      // Get Translations By Language
      .addCase(getTranslationsByLang.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getTranslationsByLang.fulfilled,
        (state, action: PayloadAction<TranslationResponse>) => {
          state.isLoading = false;
          state.translations = action.payload.translations;
          state.error = null;
        }
      )
      .addCase(getTranslationsByLang.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch translations";
      })

      // Delete Localization Key
      .addCase(deleteLocalizationKey.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteLocalizationKey.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.keys = state.keys.filter((k) => k.id !== action.payload);
          if (state.currentKey?.id === action.payload) {
            state.currentKey = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteLocalizationKey.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete localization key";
      });
  },
});

export const { clearError, clearCurrentKey, setCurrentKey, clearTranslations } =
  localizationSlice.actions;
export default localizationSlice.reducer;
