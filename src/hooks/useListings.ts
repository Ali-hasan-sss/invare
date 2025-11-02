import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  clearError,
  clearCurrentListing,
  setCurrentPage,
  setLimit,
  CreateListingData,
  UpdateListingData,
  GetListingsParams,
} from "../store/slices/listingsSlice";

// Main listings hook
export const useListings = () => {
  const dispatch = useAppDispatch();
  const listingsState = useAppSelector((state) => state.listings);

  // Get listings list
  const fetchListings = useCallback(
    async (params?: GetListingsParams) => {
      return dispatch(getListings(params));
    },
    [dispatch]
  );

  // Get listing by ID
  const fetchListingById = useCallback(
    async (id: string) => {
      return dispatch(getListingById(id));
    },
    [dispatch]
  );

  // Create listing
  const addListing = useCallback(
    async (listingData: CreateListingData) => {
      return dispatch(createListing(listingData));
    },
    [dispatch]
  );

  // Update listing
  const editListing = useCallback(
    async (id: string, listingData: UpdateListingData) => {
      return dispatch(updateListing({ id, data: listingData }));
    },
    [dispatch]
  );

  // Delete listing
  const removeListing = useCallback(
    async (id: string) => {
      return dispatch(deleteListing(id));
    },
    [dispatch]
  );

  // Clear error
  const clearListingsError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear current listing
  const clearListing = useCallback(() => {
    dispatch(clearCurrentListing());
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

  return {
    // State
    listings: listingsState.listings,
    currentListing: listingsState.currentListing,
    isLoading: listingsState.isLoading,
    error: listingsState.error,
    totalCount: listingsState.totalCount,
    currentPage: listingsState.currentPage,
    limit: listingsState.limit,

    // Actions
    getListings: fetchListings,
    getListingById: fetchListingById,
    createListing: addListing,
    updateListing: editListing,
    deleteListing: removeListing,
    clearError: clearListingsError,
    clearCurrentListing: clearListing,
    setCurrentPage: changePage,
    setLimit: changeLimit,
  };
};

// Hook for listings list only
export const useListingsList = () => {
  const { listings, isLoading, error, getListings } = useListings();

  return {
    listings,
    isLoading,
    error,
    getListings,
  };
};

// Hook for current listing only
export const useCurrentListing = () => {
  const {
    currentListing,
    isLoading,
    error,
    getListingById,
    clearCurrentListing,
  } = useListings();

  return {
    currentListing,
    isLoading,
    error,
    getListingById,
    clearCurrentListing,
  };
};

// Hook for listing actions only
export const useListingActions = () => {
  const { createListing, updateListing, deleteListing, clearError } =
    useListings();

  return {
    createListing,
    updateListing,
    deleteListing,
    clearError,
  };
};

export default useListings;
