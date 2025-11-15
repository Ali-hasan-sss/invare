"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useTranslation } from "@/hooks/useTranslation";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { useListings } from "@/hooks/useListings";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import {
  Send,
  X,
  MessageCircle,
  Loader2,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage, Chat } from "@/store/slices/chatSlice";

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
  const { showToast } = useToast();
  const router = useRouter();
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
  const { currentListing, getListingById, updateListing } = useListings();
  const [message, setMessage] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [pendingMessages, setPendingMessages] = useState<
    Map<string, ChatMessage>
  >(new Map());
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesLoadedRef = useRef<string | null>(null); // Track which chat's messages have been loaded
  const isRTL = currentLanguage.dir === "rtl";
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Extract listingId from currentChat or use prop
  const effectiveListingId = useMemo(() => {
    // First try to get from currentChat.listing.id (new structure)
    if (currentChat?.listing?.id) {
      return currentChat.listing.id;
    }
    // Fallback to prop
    return listingId;
  }, [currentChat?.listing?.id, listingId]);

  // Get seller user ID from listing or props
  const effectiveSellerUserId = useMemo(() => {
    // First try to get from currentChat.listing.sellerUser.id (from API response)
    if (currentChat?.listing?.sellerUser?.id) {
      return currentChat.listing.sellerUser.id;
    }
    // Fallback to prop
    return sellerUserId;
  }, [currentChat?.listing?.sellerUser?.id, sellerUserId]);

  // Check if current user is the seller
  const isSeller =
    user?.id && String(user.id) === String(effectiveSellerUserId);

  // Reset messages loaded ref and price form when dialog closes
  useEffect(() => {
    if (!open) {
      messagesLoadedRef.current = null;
      setShowPriceForm(false);
      setNewPrice("");
    }
  }, [open]);

  // Fetch listing details when dialog opens (for seller to see current price)
  useEffect(() => {
    if (open && effectiveListingId && isSeller) {
      getListingById(effectiveListingId, currentLanguage.code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, effectiveListingId, isSeller]);

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

  const handleUpdatePrice = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log("handleUpdatePrice called", {
      newPrice,
      listingId: effectiveListingId,
      isUpdatingPrice,
    });

    if (!newPrice.trim() || !effectiveListingId || isUpdatingPrice) {
      console.log("Validation failed");
      return;
    }

    const priceValue = parseFloat(newPrice.trim());
    if (isNaN(priceValue) || priceValue < 0) {
      showToast(t("chat.priceUpdateError") || "Invalid price", "error");
      return;
    }

    setIsUpdatingPrice(true);
    try {
      console.log("Calling updateListing with:", {
        listingId: effectiveListingId,
        startingPrice: priceValue.toString(),
      });
      const result = await updateListing(effectiveListingId, {
        startingPrice: priceValue.toString(),
      });

      console.log("Update result:", result);

      // Check if the result is a fulfilled action
      if (result && typeof result === "object" && "type" in result) {
        const actionType = String(result.type);
        console.log("Action type:", actionType);
        if (actionType.includes("fulfilled")) {
          showToast(
            t("chat.priceUpdated") || "Price updated successfully",
            "success"
          );
          setShowPriceForm(false);
          setNewPrice("");
          // Refresh listing to get updated price
          await getListingById(effectiveListingId, currentLanguage.code);
        } else {
          // Handle rejected action
          const errorMessage =
            result && "payload" in result && result.payload
              ? String(result.payload)
              : t("chat.priceUpdateError") || "Failed to update price";
          console.log("Update failed:", errorMessage);
          showToast(errorMessage, "error");
        }
      } else {
        console.log("Unexpected result structure:", result);
        // Fallback if result structure is unexpected
        showToast(
          t("chat.priceUpdateError") || "Failed to update price",
          "error"
        );
      }
    } catch (error) {
      console.error("Failed to update price:", error);
      showToast(
        t("chat.priceUpdateError") || "Failed to update price",
        "error"
      );
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          backgroundColor: "rgb(var(--background) / 1)",
          backgroundImage: "none",
          color: "var(--foreground)",
          borderRadius: {
            xs: "0px",
            sm: "16px",
          },
          maxHeight: {
            xs: "100vh",
            sm: "80vh",
          },
          height: {
            xs: "100vh",
            sm: "auto",
          },
          margin: {
            xs: 0,
            sm: "32px",
          },
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
          p: {
            xs: 2,
            sm: 3,
          },
        }}
        className="text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 bg-gradient-to-r from-secondary-50 to-accent-50 dark:from-gray-800 dark:to-gray-800"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-secondary-600 dark:bg-secondary-500 rounded-full flex-shrink-0">
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
                {sellerName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate hidden sm:block">
                {listingTitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* View Listing Button - Shown to both buyer and seller */}
            {effectiveListingId && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/listings/detail/${effectiveListingId}`);
                  onClose();
                }}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-secondary-600 dark:text-secondary-400 text-sm font-medium"
                title={t("chat.viewListing")}
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("chat.viewListing")}
                </span>
              </button>
            )}
            {/* Update Price Button - Only visible to seller */}
            {isSeller && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPriceForm(!showPriceForm);
                  if (!showPriceForm && currentListing?.startingPrice) {
                    setNewPrice(currentListing.startingPrice);
                  }
                }}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-secondary-600 dark:text-secondary-400 text-sm font-medium"
                title={t("chat.updatePrice")}
              >
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("chat.updatePrice")}
                </span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </DialogTitle>

      {/* Price Update Form */}
      {isSeller && showPriceForm && (
        <div className="px-3 sm:px-4 py-2 sm:py-3 bg-secondary-50 dark:bg-secondary-900/20 border-b border-secondary-200 dark:border-secondary-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdatePrice(e as any);
            }}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="flex-1 min-w-0">
              {currentListing?.startingPrice && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 truncate">
                  {t("chat.currentPrice")}: {currentListing.startingPrice}{" "}
                  {t("common.currency")}
                </p>
              )}
              <Input
                type="number"
                inputProps={{ step: "0.01", min: "0" }}
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleUpdatePrice(e as any);
                  }
                }}
                placeholder={t("chat.enterNewPrice")}
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm sm:text-base"
              />
            </div>
            <Button
              type="submit"
              disabled={
                !newPrice.trim() || isUpdatingPrice || !effectiveListingId
              }
              size="sm"
              className="!bg-secondary-600 hover:!bg-secondary-700 dark:!bg-secondary-500 dark:hover:!bg-secondary-600 !text-white font-semibold flex-shrink-0"
            >
              {isUpdatingPrice ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  <span className="hidden sm:inline">{t("chat.update")}</span>
                </>
              ) : (
                <span className="hidden sm:inline">{t("chat.update")}</span>
              )}
            </Button>
            <button
              type="button"
              onClick={() => {
                setShowPriceForm(false);
                setNewPrice("");
              }}
              className="p-1.5 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          </form>
        </div>
      )}

      {/* Messages Container */}
      <DialogContent
        sx={{
          p: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
        className="bg-gray-50 dark:bg-gray-900"
      >
        <div
          ref={messagesContainerRef}
          className={cn(
            "flex-1 overflow-y-auto p-3 sm:p-4 space-y-3",
            isMobile ? "h-[calc(100vh-200px)]" : "h-96"
          )}
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
                        "max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm transition-opacity duration-300",
                        isPending && "opacity-60",
                        isOwnMessage
                          ? "bg-secondary-600 text-white"
                          : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700"
                      )}
                    >
                      <p className="text-sm break-words">{msg.content}</p>
                      {msg.createdAt && (
                        <p
                          className={cn(
                            "text-xs mt-1",
                            isOwnMessage
                              ? "text-secondary-100"
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
          p: {
            xs: 2,
            sm: 3,
          },
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
            className="flex-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-sm sm:text-base"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isInitializing || !currentChat}
            className="!bg-blue-600 hover:!bg-blue-700 dark:!bg-blue-500 dark:hover:!bg-blue-600 !text-white font-semibold px-3 sm:px-4"
            size={isMobile ? "sm" : "md"}
          >
            <Send
              className={cn(
                "h-4 w-4 sm:h-5 sm:w-5",
                isRTL ? "ml-1 sm:ml-2 rotate-180" : "mr-1 sm:mr-2"
              )}
            />
            <span className="hidden sm:inline">{t("chat.send")}</span>
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};
