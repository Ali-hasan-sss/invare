"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
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
  ExternalLink,
  Image as ImageIcon,
  XCircle,
  Paperclip,
  File,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ChatMessage, Chat } from "@/store/slices/chatSlice";
import { getMessagingInstance, onMessage } from "@/lib/firebase";
import { subscribeToChatTopic, parseFCMChatMessage } from "@/lib/fcmService";
import { useAppDispatch } from "@/store/hooks";
import {
  addRealtimeMessage,
  addNewChatNotification,
  getUserChatsSilently,
} from "@/store/slices/chatSlice";
import { uploadImage, uploadFile } from "@/services/uploadService";

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
  const dispatch = useAppDispatch();
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attachmentMenuAnchor, setAttachmentMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
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
      setSelectedImage(null);
      setImagePreview(null);
    }
  }, [open]);

  // Fetch messages every time dialog opens
  useEffect(() => {
    if (open && currentChat?.id) {
      // Reset the loaded ref to allow fetching messages again
      messagesLoadedRef.current = null;
      // Fetch messages
      getMessages(currentChat.id);
    }
  }, [open, currentChat?.id, getMessages]);

  // Handle attachment menu
  const handleAttachmentMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAttachmentMenuAnchor(event.currentTarget);
  };

  const handleAttachmentMenuClose = () => {
    setAttachmentMenuAnchor(null);
  };

  // Handle image selection from menu
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAttachmentMenuClose();
      handleFileUpload(file, "image");
    }
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // Handle file selection from menu
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAttachmentMenuClose();
      handleFileUpload(file, "file");
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle file upload and send message
  const handleFileUpload = async (file: File, type: "image" | "file") => {
    if (!currentChat || !user) return;

    setIsUploading(true);

    try {
      let fileUrl: string;
      let messageType: "image" | "file";

      // Upload file
      if (type === "image") {
        // Validate image
        if (!file.type.startsWith("image/")) {
          showToast(
            t("chat.invalidImageType") || "Please select an image file",
            "error"
          );
          setIsUploading(false);
          return;
        }
        if (file.size > 10 * 1024 * 1024) {
          showToast(
            t("chat.imageTooLarge") || "Image size must be less than 10MB",
            "error"
          );
          setIsUploading(false);
          return;
        }
        fileUrl = await uploadImage(file);
        messageType = "image";
      } else {
        // Validate file size (20 MB)
        if (file.size > 20 * 1024 * 1024) {
          showToast(
            t("chat.fileTooLarge") || "File size must be less than 20MB",
            "error"
          );
          setIsUploading(false);
          return;
        }
        fileUrl = await uploadFile(file);
        messageType = "file";
      }

      // Send message with attachment URL
      await sendMessage({
        chatId: currentChat.id,
        senderUserId: user.id,
        content: file.name || (type === "image" ? "صورة" : "ملف"),
        type: messageType,
        attachmentUrl: fileUrl,
        attachmentName: file.name,
        attachmentMimeType: file.type,
        attachmentSize: file.size,
      });

      showToast(
        type === "image"
          ? t("chat.imageSent") || "Image sent successfully"
          : t("chat.fileSent") || "File sent successfully",
        "success"
      );
    } catch (error: any) {
      console.error("Error uploading file:", error);
      showToast(
        error.message || t("chat.uploadError") || "Failed to upload file",
        "error"
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Remove selected image (legacy - for old image selection)
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle location sharing
  const handleShareLocation = async () => {
    if (!currentChat || !user) return;

    handleAttachmentMenuClose();
    setIsUploading(true);

    try {
      // Get user's current location
      if (!navigator.geolocation) {
        showToast(
          t("chat.geolocationNotSupported") ||
            "Geolocation is not supported by your browser",
          "error"
        );
        setIsUploading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Send message with location data
          await sendMessage({
            chatId: currentChat.id,
            senderUserId: user.id,
            content: t("chat.locationShared") || "موقعي",
            type: "text",
            // Store location data in attachmentUrl as JSON string or use a custom field
            attachmentUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
            attachmentName: `${latitude},${longitude}`,
            attachmentMimeType: "application/location",
            // Store coordinates in attachmentSize as a way to pass data (or use a custom API field)
            // For now, we'll encode coordinates in attachmentName
          });

          showToast(
            t("chat.locationSent") || "Location sent successfully",
            "success"
          );
          setIsUploading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          let errorMessage =
            t("chat.locationError") || "Failed to get location";
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage =
              t("chat.locationPermissionDenied") ||
              "Location permission denied";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage =
              t("chat.locationUnavailable") || "Location unavailable";
          } else if (error.code === error.TIMEOUT) {
            errorMessage =
              t("chat.locationTimeout") || "Location request timeout";
          }
          showToast(errorMessage, "error");
          setIsUploading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } catch (error: any) {
      console.error("Error sharing location:", error);
      showToast(
        error.message || t("chat.locationError") || "Failed to share location",
        "error"
      );
      setIsUploading(false);
    }
  };

  // Notify Service Worker about active chat (to prevent notifications when user is in chat)
  useEffect(() => {
    const notifyServiceWorker = async () => {
      if (!("serviceWorker" in navigator)) {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          // Send message to service worker about active chat
          registration.active.postMessage({
            type: "CHAT_STATE_CHANGE",
            chatId: open && currentChat?.id ? currentChat.id : null,
            isOpen: open,
          });
        }
      } catch (error) {
        console.error("Error notifying service worker:", error);
      }
    };

    notifyServiceWorker();
  }, [open, currentChat?.id]);

  // Handle messages from Service Worker (for background messages)
  useEffect(() => {
    if (!open || !currentChat?.id) {
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

        console.log("📨 FCM message received from Service Worker:", {
          payload,
          currentChatId: currentChat.id,
          payloadChatId: payload.data?.chatId,
        });

        // Check if this is a chat_created notification
        if (payload.data?.type === "chat_created") {
          const chatId = payload.data?.chatId;
          if (chatId) {
            console.log("✅ New chat created notification:", chatId);
            // Add new chat notification to Redux store
            dispatch(
              addNewChatNotification({
                chatId,
                currentUserId: user?.id,
              })
            );
          }
          return;
        }

        // Parse the message
        const chatMessage = parseFCMChatMessage(payload);

        console.log("📝 Parsed chat message:", chatMessage);

        // Always add message to Redux store if it's a valid message
        // This ensures badges appear on chat cards even when dialog is open for another chat
        if (chatMessage && payload.data?.chatId) {
          const messageChatId = payload.data.chatId;

          // Check if message belongs to current chat
          if (messageChatId === currentChat.id) {
            console.log("✅ Adding message to current chat:", currentChat.id);
            // Add message to Redux store
            dispatch(
              addRealtimeMessage({
                chatId: currentChat.id,
                message: chatMessage,
                currentUserId: user?.id,
              })
            );
          } else {
            // Message is for a different chat - add it to update that chat's card badge
            console.log("✅ Adding message to other chat:", messageChatId);
            dispatch(
              addRealtimeMessage({
                chatId: messageChatId,
                message: chatMessage,
                currentUserId: user?.id,
              })
            );
          }
        } else {
          console.log("⚠️ Message not for current chat or failed to parse:", {
            chatMessage,
            payloadChatId: payload.data?.chatId,
            currentChatId: currentChat.id,
          });
        }
      }
    };

    // Get service worker registration and listen for messages
    // Use ready promise to ensure service worker is active (important for Edge)
    let activeWorker: ServiceWorker | null = null;

    const setupServiceWorkerListener = async () => {
      try {
        // Wait for service worker to be ready
        const registration = await navigator.serviceWorker.ready;

        if (!registration) {
          console.warn("Service Worker not ready");
          return;
        }

        // Listen for messages from Service Worker (global listener)
        navigator.serviceWorker.addEventListener(
          "message",
          handleServiceWorkerMessage
        );

        // Also listen on the active worker (for better Edge compatibility)
        if (registration.active) {
          activeWorker = registration.active;
          (registration.active as any).addEventListener(
            "message",
            handleServiceWorkerMessage
          );
        }

        console.log(
          "✅ Service Worker message listener registered for chat:",
          currentChat.id,
          "SW state:",
          registration.active?.state
        );
      } catch (error) {
        console.error("Error setting up Service Worker listener:", error);
      }
    };

    setupServiceWorkerListener();

    return () => {
      // Remove global listener
      navigator.serviceWorker.removeEventListener(
        "message",
        handleServiceWorkerMessage
      );

      // Remove active worker listener if exists
      if (activeWorker) {
        (activeWorker as any).removeEventListener(
          "message",
          handleServiceWorkerMessage
        );
      }
    };
  }, [open, currentChat?.id, dispatch]);

  // Listen for FCM messages when chat dialog is closed to show Toast
  useEffect(() => {
    // Only listen when dialog is closed
    if (open) {
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

        console.log("📨 FCM message received (chat closed):", payload);

        // Check if this is a chat_created notification
        if (payload.data?.type === "chat_created") {
          const chatId = payload.data?.chatId;
          if (chatId && user?.id) {
            console.log("✅ New chat created notification:", chatId);
            // Add new chat notification to Redux store
            dispatch(
              addNewChatNotification({
                chatId,
                currentUserId: user.id,
              })
            );

            // Fetch chats silently (in background) to update the list
            dispatch(getUserChatsSilently(user.id));

            // Show toast notification
            const chatData = payload.data?.chat
              ? JSON.parse(payload.data.chat)
              : null;
            const createdBy = chatData?.createdBy;
            const senderName = createdBy
              ? `${createdBy.firstName || ""} ${
                  createdBy.lastName || ""
                }`.trim() || createdBy.email
              : "شخص ما";
            showToast(
              `${senderName}: ${
                t("chat.newChatCreated") || "بدأ محادثة جديدة"
              }`,
              "info"
            );
          }
          return;
        }

        // Parse the message
        const chatMessage = parseFCMChatMessage(payload);

        if (chatMessage) {
          // Get sender name from message or use default
          const senderName =
            (chatMessage.sender?.firstName &&
              chatMessage.sender?.lastName &&
              `${chatMessage.sender.firstName} ${chatMessage.sender.lastName}`) ||
            chatMessage.sender?.firstName ||
            chatMessage.sender?.email ||
            payload.notification?.title ||
            "شخص ما";

          // Get message content (truncate if too long)
          let messageContent =
            chatMessage.content ||
            payload.notification?.body ||
            payload.data?.content ||
            "رسالة جديدة";

          // Truncate long messages for Toast
          if (messageContent.length > 100) {
            messageContent = messageContent.substring(0, 100) + "...";
          }

          // Show Toast notification
          showToast(`${senderName}: ${messageContent}`, "info");

          // Add message to Redux store to update chat list
          if (payload.data?.chatId) {
            dispatch(
              addRealtimeMessage({
                chatId: payload.data.chatId,
                message: chatMessage,
                currentUserId: user?.id,
              })
            );
          }
        } else {
          // If message parsing failed, still show notification from payload
          const notificationTitle =
            payload.notification?.title || "رسالة جديدة";
          const notificationBody =
            payload.notification?.body ||
            payload.data?.content ||
            "لديك رسالة جديدة";
          showToast(`${notificationTitle}: ${notificationBody}`, "info");
        }
      }
    };

    // Get service worker registration and listen for messages
    let activeWorker: ServiceWorker | null = null;

    const setupServiceWorkerListener = async () => {
      try {
        // Wait for service worker to be ready
        const registration = await navigator.serviceWorker.ready;

        if (!registration) {
          console.warn("Service Worker not ready");
          return;
        }

        // Listen for messages from Service Worker (global listener)
        navigator.serviceWorker.addEventListener(
          "message",
          handleServiceWorkerMessage
        );

        // Also listen on the active worker (for better Edge compatibility)
        if (registration.active) {
          activeWorker = registration.active;
          (registration.active as any).addEventListener(
            "message",
            handleServiceWorkerMessage
          );
        }

        console.log(
          "✅ Service Worker message listener registered (chat closed - Toast mode)"
        );
      } catch (error) {
        console.error("Error setting up Service Worker listener:", error);
      }
    };

    setupServiceWorkerListener();

    return () => {
      // Remove global listener
      navigator.serviceWorker.removeEventListener(
        "message",
        handleServiceWorkerMessage
      );

      // Remove active worker listener if exists
      if (activeWorker) {
        (activeWorker as any).removeEventListener(
          "message",
          handleServiceWorkerMessage
        );
      }
    };
  }, [open, dispatch, showToast]);

  // Track message listener for cleanup
  const unsubscribeMessageRef = useRef<(() => void) | null>(null);

  // Subscribe to FCM topic and listen for real-time messages (foreground)
  useEffect(() => {
    if (!open || !currentChat?.id) {
      return;
    }

    const setupFCM = async () => {
      try {
        // Get messaging instance safely
        const messagingInstance = await getMessagingInstance();
        if (!messagingInstance) {
          if (process.env.NODE_ENV === "development") {
            console.debug("Firebase Messaging is not available");
          }
          return;
        }

        // Subscribe to chat topic
        await subscribeToChatTopic(currentChat.id);

        // Listen for incoming messages (foreground messages)
        unsubscribeMessageRef.current = onMessage(
          messagingInstance,
          (payload) => {
            if (process.env.NODE_ENV === "development") {
              console.log("FCM foreground message received:", payload);
            }

            // Parse the message
            const chatMessage = parseFCMChatMessage(payload);

            if (chatMessage && payload.data?.chatId === currentChat.id) {
              // Add message to Redux store
              dispatch(
                addRealtimeMessage({
                  chatId: currentChat.id,
                  message: chatMessage,
                  currentUserId: user?.id,
                })
              );
            }
          }
        );
      } catch (error) {
        console.error("Error setting up FCM:", error);
      }
    };

    setupFCM();

    // Cleanup: only cleanup message listener when chat changes (not unsubscribe from topic)
    return () => {
      if (unsubscribeMessageRef.current) {
        unsubscribeMessageRef.current();
        unsubscribeMessageRef.current = null;
      }
    };
  }, [open, currentChat?.id, dispatch]);

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
          // If currentChat is already set (e.g., from chats page), use it
          // Messages will be loaded by the useEffect that watches for open && currentChat?.id
          // This prevents creating a new chat when opening from chats page
          if (currentChat?.id) {
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
            // Include both participantUserIds and participants array with both user IDs
            await createNewChat({
              topic: listingTitle,
              createdByUserId: user.id,
              participantUserIds: [user.id, sellerUserId],
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
    if ((!message.trim() && !selectedImage) || !currentChat || !user) return;

    const messageContent = message.trim();
    const tempMessageId = `temp-${Date.now()}-${Math.random()}`;

    // Determine message type according to API
    const messageType: "text" | "image" = selectedImage ? "image" : "text";

    // Create optimistic message
    const optimisticMessage: ChatMessage = {
      id: tempMessageId,
      senderUserId: user.id,
      content: messageContent,
      type: messageType,
      imageUrl: imagePreview || undefined,
      messageType: messageType, // Legacy field
      createdAt: new Date().toISOString(),
      isPending: true,
    };

    // Add optimistic message to local state
    setPendingMessages((prev) => {
      const newMap = new Map(prev);
      newMap.set(tempMessageId, optimisticMessage);
      return newMap;
    });

    // Clear input and image immediately
    const savedMessage = messageContent;
    const savedImage = selectedImage;
    setMessage("");
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    try {
      const result = await sendMessage({
        chatId: currentChat.id,
        senderUserId: user.id,
        content: messageContent,
        type: messageType,
        imageFile: savedImage || undefined, // Will be uploaded first, then message sent
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
      // Restore message and image on error
      setMessage(savedMessage);
      if (savedImage) {
        setSelectedImage(savedImage);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(savedImage);
      }
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
                      {/* Image/Attachment */}
                      {(msg.attachmentUrl ||
                        msg.imageUrl ||
                        msg.imageThumbnailUrl) &&
                        (msg.type === "image" ||
                          msg.messageType === "image") && (
                          <div className="mb-2 rounded-lg overflow-hidden">
                            <a
                              href={
                                msg.attachmentUrl ||
                                msg.imageUrl ||
                                msg.imageThumbnailUrl
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={
                                  msg.attachmentUrl ||
                                  msg.imageThumbnailUrl ||
                                  msg.imageUrl
                                }
                                alt={
                                  msg.content || msg.attachmentName || "Image"
                                }
                                className="max-w-full h-auto max-h-64 object-contain rounded-lg cursor-pointer"
                                loading="lazy"
                              />
                            </a>
                          </div>
                        )}
                      {/* Voice message */}
                      {msg.type === "voice" && msg.attachmentUrl && (
                        <div className="mb-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">
                              {t("chat.voiceMessage") || "Voice message"}
                            </span>
                            {msg.attachmentDuration && (
                              <span className="text-xs text-gray-500">
                                ({Math.round(msg.attachmentDuration)}s)
                              </span>
                            )}
                          </div>
                          <audio
                            controls
                            className="w-full"
                            src={msg.attachmentUrl}
                          >
                            <source
                              src={msg.attachmentUrl}
                              type={msg.attachmentMimeType || "audio/webm"}
                            />
                            {t("chat.audioNotSupported") ||
                              "Your browser does not support audio playback"}
                          </audio>
                        </div>
                      )}
                      {/* Location message */}
                      {msg.attachmentUrl &&
                        msg.attachmentMimeType === "application/location" && (
                          <div className="mb-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
                              <span className="text-sm font-medium">
                                {t("chat.locationShared") || "Location shared"}
                              </span>
                            </div>
                            <a
                              href={msg.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-secondary-600 dark:text-secondary-400 hover:underline"
                            >
                              <span>
                                {t("chat.viewOnMap") || "View on Google Maps"}
                              </span>
                              <ExternalLink className="h-4 w-4" />
                            </a>
                            {msg.attachmentName && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {msg.attachmentName}
                              </p>
                            )}
                          </div>
                        )}
                      {/* Other attachment types (video, file) */}
                      {msg.attachmentUrl &&
                        msg.type !== "image" &&
                        msg.type !== "text" &&
                        msg.type !== "voice" &&
                        msg.attachmentMimeType !== "application/location" && (
                          <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <a
                              href={msg.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm"
                            >
                              <File className="h-4 w-4" />
                              <span>
                                {msg.attachmentName ||
                                  t("chat.attachFile") ||
                                  "Attachment"}
                              </span>
                              {msg.attachmentSize && (
                                <span className="text-xs text-gray-500">
                                  ({(msg.attachmentSize / 1024).toFixed(1)} KB)
                                </span>
                              )}
                            </a>
                          </div>
                        )}
                      {/* Text content */}
                      {msg.content &&
                        !(
                          msg.attachmentMimeType === "application/location" &&
                          msg.content === "chat.locationShared"
                        ) && (
                          <p className="text-sm break-words">
                            {msg.content.startsWith("chat.") ||
                            msg.content.startsWith("common.")
                              ? t(msg.content) || msg.content
                              : msg.content}
                          </p>
                        )}
                      {/* Timestamp */}
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
        <div className="flex flex-col gap-2 w-full">
          {/* Image Preview */}
          {imagePreview && (
            <div className="relative inline-block max-w-xs">
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 z-10"
              >
                <XCircle className="h-4 w-4" />
              </button>
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full h-auto max-h-32 rounded-lg object-contain"
              />
            </div>
          )}
          <div className="flex items-center gap-2 w-full">
            {/* Hidden file inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />
            {/* Attachment Menu Button */}
            <button
              onClick={handleAttachmentMenuOpen}
              disabled={isInitializing || !currentChat || isUploading}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              title={t("chat.attachFile") || "Attach file"}
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 text-gray-600 dark:text-gray-400 animate-spin" />
              ) : (
                <Paperclip className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            {/* Share Location Button */}
            <button
              onClick={handleShareLocation}
              disabled={isInitializing || !currentChat || isUploading}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              title={t("chat.shareLocation") || "Share location"}
            >
              {isUploading ? (
                <Loader2 className="h-5 w-5 text-gray-600 dark:text-gray-400 animate-spin" />
              ) : (
                <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            {/* Attachment Menu */}
            <Menu
              anchorEl={attachmentMenuAnchor}
              open={Boolean(attachmentMenuAnchor)}
              onClose={handleAttachmentMenuClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: isRTL ? "right" : "left",
              }}
              transformOrigin={{
                vertical: "bottom",
                horizontal: isRTL ? "right" : "left",
              }}
            >
              <MenuItem
                onClick={() => {
                  handleAttachmentMenuClose();
                  imageInputRef.current?.click();
                }}
                disabled={isUploading}
              >
                <ListItemIcon>
                  <ImageIcon className="h-5 w-5" />
                </ListItemIcon>
                <ListItemText>
                  {t("chat.attachImage") || "Attach image"}
                </ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleAttachmentMenuClose();
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
              >
                <ListItemIcon>
                  <File className="h-5 w-5" />
                </ListItemIcon>
                <ListItemText>
                  {t("chat.attachFile") || "Attach file"}
                </ListItemText>
              </MenuItem>
              <MenuItem onClick={handleShareLocation} disabled={isUploading}>
                <ListItemIcon>
                  <MapPin className="h-5 w-5" />
                </ListItemIcon>
                <ListItemText>
                  {t("chat.shareLocation") || "Share location"}
                </ListItemText>
              </MenuItem>
            </Menu>
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
              disabled={
                (!message.trim() && !selectedImage) ||
                isInitializing ||
                !currentChat
              }
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
        </div>
      </DialogActions>
    </Dialog>
  );
};
