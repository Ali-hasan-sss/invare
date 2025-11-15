import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export interface ChatMessage {
  id: string;
  senderUserId: string;
  content: string;
  createdAt?: string;
  isPending?: boolean; // For optimistic updates
}

export interface Chat {
  id: string;
  topic: string;
  createdByUserId: string;
  participantUserIds?: string[];
  participants?: Array<{
    user?: {
      id: string;
      firstName?: string;
      lastName?: string;
      email?: string;
    };
    userId?: string;
  }>;
  listing?: {
    id: string;
    title: string;
    sellerUser?: {
      id: string;
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  };
  status: string;
  messages?: ChatMessage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateChatData {
  topic: string;
  createdByUserId: string;
  participantUserIds?: string[];
  listingId?: string;
}

export interface UpdateChatStatusData {
  status: string;
}

export interface AddChatMessageData {
  chatId: string;
  senderUserId: string;
  content: string;
}

// Initial state
const initialState: ChatState = {
  chats: [],
  currentChat: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getUserChats = createAsyncThunk<
  Chat[],
  string,
  { rejectValue: string }
>("chat/getUserChats", async (userId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.CHAT.GET_BY_USER(userId)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to fetch chats"
    );
  }
});

export const createChat = createAsyncThunk<
  Chat,
  CreateChatData,
  { rejectValue: string }
>("chat/createChat", async (chatData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.CHAT.BASE,
      chatData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to create chat"
    );
  }
});

export const updateChatStatus = createAsyncThunk<
  Chat,
  { chatId: string; data: UpdateChatStatusData },
  { rejectValue: string }
>("chat/updateChatStatus", async ({ chatId, data }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(
      API_CONFIG.ENDPOINTS.CHAT.UPDATE_STATUS(chatId),
      data
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to update chat status"
    );
  }
});

export const addChatMessage = createAsyncThunk<
  ChatMessage,
  AddChatMessageData,
  { rejectValue: string }
>("chat/addMessage", async (messageData, { rejectWithValue }) => {
  try {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.CHAT.ADD_MESSAGE,
      messageData
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to add message"
    );
  }
});

export const getChatMessages = createAsyncThunk<
  ChatMessage[],
  string,
  { rejectValue: string }
>("chat/getChatMessages", async (chatId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.CHAT.GET_MESSAGES(chatId)
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message ||
        error.message ||
        "Failed to fetch chat messages"
    );
  }
});

// Chat slice
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentChat: (state) => {
      state.currentChat = null;
    },
    setCurrentChat: (state, action: PayloadAction<Chat>) => {
      state.currentChat = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get User Chats
      .addCase(getUserChats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getUserChats.fulfilled,
        (state, action: PayloadAction<Chat[]>) => {
          state.isLoading = false;
          state.chats = action.payload;
          state.error = null;
        }
      )
      .addCase(getUserChats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch chats";
      })

      // Create Chat
      .addCase(createChat.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createChat.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        // Transform API response to Chat format
        const chatData = action.payload;
        const transformedChat: Chat = {
          id: chatData.id,
          topic: chatData.topic,
          status: chatData.status,
          createdByUserId:
            chatData.createdBy?.id ||
            chatData.createdByUserId ||
            chatData.createdByUser?.id,
          participantUserIds:
            chatData.participants?.map((p: any) => p.user?.id || p.userId) ||
            chatData.participantUserIds ||
            [],
          messages: chatData.messages || [],
        };
        state.chats.unshift(transformedChat);
        state.currentChat = transformedChat;
        state.error = null;
      })
      .addCase(createChat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create chat";
      })

      // Update Chat Status
      .addCase(updateChatStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        updateChatStatus.fulfilled,
        (state, action: PayloadAction<Chat>) => {
          state.isLoading = false;
          const index = state.chats.findIndex(
            (c) => c.id === action.payload.id
          );
          if (index !== -1) {
            state.chats[index] = action.payload;
          }
          if (state.currentChat?.id === action.payload.id) {
            state.currentChat = action.payload;
          }
          state.error = null;
        }
      )
      .addCase(updateChatStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to update chat status";
      })

      // Add Chat Message
      .addCase(addChatMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(
        addChatMessage.fulfilled,
        (state, action: PayloadAction<any>) => {
          if (state.currentChat) {
            if (!state.currentChat.messages) {
              state.currentChat.messages = [];
            }
            // Transform API response to ChatMessage format
            const transformedMessage: ChatMessage = {
              id: action.payload.id,
              senderUserId:
                action.payload.sender?.id ||
                action.payload.senderUserId ||
                action.payload.senderId,
              content: action.payload.content,
              createdAt: action.payload.createdAt,
            };
            // Check if message already exists (from pending) to avoid duplicates
            const messageExists = state.currentChat.messages.some(
              (msg) => msg.id === transformedMessage.id
            );
            if (!messageExists) {
              state.currentChat.messages.push(transformedMessage);
            }
          }
          state.error = null;
        }
      )
      .addCase(addChatMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to add message";
      })

      // Get Chat Messages
      .addCase(getChatMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        getChatMessages.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.isLoading = false;
          if (state.currentChat) {
            // Transform API response to ChatMessage format
            // API returns messages with sender object, we need senderUserId
            const transformedMessages: ChatMessage[] = action.payload.map(
              (msg: any) => ({
                id: msg.id,
                senderUserId:
                  msg.sender?.id || msg.senderUserId || msg.senderId,
                content: msg.content,
                createdAt: msg.createdAt,
              })
            );
            state.currentChat.messages = transformedMessages;
          }
          state.error = null;
        }
      )
      .addCase(getChatMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch chat messages";
      });
  },
});

export const { clearError, clearCurrentChat, setCurrentChat } =
  chatSlice.actions;
export default chatSlice.reducer;
