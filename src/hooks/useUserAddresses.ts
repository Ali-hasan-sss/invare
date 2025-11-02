import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getUserAddresses,
  createUserAddress,
  deleteUserAddress,
  clearError,
  clearCurrentAddress,
  setCurrentAddress,
  CreateUserAddressData,
} from "../store/slices/userAddressesSlice";

// Main user addresses hook
export const useUserAddresses = () => {
  const dispatch = useAppDispatch();
  const addressesState = useAppSelector((state) => state.userAddresses);

  // Get user addresses
  const fetchUserAddresses = useCallback(
    async (userId: string) => {
      return dispatch(getUserAddresses(userId));
    },
    [dispatch]
  );

  // Create user address
  const addUserAddress = useCallback(
    async (addressData: CreateUserAddressData) => {
      return dispatch(createUserAddress(addressData));
    },
    [dispatch]
  );

  // Delete user address
  const removeUserAddress = useCallback(
    async (id: string) => {
      return dispatch(deleteUserAddress(id));
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
    getUserAddresses: fetchUserAddresses,
    createUserAddress: addUserAddress,
    deleteUserAddress: removeUserAddress,
    clearError: clearAddressesError,
    clearCurrentAddress: clearAddress,
    setCurrentAddress: selectAddress,
  };
};

// Hook for addresses list only
export const useUserAddressesList = () => {
  const { addresses, isLoading, error, getUserAddresses } = useUserAddresses();

  return {
    addresses,
    isLoading,
    error,
    getUserAddresses,
  };
};

// Hook for current address only
export const useCurrentUserAddress = () => {
  const { currentAddress, setCurrentAddress, clearCurrentAddress } =
    useUserAddresses();

  return {
    currentAddress,
    setCurrentAddress,
    clearCurrentAddress,
  };
};

// Hook for address actions only
export const useUserAddressActions = () => {
  const { createUserAddress, deleteUserAddress, clearError } =
    useUserAddresses();

  return {
    createUserAddress,
    deleteUserAddress,
    clearError,
  };
};

export default useUserAddresses;
