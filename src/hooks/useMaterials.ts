import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  addFavoriteMaterial,
  addFavoriteMaterialAdmin,
  getFavoriteMaterials,
  removeFavoriteMaterial,
  clearError,
  clearCurrentMaterial,
  setCurrentPage,
  setLimit,
  CreateMaterialData,
  UpdateMaterialData,
  GetMaterialsParams,
  GetMaterialByIdParams,
  AddFavoriteMaterialAdminParams,
} from "../store/slices/materialsSlice";

// Main materials hook
export const useMaterials = () => {
  const dispatch = useAppDispatch();
  const materialsState = useAppSelector((state) => state.materials);
  const currentLanguage = useAppSelector(
    (state) => state.language.currentLanguage
  );

  // Get materials list
  const fetchMaterials = useCallback(
    async (params?: GetMaterialsParams) => {
      const payload: GetMaterialsParams = {
        ...params,
        lang: params?.lang ?? currentLanguage.code,
      };
      return dispatch(getMaterials(payload));
    },
    [dispatch, currentLanguage.code]
  );

  // Get material by ID
  const fetchMaterialById = useCallback(
    async (id: string, lang?: string) => {
      const payload: GetMaterialByIdParams = {
        id,
        lang: lang ?? currentLanguage.code,
      };
      return dispatch(getMaterialById(payload));
    },
    [dispatch, currentLanguage.code]
  );

  // Create material
  const addMaterial = useCallback(
    async (materialData: CreateMaterialData) => {
      return dispatch(createMaterial(materialData));
    },
    [dispatch]
  );

  // Update material
  const editMaterial = useCallback(
    async (id: string, materialData: UpdateMaterialData) => {
      return dispatch(updateMaterial({ id, data: materialData }));
    },
    [dispatch]
  );

  // Delete material
  const removeMaterial = useCallback(
    async (id: string) => {
      return dispatch(deleteMaterial(id));
    },
    [dispatch]
  );

  // Clear error
  const clearMaterialsError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear current material
  const clearMaterial = useCallback(() => {
    dispatch(clearCurrentMaterial());
  }, [dispatch]);

  // Set current page
  const changePage = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page));
    },
    [dispatch]
  );

  // Set limit
  const changeLimit = useCallback(
    (limit: number) => {
      dispatch(setLimit(limit));
    },
    [dispatch]
  );

  // Add favorite material
  const addFavorite = useCallback(
    async (id: string) => {
      return dispatch(addFavoriteMaterial(id));
    },
    [dispatch]
  );

  // Get favorite materials
  const fetchFavorites = useCallback(async () => {
    return dispatch(getFavoriteMaterials());
  }, [dispatch]);

  // Remove favorite material
  const removeFavorite = useCallback(
    async (id: string) => {
      return dispatch(removeFavoriteMaterial(id));
    },
    [dispatch]
  );

  // Add favorite material admin (for specific user)
  const addFavoriteAdmin = useCallback(
    async (params: AddFavoriteMaterialAdminParams) => {
      return dispatch(addFavoriteMaterialAdmin(params));
    },
    [dispatch]
  );

  return {
    // State
    materials: materialsState.materials,
    favoriteMaterials: materialsState.favoriteMaterials,
    currentMaterial: materialsState.currentMaterial,
    isLoading: materialsState.isLoading,
    error: materialsState.error,
    totalCount: materialsState.totalCount,
    currentPage: materialsState.currentPage,
    limit: materialsState.limit,

    // Actions
    getMaterials: fetchMaterials,
    getMaterialById: fetchMaterialById,
    createMaterial: addMaterial,
    updateMaterial: editMaterial,
    deleteMaterial: removeMaterial,
    addFavoriteMaterial: addFavorite,
    addFavoriteMaterialAdmin: addFavoriteAdmin,
    getFavoriteMaterials: fetchFavorites,
    removeFavoriteMaterial: removeFavorite,
    clearError: clearMaterialsError,
    clearCurrentMaterial: clearMaterial,
    setCurrentPage: changePage,
    setLimit: changeLimit,
  };
};

// Hook for materials list only
export const useMaterialsList = () => {
  const { materials, isLoading, error, getMaterials } = useMaterials();

  return {
    materials,
    isLoading,
    error,
    getMaterials,
  };
};

// Hook for current material only
export const useCurrentMaterial = () => {
  const {
    currentMaterial,
    isLoading,
    error,
    getMaterialById,
    clearCurrentMaterial,
  } = useMaterials();

  return {
    currentMaterial,
    isLoading,
    error,
    getMaterialById,
    clearCurrentMaterial,
  };
};

// Hook for material actions only
export const useMaterialActions = () => {
  const { createMaterial, updateMaterial, deleteMaterial, clearError } =
    useMaterials();

  return {
    createMaterial,
    updateMaterial,
    deleteMaterial,
    clearError,
  };
};

export default useMaterials;
