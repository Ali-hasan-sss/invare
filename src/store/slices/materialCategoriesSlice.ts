import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface MaterialCategoryTranslation {
  name?: string;
}

export interface MaterialCategoryTranslations {
  [lang: string]: MaterialCategoryTranslation | undefined;
}

export interface MaterialCategory {
  id: string;
  name: string;
  i18n?: MaterialCategoryTranslations;
}

export interface MaterialCategoriesState {
  categories: MaterialCategory[];
  currentCategory: MaterialCategory | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateMaterialCategoryData {
  name: string;
  i18n?: MaterialCategoryTranslations;
}

export interface UpdateMaterialCategoryData {
  name?: string;
  i18n?: MaterialCategoryTranslations;
}

export interface GetMaterialCategoriesParams {
  lang?: string;
}

// Initial state
const initialState: MaterialCategoriesState = {
  categories: [],
  currentCategory: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getMaterialCategories = createAsyncThunk<
  MaterialCategory[],
  GetMaterialCategoriesParams | void,
  { rejectValue: string }
>(
  "materialCategories/getMaterialCategories",
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.lang) queryParams.append("lang", params.lang);

      const url = `${API_CONFIG.ENDPOINTS.MATERIAL_CATEGORIES.LIST}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch material categories"
      );
    }
  }
);

export const createMaterialCategory = createAsyncThunk<
  MaterialCategory,
  CreateMaterialCategoryData,
  { rejectValue: string }
>(
  "materialCategories/createMaterialCategory",
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.MATERIAL_CATEGORIES.BASE,
        categoryData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create material category"
      );
    }
  }
);

export const updateMaterialCategory = createAsyncThunk<
  MaterialCategory,
  { id: string; data: UpdateMaterialCategoryData },
  { rejectValue: string }
>(
  "materialCategories/updateMaterialCategory",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        API_CONFIG.ENDPOINTS.MATERIAL_CATEGORIES.DETAIL(id),
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to update material category"
      );
    }
  }
);

export const deleteMaterialCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "materialCategories/deleteMaterialCategory",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(
        API_CONFIG.ENDPOINTS.MATERIAL_CATEGORIES.DETAIL(id)
      );
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete material category"
      );
    }
  }
);

// Material Categories slice
const materialCategoriesSlice = createSlice({
  name: "materialCategories",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    setCurrentCategory: (state, action: PayloadAction<MaterialCategory>) => {
      state.currentCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Material Categories
      .addCase(getMaterialCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getMaterialCategories.fulfilled,
        (state, action: PayloadAction<MaterialCategory[]>) => {
          state.isLoading = false;
          state.categories = action.payload;
          state.error = null;
        }
      )
      .addCase(getMaterialCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch material categories";
      })

      // Create Material Category
      .addCase(createMaterialCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createMaterialCategory.fulfilled,
        (state, action: PayloadAction<MaterialCategory>) => {
          state.isLoading = false;
          state.categories.unshift(action.payload);
          state.error = null;
        }
      )
      .addCase(createMaterialCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create material category";
      })

      // Update Material Category
      .addCase(updateMaterialCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateMaterialCategory.fulfilled,
        (state, action: PayloadAction<MaterialCategory>) => {
          state.isLoading = false;
          const index = state.categories.findIndex(
            (c) => c.id === action.payload.id
          );
          if (index !== -1) {
            state.categories[index] = action.payload;
          }
          if (state.currentCategory?.id === action.payload.id) {
            state.currentCategory = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updateMaterialCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update material category";
      })

      // Delete Material Category
      .addCase(deleteMaterialCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteMaterialCategory.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.categories = state.categories.filter(
            (c) => c.id !== action.payload
          );
          if (state.currentCategory?.id === action.payload) {
            state.currentCategory = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteMaterialCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete material category";
      });
  },
});

export const { clearError, clearCurrentCategory, setCurrentCategory } =
  materialCategoriesSlice.actions;
export default materialCategoriesSlice.reducer;
