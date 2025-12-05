"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChatDialog } from "@/components/ChatDialog";
import { Avatar } from "@/components/ui/Avatar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { markChatAsRead, getUserChatsSilently } from "@/store/slices/chatSlice";
import {
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Package,
  User,
  Loader2,
  Clock,
  Image as ImageIcon,
  File,
  Video,
  Mic,
  Music,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { t, currentLanguage } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const unreadChatsCount = useAppSelector(
    (state) => state.chat.unreadChatsCount
  );
  const newChatIds = useAppSelector((state) => state.chat.newChatIds);
  const {
    chats,
    isLoading,
    error,
    fetchUserChats,
    setCurrentChatById,
    getMessages,
  } = useChat();
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false);

  const isRTL = currentLanguage.dir === "rtl";

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && user === null) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, router]);

  // Fetch chats when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchUserChats(user.id);
    }
  }, [user?.id, fetchUserChats]);

  // Note: We don't reset unread chats count when visiting the page
  // The count should persist until user actually opens the chats
  // resetUnreadChatsCount is called when user opens a specific chat (in handleChatClick)

  // Listen for new chat notifications and refresh chats list
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    // Check if service worker is available
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      // Check if this is an FCM message from service worker
      if (event.data && event.data.type === "FCM_MESSAGE") {
        const payload = event.data.payload;

        // Check if this is a chat_created notification
        if (payload.data?.type === "chat_created") {
          const chatId = payload.data?.chatId;
          if (chatId) {
            console.log("✅ New chat created notification (ChatPage):", chatId);
            // Refresh chats list silently (in background) to show the new chat
            dispatch(getUserChatsSilently(user.id));
          }
        }
      }
    };

    const setupServiceWorkerListener = async () => {
      try {
        // Wait for service worker to be ready
        const registration = await navigator.serviceWorker.ready;

        if (!registration) {
          return;
        }

        // Listen for messages from Service Worker (global listener)
        navigator.serviceWorker.addEventListener(
          "message",
          handleServiceWorkerMessage
        );

        // Also listen on the active worker (for better Edge compatibility)
        if (registration.active) {
          (registration.active as any).addEventListener(
            "message",
            handleServiceWorkerMessage
          );
        }
      } catch (error) {
        console.error(
          "Error setting up Service Worker listener in ChatPage:",
          error
        );
      }
    };

    setupServiceWorkerListener();

    return () => {
      // Remove global listener
      navigator.serviceWorker.removeEventListener(
        "message",
        handleServiceWorkerMessage
      );
    };
  }, [isAuthenticated, user?.id, fetchUserChats]);

  // Handle chat click
  const handleChatClick = async (chat: any) => {
    // Mark chat as read (decrement unread count and remove from new chat IDs)
    dispatch(markChatAsRead(chat.id));

    // Transform chat data to match Chat interface
    const transformedChat: any = {
      id: chat.id,
      topic: chat.topic || getListingTitle(chat) || getParticipantName(chat),
      status: chat.status || "active",
      createdByUserId: chat.createdByUserId || chat.createdBy?.id,
      participantUserIds:
        chat.participants?.map((p: any) => p.user?.id || p.userId) ||
        chat.participantUserIds ||
        [],
      participants: chat.participants,
      listing: chat.listing,
      messages: chat.messages || [],
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };

    // Set current chat first - ChatDialog will load messages when it opens
    setCurrentChatById(transformedChat);
    setSelectedChat(transformedChat);

    // Open dialog - ChatDialog will handle loading messages via /chat/:chatId/messages
    setIsChatDialogOpen(true);
  };

  // Get other user info (seller or participant)
  // Logic: Compare current user with sellerUser and participants.user
  // The other party is either the seller (if current user is in participants)
  // or a participant (if current user is the seller)
  const getOtherUser = (chat: any) => {
    const currentUserId = user?.id;
    if (!currentUserId) return null;

    // If there's a listing with sellerUser
    if (chat.listing?.sellerUser) {
      const sellerId = chat.listing.sellerUser.id;
      const sellerUser = chat.listing.sellerUser;

      // Check if current user is the seller
      if (sellerId === currentUserId) {
        // Current user is the seller, find other participant from participants array
        // (someone who is NOT the seller)
        if (chat.participants && Array.isArray(chat.participants)) {
          const otherParticipant = chat.participants.find(
            (p: any) => p.user?.id && p.user.id !== currentUserId
          );
          if (otherParticipant?.user) {
            return otherParticipant.user;
          }
        }
        // If no other participant found, return null (shouldn't happen in normal cases)
        return null;
      } else {
        // Current user is NOT the seller, so the other party is the seller
        return sellerUser;
      }
    }

    // If no listing, search in participants only
    if (chat.participants && Array.isArray(chat.participants)) {
      const otherParticipant = chat.participants.find(
        (p: any) => p.user?.id && p.user.id !== currentUserId
      );
      if (otherParticipant?.user) {
        return otherParticipant.user;
      }
    }

    return null;
  };

  // Get participant name (other user in chat)
  const getParticipantName = (chat: any) => {
    const otherUser = getOtherUser(chat);

    if (otherUser) {
      const firstName = otherUser.firstName || "";
      const lastName = otherUser.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        return fullName;
      }
      if (otherUser.email) {
        return otherUser.email;
      }
    }

    // Fallback: try to get name from topic or first participant
    if (chat.topic) {
      return chat.topic;
    }

    // Last fallback
    return t("chat.newChat") || "محادثة جديدة";
  };

  // Get last message with type indicator
  const getLastMessage = (chat: any) => {
    if (!chat.messages || chat.messages.length === 0) {
      return { text: "", type: "text", hasMessage: false };
    }
    const lastMsg = chat.messages[chat.messages.length - 1];
    const messageType = lastMsg.type || lastMsg.messageType || "text";

    // Get appropriate text based on message type
    let displayText = lastMsg.content || "";
    if (!displayText) {
      switch (messageType) {
        case "image":
          displayText = t("chat.imageMessage") || "صورة";
          break;
        case "video":
          displayText = t("chat.videoMessage") || "فيديو";
          break;
        case "audio":
        case "voice":
          displayText = t("chat.audioMessage") || "رسالة صوتية";
          break;
        case "file":
          displayText =
            lastMsg.attachmentName || t("chat.fileMessage") || "ملف";
          break;
        default:
          displayText = "";
      }
    }

    return { text: displayText, type: messageType, hasMessage: true };
  };

  // Get message type icon
  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-3.5 w-3.5" />;
      case "video":
        return <Video className="h-3.5 w-3.5" />;
      case "audio":
      case "voice":
        return <Mic className="h-3.5 w-3.5" />;
      case "file":
        return <File className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  // Get listing title with i18n support
  const getListingTitle = (chat: any) => {
    if (!chat.listing) return null;

    // Get translated title based on current language
    const langCode = currentLanguage.code;
    const i18nTitle = chat.listing.i18n?.[langCode]?.title;

    // Fallback to default title if i18n not available
    return i18nTitle || chat.listing.title || null;
  };

  // Get other participant user info (updated to check seller first)
  const getOtherParticipant = (chat: any) => {
    const otherUser = getOtherUser(chat);
    if (!otherUser) return null;

    // Return in participant format for compatibility
    return { user: otherUser };
  };

  // Get seller info from chat (updated to use getOtherUser)
  const getSellerInfo = (chat: any) => {
    const otherUser = getOtherUser(chat);

    if (otherUser) {
      return {
        id: otherUser.id,
        name:
          `${otherUser.firstName || ""} ${otherUser.lastName || ""}`.trim() ||
          otherUser.email ||
          t("listings.seller"),
      };
    }

    return null;
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      // Less than a minute
      if (diffInSeconds < 60) {
        return t("common.justNow");
      }

      // Less than an hour
      if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${t("common.minutesAgo")} ${t("common.ago")}`;
      }

      // Less than a day
      if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${t("common.hoursAgo")} ${t("common.ago")}`;
      }

      // Less than a week
      if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${t("common.daysAgo")} ${t("common.ago")}`;
      }

      // Format full date
      return date.toLocaleDateString(
        currentLanguage.code === "ar" ? "ar-SA" : "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return dateString;
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("chat.myChats")}
            </h1>
          </div>
          {chats.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {chats.length} {t("chat.totalChats") || "محادثة"}
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && chats.length === 0 && (
          <Card className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-3 text-gray-600 dark:text-gray-400">
                {t("chat.loading")}
              </span>
            </div>
          </Card>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="p-8">
            <div className="text-center text-red-600 dark:text-red-400">
              {error}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && chats.length === 0 && (
          <Card className="p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t("chat.noChats") || "لا توجد محادثات"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                {t("chat.noChatsDescription") ||
                  "ابدأ محادثة جديدة من خلال عرض أو مستخدم آخر"}
              </p>
            </div>
          </Card>
        )}

        {/* Chats List */}
        {!isLoading && chats.length > 0 && (
          <div className="space-y-3">
            {[...chats]
              .sort((a: any, b: any) => {
                // Sort by last message date or updatedAt
                const aDate =
                  a.messages?.[a.messages.length - 1]?.createdAt ||
                  a.updatedAt ||
                  a.createdAt;
                const bDate =
                  b.messages?.[b.messages.length - 1]?.createdAt ||
                  b.updatedAt ||
                  b.createdAt;
                return new Date(bDate).getTime() - new Date(aDate).getTime();
              })
              .map((chat: any) => {
                const otherUser = getOtherUser(chat);
                const participantName = getParticipantName(chat);
                const lastMessageData = getLastMessage(chat);
                const lastMessage = lastMessageData.text;
                const messageType = lastMessageData.type;
                const listingTitle = getListingTitle(chat);
                const lastMessageDate =
                  chat.messages?.[chat.messages.length - 1]?.createdAt;
                const chatUpdatedAt = chat.updatedAt || chat.createdAt;

                const isNewChat = newChatIds.includes(chat.id);

                return (
                  <Card
                    key={chat.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 relative",
                      "hover:shadow-xl hover:scale-[1.01] hover:border-blue-300 dark:hover:border-blue-600",
                      "border border-gray-200 dark:border-gray-700",
                      isNewChat && "border-red-400 dark:border-red-500",
                      "bg-white dark:bg-gray-800",
                      "group"
                    )}
                    onClick={() => handleChatClick(chat)}
                  >
                    {/* Red dot badge for new chat */}
                    {isNewChat && (
                      <div
                        className={cn(
                          "absolute top-3 w-3 h-3 bg-red-500 rounded-full z-10",
                          isRTL ? "left-3" : "right-3"
                        )}
                      />
                    )}
                    <CardContent className="p-5">
                      <div
                        className={cn(
                          "flex items-start gap-4",
                          isRTL ? "flex-row-reverse" : ""
                        )}
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0 relative">
                          <Avatar
                            size="large"
                            src={otherUser?.avatar}
                            fallback={
                              otherUser
                                ? `${otherUser.firstName || ""} ${
                                    otherUser.lastName || ""
                                  }`.trim() || otherUser.email
                                : ""
                            }
                            alt={participantName}
                            className="ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-blue-500"
                          />
                          {/* Red dot badge on avatar */}
                          {isNewChat && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div
                            className={cn(
                              "flex items-start justify-between mb-2",
                              isRTL ? "flex-row-reverse" : ""
                            )}
                          >
                            <div className="flex-1 min-w-0">
                              {/* Listing Title or Participant Name */}
                              {listingTitle ? (
                                <>
                                  <div
                                    className={cn(
                                      "flex items-center gap-1.5 mb-1",
                                      isRTL ? "flex-row-reverse" : ""
                                    )}
                                  >
                                    <Package className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                      {listingTitle}
                                    </h3>
                                  </div>
                                  {/* Participant Name under Listing */}
                                  {participantName && (
                                    <div
                                      className={cn(
                                        "flex items-center gap-1.5 mb-2",
                                        isRTL ? "flex-row-reverse" : ""
                                      )}
                                    >
                                      <User className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                        {participantName}
                                      </p>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 truncate">
                                  {participantName ||
                                    chat.topic ||
                                    t("chat.newChat")}
                                </h3>
                              )}
                            </div>

                            {/* Time and Status */}
                            <div
                              className={cn(
                                "flex flex-col items-end gap-2 flex-shrink-0",
                                isRTL ? "items-start" : "items-end"
                              )}
                            >
                              {lastMessageDate && (
                                <div
                                  className={cn(
                                    "flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400",
                                    isRTL ? "flex-row-reverse" : ""
                                  )}
                                >
                                  <Clock className="h-3 w-3" />
                                  <span className="whitespace-nowrap">
                                    {formatDate(lastMessageDate)}
                                  </span>
                                </div>
                              )}
                              <Badge
                                variant={
                                  chat.status === "open" ||
                                  chat.status === "active"
                                    ? "default"
                                    : "info"
                                }
                                className="text-xs"
                              >
                                {chat.status === "open" ||
                                chat.status === "active"
                                  ? t("chat.active")
                                  : t("chat.closed")}
                              </Badge>
                            </div>
                          </div>

                          {/* Last Message Preview */}
                          {lastMessageData.hasMessage && lastMessage && (
                            <div
                              className={cn(
                                "flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400",
                                isRTL ? "flex-row-reverse" : ""
                              )}
                            >
                              {messageType !== "text" && (
                                <span className="flex-shrink-0 text-blue-600 dark:text-blue-400">
                                  {getMessageTypeIcon(messageType)}
                                </span>
                              )}
                              <p
                                className={cn(
                                  "truncate line-clamp-2 flex-1",
                                  isRTL ? "text-right" : "text-left"
                                )}
                              >
                                {lastMessage}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Arrow Icon */}
                        <div className="flex-shrink-0 flex items-center">
                          {isRTL ? (
                            <ArrowLeft className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                          ) : (
                            <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>

      {/* Chat Dialog */}
      {isChatDialogOpen && selectedChat && (
        <ChatDialog
          open={isChatDialogOpen}
          onClose={() => {
            setIsChatDialogOpen(false);
            setSelectedChat(null);
          }}
          sellerUserId={
            getSellerInfo(selectedChat)?.id ||
            selectedChat.participants?.[0]?.user?.id ||
            ""
          }
          sellerName={getParticipantName(selectedChat)}
          listingTitle={getListingTitle(selectedChat) || selectedChat.topic}
          listingId={selectedChat.listing?.id || ""}
        />
      )}
    </div>
  );
}
