import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient from "../../lib/apiClient";
import { API_CONFIG } from "../../config/api";

// Types
export type MessageType =
  | "text"
  | "image"
  | "video"
  | "audio"
  | "voice"
  | "file";

export interface ChatMessage {
  id: string;
  senderUserId: string;
  content: string;
  type: MessageType; // Message type according to API
  // Attachment fields (for non-text messages)
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentMimeType?: string;
  attachmentSize?: number; // Size in bytes
  attachmentDuration?: number; // Duration in seconds (for audio/video/voice)
  // Legacy fields for backward compatibility
  imageUrl?: string;
  imageThumbnailUrl?: string;
  messageType?: MessageType; // Deprecated, use type instead
  createdAt?: string;
  isPending?: boolean; // For optimistic updates
  // Sender info (from API)
  sender?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
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
  type?: MessageType; // Message type: text (default), image, video, audio, voice, file
  // Attachment fields (required for non-text messages)
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentMimeType?: string;
  attachmentSize?: number;
  attachmentDuration?: number; // For audio/video/voice
  // Legacy fields
  imageFile?: File; // For backward compatibility, will be uploaded first
  imageUrl?: string;
  imageThumbnailUrl?: string;
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

// Upload attachment file first, then send message
export const uploadChatAttachment = createAsyncThunk<
  {
    attachmentUrl: string;
    attachmentName: string;
    attachmentMimeType: string;
    attachmentSize: number;
    type: MessageType;
  },
  { chatId: string; file: File; type: MessageType },
  { rejectValue: string }
>(
  "chat/uploadAttachment",
  async ({ chatId, file, type }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.CHAT.UPLOAD_ATTACHMENT(chatId, type),
        formData
      );

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload attachment"
      );
    }
  }
);

export const addChatMessage = createAsyncThunk<
  ChatMessage,
  AddChatMessageData & { imageFile?: File },
  { rejectValue: string }
>("chat/addMessage", async (messageData, { rejectWithValue }) => {
  try {
    // If image file is provided, upload it first
    if (messageData.imageFile) {
      // Upload the file first
      const uploadResponse = await apiClient.post(
        API_CONFIG.ENDPOINTS.CHAT.UPLOAD_ATTACHMENT(
          messageData.chatId,
          "image"
        ),
        (() => {
          const formData = new FormData();
          formData.append("file", messageData.imageFile!);
          return formData;
        })()
      );

      const attachmentData = uploadResponse.data;

      // Now send the message with attachment data
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.CHAT.ADD_MESSAGE,
        {
          chatId: messageData.chatId,
          senderUserId: messageData.senderUserId,
          content: messageData.content || "",
          type: "image",
          attachmentUrl: attachmentData.attachmentUrl,
          attachmentName: attachmentData.attachmentName,
          attachmentMimeType: attachmentData.attachmentMimeType,
          attachmentSize: attachmentData.attachmentSize,
        }
      );

      return response.data;
    } else {
      // Regular JSON request for text messages or messages with already uploaded attachments
      const requestBody: any = {
        chatId: messageData.chatId,
        senderUserId: messageData.senderUserId,
        content: messageData.content,
        type: messageData.type || "text",
      };

      // Add attachment fields if provided
      if (messageData.attachmentUrl) {
        requestBody.attachmentUrl = messageData.attachmentUrl;
        requestBody.attachmentName = messageData.attachmentName;
        requestBody.attachmentMimeType = messageData.attachmentMimeType;
        requestBody.attachmentSize = messageData.attachmentSize;
        if (messageData.attachmentDuration !== undefined) {
          requestBody.attachmentDuration = messageData.attachmentDuration;
        }
      }

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.CHAT.ADD_MESSAGE,
        requestBody
      );

      return response.data;
    }
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
    // Add real-time message from FCM
    addRealtimeMessage: (
      state,
      action: PayloadAction<{ chatId: string; message: ChatMessage }>
    ) => {
      const { chatId, message } = action.payload;

      // Add to current chat if it matches
      if (state.currentChat?.id === chatId) {
        if (!state.currentChat.messages) {
          state.currentChat.messages = [];
        }
        // Check if message already exists to avoid duplicates
        const messageExists = state.currentChat.messages.some(
          (msg) => msg.id === message.id
        );
        if (!messageExists) {
          state.currentChat.messages.push(message);
        }
      }

      // Also update in chats list if the chat exists there
      const chatIndex = state.chats.findIndex((c) => c.id === chatId);
      if (chatIndex !== -1) {
        if (!state.chats[chatIndex].messages) {
          state.chats[chatIndex].messages = [];
        }
        const messageExists = state.chats[chatIndex].messages?.some(
          (msg) => msg.id === message.id
        );
        if (!messageExists) {
          state.chats[chatIndex].messages?.push(message);
        }
      }
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
              content: action.payload.content || "",
              type: action.payload.type || "text",
              attachmentUrl: action.payload.attachmentUrl,
              attachmentName: action.payload.attachmentName,
              attachmentMimeType: action.payload.attachmentMimeType,
              attachmentSize: action.payload.attachmentSize,
              attachmentDuration: action.payload.attachmentDuration,
              // Legacy fields for backward compatibility
              imageUrl: action.payload.attachmentUrl || action.payload.imageUrl,
              imageThumbnailUrl: action.payload.imageThumbnailUrl,
              messageType: action.payload.type || action.payload.messageType,
              createdAt: action.payload.createdAt,
              sender: action.payload.sender,
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
            const transformedMessages: ChatMessage[] = action.payload.map(
              (msg: any) => ({
                id: msg.id,
                senderUserId:
                  msg.sender?.id || msg.senderUserId || msg.senderId,
                content: msg.content || "",
                type: msg.type || "text",
                attachmentUrl: msg.attachmentUrl,
                attachmentName: msg.attachmentName,
                attachmentMimeType: msg.attachmentMimeType,
                attachmentSize: msg.attachmentSize,
                attachmentDuration: msg.attachmentDuration,
                // Legacy fields for backward compatibility
                imageUrl: msg.attachmentUrl || msg.imageUrl,
                imageThumbnailUrl: msg.imageThumbnailUrl,
                messageType: msg.type || msg.messageType,
                createdAt: msg.createdAt,
                sender: msg.sender,
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

export const {
  clearError,
  clearCurrentChat,
  setCurrentChat,
  addRealtimeMessage,
} = chatSlice.actions;
export default chatSlice.reducer;
