import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  getUserChats,
  createChat,
  updateChatStatus,
  addChatMessage,
  getChatMessages,
  clearError,
  clearCurrentChat,
  setCurrentChat,
  type CreateChatData,
  type UpdateChatStatusData,
  type AddChatMessageData,
  type Chat,
} from "@/store/slices/chatSlice";

export const useChat = () => {
  const dispatch = useAppDispatch();
  const chatState = useAppSelector((state) => state.chat);

  // Get user chats
  const fetchUserChats = useCallback(
    async (userId: string) => {
      return dispatch(getUserChats(userId));
    },
    [dispatch]
  );

  // Create new chat
  const createNewChat = useCallback(
    async (chatData: CreateChatData) => {
      return dispatch(createChat(chatData));
    },
    [dispatch]
  );

  // Update chat status
  const updateStatus = useCallback(
    async (chatId: string, data: UpdateChatStatusData) => {
      return dispatch(updateChatStatus({ chatId, data }));
    },
    [dispatch]
  );

  // Send message
  const sendMessage = useCallback(
    async (messageData: AddChatMessageData & { imageFile?: File }) => {
      return dispatch(addChatMessage(messageData));
    },
    [dispatch]
  );

  // Get chat messages
  const getMessages = useCallback(
    async (chatId: string) => {
      return dispatch(getChatMessages(chatId));
    },
    [dispatch]
  );

  // Clear error
  const clearChatError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear current chat
  const clearChat = useCallback(() => {
    dispatch(clearCurrentChat());
  }, [dispatch]);

  // Set current chat
  const setCurrentChatById = useCallback(
    (chat: Chat) => {
      dispatch(setCurrentChat(chat));
    },
    [dispatch]
  );

  return {
    // State
    chats: chatState.chats,
    currentChat: chatState.currentChat,
    isLoading: chatState.isLoading,
    error: chatState.error,

    // Actions
    fetchUserChats,
    createNewChat,
    updateStatus,
    sendMessage,
    getMessages,
    clearChatError,
    clearChat,
    setCurrentChatById,
  };
};

export default useChat;
