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

const shouldRetryWithAlternatePayload = (error: any) => {
  const messages = error?.response?.data?.message;
  if (Array.isArray(messages)) {
    return messages.some(
      (msg) =>
        typeof msg === "string" &&
        msg.toLowerCase().includes("property") &&
        msg.toLowerCase().includes("should not exist")
    );
  }
  if (typeof messages === "string") {
    const lower = messages.toLowerCase();
    return lower.includes("property") && lower.includes("should not exist");
  }
  return false;
};

const extractCategoryNames = (
  data: CreateMaterialCategoryData | UpdateMaterialCategoryData
) => {
  const i18n = (data as any)?.i18n || {};
  const baseName = (data as any)?.name;
  const englishName = (i18n?.en && i18n.en?.name) || baseName || "";
  const arabicName = (i18n?.ar && i18n.ar?.name) || "";

  return { baseName, englishName, arabicName };
};

const buildCategoryPayloadVariants = (
  data: CreateMaterialCategoryData | UpdateMaterialCategoryData
) => {
  const variants: Record<string, any>[] = [];
  const seen = new Set<string>();
  const addVariant = (payload: Record<string, any> | null | undefined) => {
    if (!payload || typeof payload !== "object") return;
    const serialized = JSON.stringify(payload);
    if (seen.has(serialized)) return;
    seen.add(serialized);
    variants.push(payload);
  };

  const { baseName, englishName, arabicName } = extractCategoryNames(data);

  // Build translations object
  const translations: Record<string, any> = {};
  if (englishName) {
    translations.en = { name: englishName };
  }
  if (arabicName) {
    translations.ar = { name: arabicName };
  }

  // Start with the original format as documented: { name, i18n }
  // This is what the API documentation says it expects
  const basePayload = JSON.parse(JSON.stringify(data || {}));
  // Clean the payload to ensure it matches the documented format
  const cleanBasePayload: Record<string, any> = {};
  if (basePayload.name) {
    cleanBasePayload.name = basePayload.name;
  } else if (baseName || englishName || arabicName) {
    cleanBasePayload.name = baseName || englishName || arabicName;
  }

  if (basePayload.i18n && Object.keys(basePayload.i18n).length > 0) {
    cleanBasePayload.i18n = basePayload.i18n;
  } else if (Object.keys(translations).length > 0) {
    cleanBasePayload.i18n = translations;
  }

  // Add the original format first (as per documentation)
  if (cleanBasePayload.name || cleanBasePayload.i18n) {
    addVariant(cleanBasePayload);
  }

  // Then try alternative formats
  // 1. Just translations object (direct)
  if (Object.keys(translations).length > 0) {
    addVariant({ translations });
  }

  // 2. Try with wrapper structures
  if (Object.keys(translations).length > 0) {
    // Try nested in category
    addVariant({
      category: {
        translations,
      },
    });
    // Try nested in data
    addVariant({
      data: {
        translations,
      },
    });
  }

  // 3. Try with categoryNameEn/Ar (but API rejected these, so try wrapped)
  const nameVariant: Record<string, any> = {};
  if (englishName) nameVariant.categoryNameEn = englishName;
  if (arabicName) nameVariant.categoryNameAr = arabicName;
  if (!nameVariant.categoryNameEn && baseName) {
    nameVariant.categoryName = baseName;
  } else if (!nameVariant.categoryName && englishName) {
    nameVariant.categoryName = englishName;
  } else if (!nameVariant.categoryName && arabicName) {
    nameVariant.categoryName = arabicName;
  }

  // Only try wrapped versions since direct was rejected
  if (Object.keys(nameVariant).length) {
    addVariant({ category: nameVariant });
    addVariant({ data: nameVariant });
  }

  // 4. Combined translations with nameVariant (wrapped)
  if (Object.keys(nameVariant).length && Object.keys(translations).length > 0) {
    addVariant({
      category: {
        ...nameVariant,
        translations,
      },
    });
    addVariant({
      data: {
        ...nameVariant,
        translations,
      },
    });
  }

  // 5. Finally, try the original format (name and i18n) as last resort (wrapped)
  const wrappedBasePayload = JSON.parse(JSON.stringify(data || {}));
  if (!seen.has(JSON.stringify(wrappedBasePayload))) {
    addVariant({ category: wrappedBasePayload });
    addVariant({ data: wrappedBasePayload });
  }

  return variants;
};

