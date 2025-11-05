import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type:
    | "order_paid"
    | "payment_failed"
    | "shipment_created"
    | "shipment_updated"
    | "order_status_changed"
    | "material_listing_added";
  read: boolean;
  order?: {
    id: string;
  };
  createdAt: string;
  readAt?: string;
}

export interface NotificationsState {
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
}

export interface MarkReadResponse {
  id: string;
  read: boolean;
  readAt: string;
}

// Initial state
const initialState: NotificationsState = {
  notifications: [],
  isLoading: false,
  error: null,
  unreadCount: 0,
};

// Async thunks
export const getNotifications = createAsyncThunk<
  Notification[],
  void,
  { rejectValue: string }
>("notifications/getNotifications", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch notifications"
    );
  }
});

export const markNotificationAsRead = createAsyncThunk<
  MarkReadResponse,
  string,
  { rejectValue: string }
>(
  "notifications/markAsRead",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(
        API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(id)
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to mark notification as read"
      );
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  "notifications/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.patch(
        API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
      );
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to mark all notifications as read"
      );
    }
  }
);

// Notifications slice
const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Notifications
      .addCase(getNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getNotifications.fulfilled,
        (state, action: PayloadAction<Notification[]>) => {
          state.isLoading = false;
          state.notifications = action.payload;
          state.unreadCount = action.payload.filter((n) => !n.read).length;
          state.error = null;
        }
      )
      .addCase(getNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch notifications";
      })

      // Mark Notification As Read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        markNotificationAsRead.fulfilled,
        (state, action: PayloadAction<MarkReadResponse>) => {
          state.isLoading = false;
          const index = state.notifications.findIndex(
            (n) => n.id === action.payload.id
          );
          if (index !== -1) {
            state.notifications[index].read = true;
            state.notifications[index].readAt = action.payload.readAt;
            if (state.unreadCount > 0) {
              state.unreadCount -= 1;
            }
          }
          state.error = null;
        }
      )
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to mark notification as read";
      })

      // Mark All Notifications As Read
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.isLoading = false;
        state.notifications = state.notifications.map((n) => ({
          ...n,
          read: true,
          readAt: n.readAt || new Date().toISOString(),
        }));
        state.unreadCount = 0;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || "Failed to mark all notifications as read";
      });
  },
});

export const { clearError, incrementUnreadCount, decrementUnreadCount } =
  notificationsSlice.actions;
export default notificationsSlice.reducer;

