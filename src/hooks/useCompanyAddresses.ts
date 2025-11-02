import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getCompanyAddresses,
  createCompanyAddress,
  deleteCompanyAddress,
  clearError,
  clearCurrentAddress,
  setCurrentAddress,
  CreateCompanyAddressData,
} from "../store/slices/companyAddressesSlice";

// Main company addresses hook
export const useCompanyAddresses = () => {
  const dispatch = useAppDispatch();
  const addressesState = useAppSelector((state) => state.companyAddresses);

  // Get company addresses
  const fetchCompanyAddresses = useCallback(
    async (companyId: string) => {
      return dispatch(getCompanyAddresses(companyId));
    },
    [dispatch]
  );

  // Create company address
  const addCompanyAddress = useCallback(
    async (addressData: CreateCompanyAddressData) => {
      return dispatch(createCompanyAddress(addressData));
    },
    [dispatch]
  );

  // Delete company address
  const removeCompanyAddress = useCallback(
    async (id: string) => {
      return dispatch(deleteCompanyAddress(id));
    },
    [dispatch]
  );

  // Clear error
  const clearAddressesError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear current address
  const clearAddress = useCallback(() => {
    dispatch(clearCurrentAddress());
  }, [dispatch]);

  // Set current address
  const selectAddress = useCallback(
    (address: any) => {
      dispatch(setCurrentAddress(address));
    },
    [dispatch]
  );

  return {
    // State
    addresses: addressesState.addresses,
    currentAddress: addressesState.currentAddress,
    isLoading: addressesState.isLoading,
    error: addressesState.error,

    // Actions
    getCompanyAddresses: fetchCompanyAddresses,
    createCompanyAddress: addCompanyAddress,
    deleteCompanyAddress: removeCompanyAddress,
    clearError: clearAddressesError,
    clearCurrentAddress: clearAddress,
    setCurrentAddress: selectAddress,
  };
};

// Hook for addresses list only
export const useCompanyAddressesList = () => {
  const { addresses, isLoading, error, getCompanyAddresses } =
    useCompanyAddresses();

  return {
    addresses,
    isLoading,
    error,
    getCompanyAddresses,
  };
};

// Hook for current address only
export const useCurrentCompanyAddress = () => {
  const { currentAddress, setCurrentAddress, clearCurrentAddress } =
    useCompanyAddresses();

  return {
    currentAddress,
    setCurrentAddress,
    clearCurrentAddress,
  };
};

// Hook for address actions only
export const useCompanyAddressActions = () => {
  const { createCompanyAddress, deleteCompanyAddress, clearError } =
    useCompanyAddresses();

  return {
    createCompanyAddress,
    deleteCompanyAddress,
    clearError,
  };
};

export default useCompanyAddresses;