const buildAlternateCategoryPayload = (
  data: CreateMaterialCategoryData | UpdateMaterialCategoryData
) => {
  const { baseName, englishName, arabicName } = extractCategoryNames(data);
  const payload: Record<string, any> = {};

  // Set name field
  const nameValue = baseName || englishName || arabicName;
  if (nameValue) {
    payload.name = nameValue;
  }

  // Build i18n object only if we have translations
  const i18n: MaterialCategoryTranslations = {};
  if (englishName) {
    i18n.en = { name: englishName };
  }
  if (arabicName) {
    i18n.ar = { name: arabicName };
  }

  // Only include i18n if it has at least one translation
  if (Object.keys(i18n).length > 0) {
    payload.i18n = i18n;
  }

  return payload;
};

const submitCategoryWithVariants = async (
  method: "post" | "patch",
  url: string,
  originalData: CreateMaterialCategoryData | UpdateMaterialCategoryData
) => {
  const variants = buildCategoryPayloadVariants(originalData);
  const originalSignature = JSON.stringify(originalData ?? {});
  let lastError: any = null;

  // Try all variants, including the original if it's in the list
  for (const payload of variants) {
    try {
      const response =
        method === "post"
          ? await apiClient.post(url, payload)
          : await apiClient.patch(url, payload);
      return response.data;
    } catch (variantError: any) {
      lastError = variantError;
      // Continue to next variant if this one fails with "should not exist" error
      if (!shouldRetryWithAlternatePayload(variantError)) {
        // If it's not a "should not exist" error, we might want to stop
        // But for now, let's continue trying all variants
        continue;
      }
    }
  }

  // If all variants failed, throw the last error
  if (lastError) {
    throw lastError;
  }

  throw new Error("Failed to submit category with alternate payloads");
};

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
      // First, try the documented format directly: { name, i18n }
      // Clean the payload to match the exact format from documentation
      const cleanPayload: Record<string, any> = {
        name: categoryData.name,
      };

      if (categoryData.i18n && Object.keys(categoryData.i18n).length > 0) {
        // Clean i18n object to remove undefined values
        const cleanI18n: MaterialCategoryTranslations = {};
        Object.keys(categoryData.i18n).forEach((lang) => {
          const translation = categoryData.i18n![lang];
          if (translation && translation.name) {
            cleanI18n[lang] = { name: translation.name };
          }
        });

        if (Object.keys(cleanI18n).length > 0) {
          cleanPayload.i18n = cleanI18n;
        }
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.MATERIAL_CATEGORIES.BASE,
        cleanPayload
      );
      return response.data;
    } catch (error: any) {
      // If the documented format fails, try alternative formats
      if (shouldRetryWithAlternatePayload(error)) {
        try {
          // Try using submitCategoryWithVariants which tries multiple payload formats
          return await submitCategoryWithVariants(
            "post",
            API_CONFIG.ENDPOINTS.MATERIAL_CATEGORIES.BASE,
            categoryData
          );
        } catch (variantsError: any) {
          // If all variants fail, try the alternate payload format
          try {
            const alternatePayload =
              buildAlternateCategoryPayload(categoryData);
            const retryResponse = await apiClient.post(
              API_CONFIG.ENDPOINTS.MATERIAL_CATEGORIES.BASE,
              alternatePayload
            );
            return retryResponse.data;
          } catch (retryError: any) {
            return rejectWithValue(
              retryError.response?.data?.message ||
                retryError.message ||
                "Failed to create material category"
            );
          }
        }
      }
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
      if (shouldRetryWithAlternatePayload(error)) {
        try {
          const alternatePayload = buildAlternateCategoryPayload(data);
          const retryResponse = await apiClient.patch(
            API_CONFIG.ENDPOINTS.MATERIAL_CATEGORIES.DETAIL(id),
            alternatePayload
          );
          return retryResponse.data;
        } catch (retryError: any) {
          return rejectWithValue(
            retryError.response?.data?.message ||
              retryError.message ||
              "Failed to update material category"
          );
        }
      }
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
