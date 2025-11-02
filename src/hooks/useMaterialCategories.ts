import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getMaterialCategories,
  createMaterialCategory,
  updateMaterialCategory,
  deleteMaterialCategory,
  clearError,
  clearCurrentCategory,
  setCurrentCategory,
  CreateMaterialCategoryData,
  UpdateMaterialCategoryData,
} from "../store/slices/materialCategoriesSlice";

// Main material categories hook
export const useMaterialCategories = () => {
  const dispatch = useAppDispatch();
  const categoriesState = useAppSelector((state) => state.materialCategories);

  // Get material categories
  const fetchCategories = useCallback(async () => {
    return dispatch(getMaterialCategories());
  }, [dispatch]);

  // Create material category
  const addCategory = useCallback(
    async (categoryData: CreateMaterialCategoryData) => {
      return dispatch(createMaterialCategory(categoryData));
    },
    [dispatch]
  );

  // Update material category
  const editCategory = useCallback(
    async (id: string, categoryData: UpdateMaterialCategoryData) => {
      return dispatch(updateMaterialCategory({ id, data: categoryData }));
    },
    [dispatch]
  );

  // Delete material category
  const removeCategory = useCallback(
    async (id: string) => {
      return dispatch(deleteMaterialCategory(id));
    },
    [dispatch]
  );

  // Clear error
  const clearCategoriesError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear current category
  const clearCategory = useCallback(() => {
    dispatch(clearCurrentCategory());
  }, [dispatch]);

  // Set current category
  const selectCategory = useCallback(
    (category: any) => {
      dispatch(setCurrentCategory(category));
    },
    [dispatch]
  );

  return {
    // State
    categories: categoriesState.categories,
    currentCategory: categoriesState.currentCategory,
    isLoading: categoriesState.isLoading,
    error: categoriesState.error,

    // Actions
    getCategories: fetchCategories,
    createCategory: addCategory,
    updateCategory: editCategory,
    deleteCategory: removeCategory,
    clearError: clearCategoriesError,
    clearCurrentCategory: clearCategory,
    setCurrentCategory: selectCategory,
  };
};

// Hook for categories list only
export const useMaterialCategoriesList = () => {
  const { categories, isLoading, error, getCategories } =
    useMaterialCategories();

  return {
    categories,
    isLoading,
    error,
    getCategories,
  };
};

// Hook for current category only
export const useCurrentMaterialCategory = () => {
  const { currentCategory, setCurrentCategory, clearCurrentCategory } =
    useMaterialCategories();

  return {
    currentCategory,
    setCurrentCategory,
    clearCurrentCategory,
  };
};

// Hook for category actions only
export const useMaterialCategoryActions = () => {
  const { createCategory, updateCategory, deleteCategory, clearError } =
    useMaterialCategories();

  return {
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
  };
};

export default useMaterialCategories;
