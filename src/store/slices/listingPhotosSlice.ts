import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface ListingPhoto {
  id: string;
  listingId: string;
  url: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface ListingPhotosState {
  photos: ListingPhoto[];
  currentPhoto: ListingPhoto | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateListingPhotoData {
  listingId: string;
  url: string;
  sortOrder?: number;
  isPrimary?: boolean;
}

// Initial state
const initialState: ListingPhotosState = {
  photos: [],
  currentPhoto: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getListingPhotos = createAsyncThunk<
  ListingPhoto[],
  string,
  { rejectValue: string }
>("listingPhotos/getListingPhotos", async (listingId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.LISTING_PHOTOS.GET_BY_LISTING(listingId)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch listing photos"
    );
  }
});

export const createListingPhoto = createAsyncThunk<
  ListingPhoto,
  CreateListingPhotoData,
  { rejectValue: string }
>(
  "listingPhotos/createListingPhoto",
  async (photoData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.LISTING_PHOTOS.BASE,
        photoData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to create listing photo"
      );
    }
  }
);

export const setPrimaryPhoto = createAsyncThunk<
  ListingPhoto,
  string,
  { rejectValue: string }
>("listingPhotos/setPrimaryPhoto", async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(
      API_CONFIG.ENDPOINTS.LISTING_PHOTOS.SET_PRIMARY(id)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to set primary photo"
    );
  }
});

export const deleteListingPhoto = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("listingPhotos/deleteListingPhoto", async (id, { rejectWithValue }) => {
  try {
    await apiClient.delete(API_CONFIG.ENDPOINTS.LISTING_PHOTOS.DETAIL(id));
    return id;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to delete listing photo"
    );
  }
});

// Listing Photos slice
const listingPhotosSlice = createSlice({
  name: "listingPhotos",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPhoto: (state) => {
      state.currentPhoto = null;
    },
    setCurrentPhoto: (state, action: PayloadAction<ListingPhoto>) => {
      state.currentPhoto = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Listing Photos
      .addCase(getListingPhotos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getListingPhotos.fulfilled,
        (state, action: PayloadAction<ListingPhoto[]>) => {
          state.isLoading = false;
          state.photos = action.payload;
          state.error = null;
        }
      )
      .addCase(getListingPhotos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch listing photos";
      })

      // Create Listing Photo
      .addCase(createListingPhoto.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createListingPhoto.fulfilled,
        (state, action: PayloadAction<ListingPhoto>) => {
          state.isLoading = false;
          state.photos.push(action.payload);
          state.error = null;
        }
      )
      .addCase(createListingPhoto.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create listing photo";
      })

      // Set Primary Photo
      .addCase(setPrimaryPhoto.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        setPrimaryPhoto.fulfilled,
        (state, action: PayloadAction<ListingPhoto>) => {
          state.isLoading = false;
          // Reset all photos to not primary
          state.photos = state.photos.map((photo) => ({
            ...photo,
            isPrimary: photo.id === action.payload.id,
          }));
          if (state.currentPhoto?.id === action.payload.id) {
            state.currentPhoto = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(setPrimaryPhoto.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to set primary photo";
      })

      // Delete Listing Photo
      .addCase(deleteListingPhoto.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        deleteListingPhoto.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isLoading = false;
          state.photos = state.photos.filter(
            (photo) => photo.id !== action.payload
          );
          if (state.currentPhoto?.id === action.payload) {
            state.currentPhoto = null;
          }
          state.error = null;
        }
      )
      .addCase(deleteListingPhoto.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to delete listing photo";
      });
  },
});

export const { clearError, clearCurrentPhoto, setCurrentPhoto } =
  listingPhotosSlice.actions;
export default listingPhotosSlice.reducer;
