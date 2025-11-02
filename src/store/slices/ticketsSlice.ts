import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface TicketMessage {
  id: string;
  senderUserId: string;
  content: string;
  createdAt?: string;
}

export interface Ticket {
  id: string;
  subject: string;
  createdByUserId: string;
  priority: string;
  status: string;
  assignedToUserId?: string;
  messages?: TicketMessage[];
}

export interface TicketsState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  limit: number;
}

export interface CreateTicketData {
  subject: string;
  createdByUserId: string;
  priority: string;
}

export interface UpdateTicketStatusData {
  status: string;
}

export interface AssignTicketData {
  ticketId: string;
  assignedToUserId: string;
}

export interface AddTicketMessageData {
  ticketId: string;
  senderUserId: string;
  content: string;
}

export interface GetTicketsParams {
  page?: number;
  limit?: number;
}

// Initial state
const initialState: TicketsState = {
  tickets: [],
  currentTicket: null,
  isLoading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  limit: 20,
};

// Async thunks
export const getTickets = createAsyncThunk<
  Ticket[],
  GetTicketsParams | void,
  { rejectValue: string }
>("tickets/getTickets", async (params, { rejectWithValue }) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const url = `${API_CONFIG.ENDPOINTS.TICKETS.LIST}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch tickets"
    );
  }
});

export const getTicketById = createAsyncThunk<
  Ticket,
  string,
  { rejectValue: string }
>("tickets/getTicketById", async (id, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.TICKETS.DETAIL(id)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to fetch ticket"
    );
  }
});

export const createTicket = createAsyncThunk<
  Ticket,
  CreateTicketData,
  { rejectValue: string }
>("tickets/createTicket", async (ticketData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.TICKETS.BASE,
      ticketData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to create ticket"
    );
  }
});

export const updateTicketStatus = createAsyncThunk<
  Ticket,
  { id: string; data: UpdateTicketStatusData },
  { rejectValue: string }
>("tickets/updateTicketStatus", async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(
      API_CONFIG.ENDPOINTS.TICKETS.UPDATE_STATUS(id),
      data
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to update ticket status"
    );
  }
});

export const assignTicket = createAsyncThunk<
  any,
  AssignTicketData,
  { rejectValue: string }
>("tickets/assignTicket", async (assignData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.TICKETS.ASSIGN,
      assignData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to assign ticket"
    );
  }
});

export const addTicketMessage = createAsyncThunk<
  TicketMessage,
  AddTicketMessageData,
  { rejectValue: string }
>("tickets/addMessage", async (messageData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.TICKETS.ADD_MESSAGE,
      messageData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to add message"
    );
  }
});

export const getTicketMessages = createAsyncThunk<
  TicketMessage[],
  string,
  { rejectValue: string }
>("tickets/getTicketMessages", async (ticketId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.TICKETS.GET_MESSAGES(ticketId)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch ticket messages"
    );
  }
});

// Tickets slice
const ticketsSlice = createSlice({
  name: "tickets",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTicket: (state) => {
      state.currentTicket = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Tickets
      .addCase(getTickets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getTickets.fulfilled,
        (state, action: PayloadAction<Ticket[]>) => {
          state.isLoading = false;
          state.tickets = action.payload;
          state.error = null;
        }
      )
      .addCase(getTickets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch tickets";
      })

      // Get Ticket By ID
      .addCase(getTicketById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getTicketById.fulfilled,
        (state, action: PayloadAction<Ticket>) => {
          state.isLoading = false;
          state.currentTicket = action.payload;
          state.error = null;
        }
      )
      .addCase(getTicketById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch ticket";
      })

      // Create Ticket
      .addCase(createTicket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        createTicket.fulfilled,
        (state, action: PayloadAction<Ticket>) => {
          state.isLoading = false;
          state.tickets.unshift(action.payload);
          state.error = null;
        }
      )
      .addCase(createTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create ticket";
      })

      // Update Ticket Status
      .addCase(updateTicketStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateTicketStatus.fulfilled,
        (state, action: PayloadAction<Ticket>) => {
          state.isLoading = false;
          const index = state.tickets.findIndex(
            (t) => t.id === action.payload.id
          );
          if (index !== -1) {
            state.tickets[index] = action.payload;
          }
          if (state.currentTicket?.id === action.payload.id) {
            state.currentTicket = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updateTicketStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update ticket status";
      })

      // Assign Ticket
      .addCase(assignTicket.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignTicket.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(assignTicket.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to assign ticket";
      })

      // Add Ticket Message
      .addCase(addTicketMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        addTicketMessage.fulfilled,
        (state, action: PayloadAction<TicketMessage>) => {
          state.isLoading = false;
          if (state.currentTicket) {
            if (!state.currentTicket.messages) {
              state.currentTicket.messages = [];
            }
            state.currentTicket.messages.push(action.payload);
          }
          state.error = null;
        }
      )
      .addCase(addTicketMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to add message";
      })

      // Get Ticket Messages
      .addCase(getTicketMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getTicketMessages.fulfilled,
        (state, action: PayloadAction<TicketMessage[]>) => {
          state.isLoading = false;
          if (state.currentTicket) {
            state.currentTicket.messages = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(getTicketMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch ticket messages";
      });
  },
});

export const { clearError, clearCurrentTicket, setCurrentPage, setLimit } =
  ticketsSlice.actions;
export default ticketsSlice.reducer;
