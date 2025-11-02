import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getAdvertisements,
  getAdvertisementById,
  createAdvertisement,
  updateAdvertisement,
  toggleAdvertisementActive,
  deleteAdvertisement,
  clearError,
  clearCurrentAdvertisement,
  setCurrentAdvertisement,
  type CreateAdvertisementData,
  type UpdateAdvertisementData,
  type Advertisement,
} from "@/store/slices/advertisementsSlice";

export const useAdvertisements = () => {
  const dispatch = useAppDispatch();
  const advertisements = useAppSelector(
    (state) => state.advertisements.advertisements
  );
  const currentAdvertisement = useAppSelector(
    (state) => state.advertisements.currentAdvertisement
  );
  const isLoading = useAppSelector((state) => state.advertisements.isLoading);
  const error = useAppSelector((state) => state.advertisements.error);

  const fetchAdvertisements = useCallback(
    (activeOnly?: boolean) => {
      return dispatch(getAdvertisements({ activeOnly }));
    },
    [dispatch]
  );

  const fetchAdvertisementById = useCallback(
    (id: string) => {
      return dispatch(getAdvertisementById(id));
    },
    [dispatch]
  );

  const addAdvertisement = useCallback(
    (data: CreateAdvertisementData) => {
      return dispatch(createAdvertisement(data));
    },
    [dispatch]
  );

  const editAdvertisement = useCallback(
    (id: string, data: UpdateAdvertisementData) => {
      return dispatch(updateAdvertisement({ id, data }));
    },
    [dispatch]
  );

  const toggleActive = useCallback(
    (id: string) => {
      return dispatch(toggleAdvertisementActive(id));
    },
    [dispatch]
  );

  const removeAdvertisement = useCallback(
    (id: string) => {
      return dispatch(deleteAdvertisement(id));
    },
    [dispatch]
  );

  const clearAdvertisementError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearCurrent = useCallback(() => {
    dispatch(clearCurrentAdvertisement());
  }, [dispatch]);

  const setCurrent = useCallback(
    (advertisement: Advertisement) => {
      dispatch(setCurrentAdvertisement(advertisement));
    },
    [dispatch]
  );

  return {
    advertisements,
    currentAdvertisement,
    isLoading,
    error,
    fetchAdvertisements,
    fetchAdvertisementById,
    addAdvertisement,
    editAdvertisement,
    toggleActive,
    removeAdvertisement,
    clearAdvertisementError,
    clearCurrent,
    setCurrent,
  };
};
