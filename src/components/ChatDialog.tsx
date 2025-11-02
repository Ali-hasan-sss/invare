"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTranslation } from "@/hooks/useTranslation";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { Send, X, MessageCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/store/slices/chatSlice";

interface ChatDialogProps {
  open: boolean;
  onClose: () => void;
  sellerUserId: string;
  sellerName: string;
  listingTitle: string;
  listingId: string;
}

export const ChatDialog: React.FC<ChatDialogProps> = ({
  open,
  onClose,
  sellerUserId,
  sellerName,
  listingTitle,
  listingId,
}) => {
  const { t, currentLanguage } = useTranslation();
  const { user } = useAuth();
  const {
    currentChat,
    chats,
    isLoading,
    createNewChat,
    sendMessage,
    getMessages,
    fetchUserChats,
    setCurrentChatById,
  } = useChat();
  const [message, setMessage] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<
    Map<string, ChatMessage>
  >(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesLoadedRef = useRef<string | null>(null); // Track which chat's messages have been loaded
  const isRTL = currentLanguage.dir === "rtl";

  // Reset messages loaded ref when dialog closes
  useEffect(() => {
    if (!open) {
      messagesLoadedRef.current = null;
    }
  }, [open]);

  // Initialize or load chat when dialog opens
  useEffect(() => {
    const initializeChat = async () => {
      if (open && user) {
        setIsInitializing(true);
        try {
          // If currentChat is already set (e.g., from chats page), use it and load messages
          // This prevents creating a new chat when opening from chats page
          if (currentChat?.id) {
            // Chat is already set (from chats page), just load messages if not already loaded
            if (
              messagesLoadedRef.current !== currentChat.id &&
              (!currentChat.messages || currentChat.messages.length === 0)
            ) {
              await getMessages(currentChat.id);
              messagesLoadedRef.current = currentChat.id;
            }
            setIsInitializing(false);
            return;
          }

          // Otherwise, check if we need to create a new chat or find existing one
          // First, fetch all user chats
          const fetchResult = await fetchUserChats(user.id);

          // Get chats from the result
          let userChats: any[] = [];
          if (fetchResult.type.endsWith("/fulfilled") && fetchResult.payload) {
            userChats = Array.isArray(fetchResult.payload)
              ? fetchResult.payload
              : [];
          }
          // If fetch failed or returned no data, we'll create a new chat below

          // Check if a chat already exists for this listing and seller
          const existingChat: any = userChats.find((chat: any) => {
            // Check if chat has the same listing
            const hasListing = (chat as any).listing?.id === listingId;

            // Check if seller is a participant
            const hasSeller = (chat as any).participants?.some(
              (p: any) =>
                p.user?.id === sellerUserId || p.userId === sellerUserId
            );

            // Check if current user is a participant
            const hasCurrentUser =
              (chat as any).participants?.some(
                (p: any) => p.user?.id === user.id || p.userId === user.id
              ) ||
              (chat as any).createdBy?.id === user.id ||
              (chat as any).createdByUserId === user.id;

            return hasListing && hasSeller && hasCurrentUser;
          });

          if (existingChat) {
            // Use existing chat - transform and set it
            const transformedChat: any = {
              id: existingChat.id,
              topic: existingChat.topic,
              status: existingChat.status,
              createdByUserId:
                existingChat.createdBy?.id || existingChat.createdByUserId,
              participantUserIds:
                existingChat.participants?.map(
                  (p: any) => p.user?.id || p.userId
                ) ||
                existingChat.participantUserIds ||
                [],
              participants: existingChat.participants,
              listing: existingChat.listing,
              messages: existingChat.messages || [],
            };
            setCurrentChatById(transformedChat);
            // Load messages for existing chat
            if (messagesLoadedRef.current !== existingChat.id) {
              await getMessages(existingChat.id);
              messagesLoadedRef.current = existingChat.id;
            }
          } else {
            // Create a new chat with the seller
            await createNewChat({
              topic: listingTitle,
              createdByUserId: user.id,
              participantUserIds: [user.id, sellerUserId],
              listingId: listingId,
            });
            // currentChat is automatically set by Redux reducer after createChat.fulfilled
          }
        } catch (error) {
          console.error("Failed to initialize chat:", error);
        } finally {
          setIsInitializing(false);
        }
      }
    };

    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    user?.id,
    sellerUserId,
    listingTitle,
    listingId,
    // Note: chats is not included in dependencies to avoid infinite loop
    // We use fetchUserChats result directly instead of state
  ]);

  // Load messages when chat is set (only if not already loading in initializeChat)
  useEffect(() => {
    // Only load messages if chat was set externally (e.g., from chats page)
    // and we haven't already loaded them in initializeChat
    if (
      currentChat?.id &&
      !isInitializing &&
      messagesLoadedRef.current !== currentChat.id &&
      (!currentChat.messages || currentChat.messages.length === 0)
    ) {
      messagesLoadedRef.current = currentChat.id;
      getMessages(currentChat.id);
    }
  }, [currentChat?.id, getMessages, isInitializing]);

  // Scroll to bottom when chat messages are first loaded
  useEffect(() => {
    if (
      currentChat?.messages &&
      currentChat.messages.length > 0 &&
      !isInitializing &&
      !isLoading
    ) {
      const timeoutId = setTimeout(() => {
        if (messagesContainerRef.current && messagesEndRef.current) {
          const container = messagesContainerRef.current;
          const hasOverflow = container.scrollHeight > container.clientHeight;
          if (hasOverflow) {
            // Use auto instead of smooth for initial load
            messagesEndRef.current.scrollIntoView({ behavior: "auto" });
          }
        }
      }, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [currentChat?.id, isInitializing, isLoading]);

  // Remove pending messages when actual messages arrive from API
  useEffect(() => {
    if (
      currentChat?.messages &&
      currentChat.messages.length > 0 &&
      pendingMessages.size > 0
    ) {
      // Check if any pending message content matches a new message from API
      setPendingMessages((prev) => {
        const newMap = new Map(prev);
        currentChat.messages?.forEach((actualMsg) => {
          // Remove pending messages with matching content and sender
          // Check all pending messages, not just those from current user
          Array.from(newMap.entries()).forEach(([tempId, pendingMsg]) => {
            if (
              pendingMsg.senderUserId === actualMsg.senderUserId &&
              pendingMsg.content.trim() === actualMsg.content.trim()
            ) {
              // Match found - remove pending message
              newMap.delete(tempId);
            }
          });
        });
        return newMap;
      });
    }
  }, [currentChat?.messages, pendingMessages.size]);

  // Merge and sort all messages (actual + pending), excluding duplicates
  const allMessages = useMemo(() => {
    const messages: ChatMessage[] = [];
    const seenContent = new Set<string>(); // Track seen messages to avoid duplicates

    // First, add actual messages
    if (currentChat?.messages) {
      currentChat.messages.forEach((actualMsg) => {
        // Create a unique key for this message
        const messageKey = `${
          actualMsg.senderUserId
        }-${actualMsg.content.trim()}-${actualMsg.createdAt}`;
        if (!seenContent.has(messageKey)) {
          messages.push(actualMsg);
          seenContent.add(messageKey);
        }
      });
    }

    // Then, add pending messages only if they don't match actual messages
    Array.from(pendingMessages.values()).forEach((pendingMsg) => {
      // Check if this pending message matches any actual message
      const hasMatchingActual = currentChat?.messages?.some(
        (actualMsg) =>
          actualMsg.senderUserId === pendingMsg.senderUserId &&
          actualMsg.content.trim() === pendingMsg.content.trim()
      );

      // Only add pending message if there's no matching actual message
      if (!hasMatchingActual) {
        const messageKey = `${
          pendingMsg.senderUserId
        }-${pendingMsg.content.trim()}-${pendingMsg.createdAt}`;
        if (!seenContent.has(messageKey)) {
          messages.push(pendingMsg);
          seenContent.add(messageKey);
        }
      }
    });

    // Sort by createdAt (oldest first)
    return messages.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeA - timeB;
    });
  }, [currentChat?.messages, pendingMessages]);

  // Scroll to bottom when messages change, only if there's overflow
  useEffect(() => {
    // Use setTimeout to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      if (messagesContainerRef.current && messagesEndRef.current) {
        const container = messagesContainerRef.current;
        const hasOverflow = container.scrollHeight > container.clientHeight;

        // Only scroll if there's overflow (more messages than visible)
        if (hasOverflow) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [allMessages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentChat || !user) return;

    const messageContent = message.trim();
    const tempMessageId = `temp-${Date.now()}-${Math.random()}`;

    // Create optimistic message
    const optimisticMessage: ChatMessage = {
      id: tempMessageId,
      senderUserId: user.id,
      content: messageContent,
      createdAt: new Date().toISOString(),
      isPending: true,
    };

    // Add optimistic message to local state
    setPendingMessages((prev) => {
      const newMap = new Map(prev);
      newMap.set(tempMessageId, optimisticMessage);
      return newMap;
    });

    // Clear input immediately
    setMessage("");

    try {
      const result = await sendMessage({
        chatId: currentChat.id,
        senderUserId: user.id,
        content: messageContent,
      });

      // Message sent successfully
      // The message will be added to currentChat.messages by Redux reducer
      // The pending message will be automatically removed by useEffect when actual message arrives
      if (result.type.endsWith("/fulfilled")) {
        // Wait for the actual message to be added to currentChat.messages
        // The useEffect will remove the pending message when it detects a match
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Remove pending message on error
      setPendingMessages((prev) => {
        const newMap = new Map(prev);
        newMap.delete(tempMessageId);
        return newMap;
      });
      // Restore message in input on error
      setMessage(messageContent);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "rgb(var(--background) / 1)",
          backgroundImage: "none",
          color: "var(--foreground)",
          borderRadius: "16px",
          maxHeight: "80vh",
        },
        className: "bg-white dark:bg-gray-900",
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          fontWeight: 600,
          fontSize: "1.125rem",
          borderBottom: "1px solid",
          p: 3,
        }}
        className="text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-full">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {sellerName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {listingTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </DialogTitle>

      {/* Messages Container */}
      <DialogContent sx={{ p: 0 }} className="bg-gray-50 dark:bg-gray-900">
        <div
          ref={messagesContainerRef}
          className="h-96 overflow-y-auto p-4 space-y-3"
        >
          {isInitializing || isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("chat.loading")}
                </p>
              </div>
            </div>
          ) : allMessages.length > 0 ? (
            <>
              {/* Render all messages (merged and sorted) */}
              {allMessages.map((msg, index) => {
                // Ensure we're comparing string IDs correctly
                const isOwnMessage =
                  String(msg.senderUserId) === String(user?.id);
                const isPending = msg.isPending === true;

                return (
                  <div
                    key={msg.id || `msg-${index}`}
                    className={cn(
                      "flex",
                      isOwnMessage
                        ? isRTL
                          ? "justify-start"
                          : "justify-end"
                        : isRTL
                        ? "justify-end"
                        : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm transition-opacity duration-300",
                        isPending && "opacity-60",
                        isOwnMessage
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                      )}
                    >
                      <p className="text-sm break-words">{msg.content}</p>
                      {msg.createdAt && (
                        <p
                          className={cn(
                            "text-xs mt-1",
                            isOwnMessage
                              ? "text-blue-100"
                              : "text-gray-500 dark:text-gray-400"
                          )}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString(
                            currentLanguage.code,
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("chat.noMessages")}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {t("chat.startConversation")}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      {/* Input Area */}
      <DialogActions
        sx={{
          p: 3,
          borderTop: "1px solid",
        }}
        className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-2 w-full">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t("chat.typeMessage")}
            disabled={isInitializing || !currentChat}
            className="flex-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isInitializing || !currentChat}
            className="!bg-blue-600 hover:!bg-blue-700 dark:!bg-blue-500 dark:hover:!bg-blue-600 !text-white font-semibold px-4"
          >
            <Send
              className={cn("h-5 w-5", isRTL ? "ml-2 rotate-180" : "mr-2")}
            />
            {t("chat.send")}
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};
