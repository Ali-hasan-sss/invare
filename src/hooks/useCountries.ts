import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
  clearError,
  clearCurrentCountry,
  CreateCountryData,
  UpdateCountryData,
} from "../store/slices/countriesSlice";

// Main countries hook
export const useCountries = () => {
  const dispatch = useAppDispatch();
  const countriesState = useAppSelector((state) => state.countries);

  // Get countries list
  const fetchCountries = useCallback(async () => {
    return dispatch(getCountries());
  }, [dispatch]);

  // Get country by ID
  const fetchCountryById = useCallback(
    async (id: string) => {
      return dispatch(getCountryById(id));
    },
    [dispatch]
  );

  // Create country
  const addCountry = useCallback(
    async (countryData: CreateCountryData) => {
      return dispatch(createCountry(countryData));
    },
    [dispatch]
  );

  // Update country
  const editCountry = useCallback(
    async (id: string, countryData: UpdateCountryData) => {
      return dispatch(updateCountry({ id, data: countryData }));
    },
    [dispatch]
  );

  // Delete country
  const removeCountry = useCallback(
    async (id: string) => {
      return dispatch(deleteCountry(id));
    },
    [dispatch]
  );

  // Clear error
  const clearCountriesError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear current country
  const clearCountry = useCallback(() => {
    dispatch(clearCurrentCountry());
  }, [dispatch]);

  return {
    // State
    countries: countriesState.countries,
    currentCountry: countriesState.currentCountry,
    isLoading: countriesState.isLoading,
    error: countriesState.error,

    // Actions
    getCountries: fetchCountries,
    getCountryById: fetchCountryById,
    createCountry: addCountry,
    updateCountry: editCountry,
    deleteCountry: removeCountry,
    clearError: clearCountriesError,
    clearCurrentCountry: clearCountry,
  };
};

// Hook for countries list only
export const useCountriesList = () => {
  const { countries, isLoading, error, getCountries } = useCountries();

  return {
    countries,
    isLoading,
    error,
    getCountries,
  };
};

// Hook for current country only
export const useCurrentCountry = () => {
  const {
    currentCountry,
    isLoading,
    error,
    getCountryById,
    clearCurrentCountry,
  } = useCountries();

  return {
    currentCountry,
    isLoading,
    error,
    getCountryById,
    clearCurrentCountry,
  };
};

// Hook for country actions only
export const useCountryActions = () => {
  const { createCountry, updateCountry, deleteCountry, clearError } =
    useCountries();

  return {
    createCountry,
    updateCountry,
    deleteCountry,
    clearError,
  };
};

export default useCountries;
