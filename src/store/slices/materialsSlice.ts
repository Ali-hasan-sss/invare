import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface Material {
  id: string;
  name: string;
  unitOfMeasure: string;
  categoryId?: string;
}

export interface MaterialState {
  materials: Material[];
  currentMaterial: Material | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  limit: number;
}

export interface CreateMaterialData {
  name: string;
  unitOfMeasure: string;
  categoryId: string;
}

export interface UpdateMaterialData {
  name?: string;
  unitOfMeasure?: string;
  categoryId?: string;
}

export interface GetMaterialsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
}

// Initial state
const initialState: MaterialState = {
  materials: [],
  currentMaterial: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  limit: 20,
};

// Async thunks
export const getMaterials = createAsyncThunk<
  Material[],
  GetMaterialsParams | void,
  { rejectValue: string }
>("materials/getMaterials", async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.categoryId) queryParams.append("categoryId", params.categoryId);

    const url = `${API_CONFIG.ENDPOINTS.MATERIALS.LIST}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch materials"
    );
  }
});

export const getMaterialById = createAsyncThunk<
  Material,
  string,
  { rejectValue: string }
>("materials/getMaterialById", async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.MATERIALS.DETAIL(id)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch material"
    );
  }
});

export const createMaterial = createAsyncThunk<
  Material,
  CreateMaterialData,
  { rejectValue: string }
>("materials/createMaterial", async (materialData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.MATERIALS.BASE,
      materialData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to create material"
    );
  }
});

export const updateMaterial = createAsyncThunk<
  Material,
  { id: string; data: UpdateMaterialData },
  { rejectValue: string }
>("materials/updateMaterial", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(
      API_CONFIG.ENDPOINTS.MATERIALS.DETAIL(id),
      data
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to update material"
    );
  }
});

export const deleteMaterial = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("materials/deleteMaterial", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.MATERIALS.DETAIL(id));
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete material"
    );
  }
});

// Materials slice
const materialsSlice = createSlice({
  name: "materials",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentMaterial: (state) => {
      state.currentMaterial = null;
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
      // Get Materials
      .addCase(getMaterials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getMaterials.fulfilled,
        (state, action: PayloadAction<Material[]>) => {
          state.isLoading = false;
          state.materials = action.payload;
          state.error = null;
        }
      )
      .addCase(getMaterials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch materials";
      })

      // Get Material By ID
      .addCase(getMaterialById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getMaterialById.fulfilled,
        (state, action: PayloadAction<Material>) => {
          state.isLoading = false;
          state.currentMaterial = action.payload;
          state.error = null;
        }
      )
      .addCase(getMaterialById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch material";
      })

      // Create Material
      .addCase(createMaterial.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createMaterial.fulfilled,
        (state, action: PayloadAction<Material>) => {
          state.isLoading = false;
          state.materials.unshift(action.payload);
          state.error = null;
        }
      )
      .addCase(createMaterial.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create material";
      })

      // Update Material
      .addCase(updateMaterial.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateMaterial.fulfilled,
        (state, action: PayloadAction<Material>) => {
          state.isLoading = false;
          const index = state.materials.findIndex(
            (m) => m.id === action.payload.id
          );
          if (index !== -1) {
            state.materials[index] = action.payload;
          }
          if (state.currentMaterial?.id === action.payload.id) {
            state.currentMaterial = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updateMaterial.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update material";
      })

      // Delete Material
      .addCase(deleteMaterial.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteMaterial.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.materials = state.materials.filter(
            (m) => m.id !== action.payload
          );
          if (state.currentMaterial?.id === action.payload) {
            state.currentMaterial = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteMaterial.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete material";
      });
  },
});

export const { clearError, clearCurrentMaterial, setCurrentPage, setLimit } =
  materialsSlice.actions;
export default materialsSlice.reducer;
