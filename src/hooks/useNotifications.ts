import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearError,
  incrementUnreadCount,
  decrementUnreadCount,
} from "../store/slices/notificationsSlice";

// Main notifications hook
export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const notificationsState = useAppSelector((state) => state.notifications);

  // Get notifications list
  const fetchNotifications = useCallback(async () => {
    return dispatch(getNotifications());
  }, [dispatch]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (id: string) => {
      return dispatch(markNotificationAsRead(id));
    },
    [dispatch]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    return dispatch(markAllNotificationsAsRead());
  }, [dispatch]);

  // Clear error
  const clearNotificationsError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Increment unread count
  const incrementUnread = useCallback(() => {
    dispatch(incrementUnreadCount());
  }, [dispatch]);

  // Decrement unread count
  const decrementUnread = useCallback(() => {
    dispatch(decrementUnreadCount());
  }, [dispatch]);

  return {
    // State
    notifications: notificationsState.notifications,
    isLoading: notificationsState.isLoading,
    error: notificationsState.error,
    unreadCount: notificationsState.unreadCount,

    // Actions
    getNotifications: fetchNotifications,
    markNotificationAsRead: markAsRead,
    markAllNotificationsAsRead: markAllAsRead,
    clearError: clearNotificationsError,
    incrementUnreadCount: incrementUnread,
    decrementUnreadCount: decrementUnread,
  };
};

// Hook for notifications list only
export const useNotificationsList = () => {
  const { notifications, isLoading, error, unreadCount, getNotifications } =
    useNotifications();

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    getNotifications,
  };
};

// Hook for notification actions only
export const useNotificationActions = () => {
  const { markNotificationAsRead, markAllNotificationsAsRead, clearError } =
    useNotifications();

  return {
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearError,
  };
};

export default useNotifications;
