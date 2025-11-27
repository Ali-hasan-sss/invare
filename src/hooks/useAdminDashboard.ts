import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchAdminDashboard,
  clearError,
} from "../store/slices/adminDashboardSlice";

export const useAdminDashboard = () => {
  const dispatch = useAppDispatch();
  const dashboardState = useAppSelector((state) => state.adminDashboard);

  const getDashboardStats = useCallback(async () => {
    return dispatch(fetchAdminDashboard());
  }, [dispatch]);

  const clearDashboardError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    stats: dashboardState.stats,
    isLoading: dashboardState.isLoading,
    error: dashboardState.error,
    lastUpdated: dashboardState.lastUpdated,
    getDashboardStats,
    clearError: clearDashboardError,
  };
};

export default useAdminDashboard;
