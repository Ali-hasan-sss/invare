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
import {
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Package,
  User,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { t, currentLanguage } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
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

  // Handle chat click
  const handleChatClick = async (chat: any) => {
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

  // Get participant name (other user in chat)
  const getParticipantName = (chat: any) => {
    if (!chat.participants || !Array.isArray(chat.participants)) {
      return chat.topic || t("chat.newChat");
    }

    const otherParticipant = chat.participants.find(
      (p: any) => p.user?.id !== user?.id
    );

    if (otherParticipant?.user) {
      const firstName = otherParticipant.user.firstName || "";
      const lastName = otherParticipant.user.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || otherParticipant.user.email || t("chat.newChat");
    }

    return chat.topic || t("chat.newChat");
  };

  // Get last message
  const getLastMessage = (chat: any) => {
    if (!chat.messages || chat.messages.length === 0) {
      return t("chat.startConversation");
    }
    const lastMsg = chat.messages[chat.messages.length - 1];
    return lastMsg.content || "";
  };

  // Get listing title
  const getListingTitle = (chat: any) => {
    if (chat.listing?.title) {
      return chat.listing.title;
    }
    return null;
  };

  // Get seller info from chat
  const getSellerInfo = (chat: any) => {
    if (!chat.participants || !Array.isArray(chat.participants)) {
      return null;
    }

    const otherParticipant = chat.participants.find(
      (p: any) => p.user?.id !== user?.id
    );

    if (otherParticipant?.user) {
      return {
        id: otherParticipant.user.id,
        name:
          `${otherParticipant.user.firstName || ""} ${
            otherParticipant.user.lastName || ""
          }`.trim() ||
          otherParticipant.user.email ||
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("chat.myChats")}
            </h1>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className={cn(
                "flex items-center gap-2",
                isRTL ? "flex-row-reverse" : ""
              )}
            >
              {isRTL ? (
                <>
                  <ArrowRight className="h-4 w-4" />
                  {t("common.back")}
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  {t("common.back")}
                </>
              )}
            </Button>
          </div>
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
          <Card className="p-12 text-center">
            <MessageCircle className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t("chat.noChats")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {t("chat.noChatsDescription")}
            </p>
          </Card>
        )}

        {/* Chats List */}
        {!isLoading && chats.length > 0 && (
          <div className="space-y-4">
            {chats.map((chat: any) => {
              const participantName = getParticipantName(chat);
              const lastMessage = getLastMessage(chat);
              const listingTitle = getListingTitle(chat);
              const sellerInfo = getSellerInfo(chat);
              const lastMessageDate =
                chat.messages?.[chat.messages.length - 1]?.createdAt;
              const chatUpdatedAt = chat.updatedAt || chat.createdAt;

              return (
                <Card
                  key={chat.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleChatClick(chat)}
                >
                  <CardContent className="p-6">
                    <div
                      className={cn(
                        "flex items-start gap-4",
                        isRTL ? "flex-row-reverse" : ""
                      )}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
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
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {listingTitle || participantName}
                            </h3>
                            {listingTitle && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {t("chat.with")} {participantName}
                              </p>
                            )}
                          </div>
                          <div
                            className={cn(
                              "flex items-center gap-2 flex-shrink-0",
                              isRTL ? "flex-row-reverse ml-2" : "mr-2"
                            )}
                          >
                            <Badge
                              variant={
                                chat.status === "active" ? "default" : "info"
                              }
                            >
                              {chat.status === "active"
                                ? t("chat.active")
                                : t("chat.closed")}
                            </Badge>
                            {lastMessageDate && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {formatDate(lastMessageDate)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Last Message */}
                        <p
                          className={cn(
                            "text-sm text-gray-600 dark:text-gray-400 truncate mb-2",
                            isRTL ? "text-right" : "text-left"
                          )}
                        >
                          {lastMessage}
                        </p>

                        {/* Listing Info */}
                        {listingTitle && chat.listing?.id && (
                          <div
                            className={cn(
                              "flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400",
                              isRTL ? "flex-row-reverse" : ""
                            )}
                          >
                            <Package className="h-4 w-4" />
                            <span>{listingTitle}</span>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0">
                        {isRTL ? (
                          <ArrowLeft className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ArrowRight className="h-5 w-5 text-gray-400" />
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
