import { getMessagingInstance, getToken } from "./firebase";
import apiClient from "./apiClient";
import type { ChatMessage } from "@/store/slices/chatSlice";

/**
 * Generates FCM topic name from chatId
 * Format: chat_{chatId_with_underscores}
 */
export const getChatTopic = (chatId: string): string => {
  return `chat_${chatId.replace(/-/g, "_")}`;
};

/**
 * Subscribe to a chat topic for real-time messages
 */
export const subscribeToChatTopic = async (
  chatId: string
): Promise<boolean> => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) {
      // Not an error - messaging may not be supported or available
      if (process.env.NODE_ENV === "development") {
        console.debug("Firebase Messaging is not available for subscription");
      }
      return false;
    }

    // Check if VAPID key is configured
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "NEXT_PUBLIC_FIREBASE_VAPID_KEY is not configured. Please add it to your .env.local file."
        );
      }
      return false;
    }

    // Get FCM token
    let token: string | null = null;
    try {
      token = await getToken(messaging, {
        vapidKey: vapidKey,
      });
    } catch (error: any) {
      // Handle specific token errors
      const errorCode = error?.code || "";
      const errorMessage = error?.message || "";

      if (
        errorCode === "messaging/token-subscribe-failed" ||
        errorCode === "messaging/invalid-vapid-key" ||
        errorMessage.includes("authentication credential") ||
        errorMessage.includes("UNAUTHENTICATED") ||
        errorMessage.includes("OAuth 2 access token")
      ) {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "❌ Firebase Messaging VAPID Key Error:",
            "\n1. Make sure NEXT_PUBLIC_FIREBASE_VAPID_KEY is set in .env.local",
            "\n2. Get your VAPID key from Firebase Console:",
            "\n   Project Settings → Cloud Messaging → Web Push certificates",
            "\n3. Ensure the VAPID key matches your Firebase project",
            "\n4. Restart the dev server after adding the key",
            "\n\nError details:",
            error
          );
        }
        return false;
      }

      // Log other errors but don't throw
      if (process.env.NODE_ENV === "development") {
        console.error("Error getting FCM token:", error);
      }
      return false;
    }

    if (!token) {
      // Not an error - token may not be available
      if (process.env.NODE_ENV === "development") {
        console.debug("No FCM token available for subscription");
      }
      return false;
    }

    // Subscribe to chat notifications via backend API
    // POST /chat/:chatId/subscribe
    const response = await apiClient.post(`/chat/${chatId}/subscribe`, {
      deviceToken: token,
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`Subscribed to chat notifications for chat: ${chatId}`);
    }
    return true;
  } catch (error) {
    console.error("Error subscribing to chat topic:", error);
    return false;
  }
};

/**
 * Unsubscribe from a chat topic
 */
export const unsubscribeFromChatTopic = async (
  chatId: string
): Promise<boolean> => {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) {
      // Not an error - messaging may not be available during cleanup
      // This is expected when component unmounts or browser doesn't support FCM
      if (process.env.NODE_ENV === "development") {
        console.debug("Firebase Messaging is not available for unsubscription");
      }
      return false;
    }

    // Check if VAPID key is configured
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      if (process.env.NODE_ENV === "development") {
        console.debug(
          "NEXT_PUBLIC_FIREBASE_VAPID_KEY is not configured. Skipping unsubscription."
        );
      }
      return false;
    }

    // Get FCM token
    let token: string | null = null;
    try {
      token = await getToken(messaging, {
        vapidKey: vapidKey,
      });
    } catch (error: any) {
      // Handle specific token errors - silently fail for unsubscription
      const errorCode = error?.code || "";
      const errorMessage = error?.message || "";

      if (
        errorCode === "messaging/token-subscribe-failed" ||
        errorCode === "messaging/invalid-vapid-key" ||
        errorMessage.includes("authentication credential") ||
        errorMessage.includes("UNAUTHENTICATED")
      ) {
        // Silently fail for unsubscription - not critical
        if (process.env.NODE_ENV === "development") {
          console.debug(
            "FCM token not available for unsubscription (VAPID key issue)"
          );
        }
        return false;
      }

      // Log other errors in development
      if (process.env.NODE_ENV === "development") {
        console.debug("Error getting token for unsubscription:", error);
      }
      return false;
    }

    if (!token) {
      // Not an error - token may not be available
      if (process.env.NODE_ENV === "development") {
        console.debug("No FCM token available for unsubscription");
      }
      return false;
    }

    // Unsubscribe from chat notifications via backend API
    // DELETE /chat/:chatId/subscribe
    await apiClient.delete(`/chat/${chatId}/subscribe`, {
      data: {
        deviceToken: token,
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`Unsubscribed from chat notifications for chat: ${chatId}`);
    }
    return true;
  } catch (error) {
    console.error("Error unsubscribing from chat topic:", error);
    return false;
  }
};

/**
 * Parse FCM message payload to ChatMessage
 * FCM payload structure:
 * {
 *   "notification": { "title": "Sender Name", "body": "Message content" },
 *   "data": {
 *     "type": "chat_message",
 *     "chatId": "uuid",
 *     "message": "{...}" // Full message entity as JSON string
 *   }
 * }
 */
export const parseFCMChatMessage = (payload: any): ChatMessage | null => {
  try {
    const data = payload.data || payload;

    console.log("🔍 Parsing FCM payload:", { payload, data });

    // Check if this is a chat message
    if (data.type !== "chat_message") {
      console.log("⚠️ Not a chat message, type:", data.type);
      return null;
    }

    // Get chatId from data
    const chatId = data.chatId;
    if (!chatId) {
      console.error("❌ No chatId in FCM payload");
      return null;
    }

    // Parse the message object from JSON string
    let message: any;
    try {
      if (typeof data.message === "string") {
        message = JSON.parse(data.message);
        console.log("✅ Parsed message from JSON string:", message);
      } else {
        message = data.message;
        console.log("✅ Using message object directly:", message);
      }
    } catch (e) {
      console.error("❌ Failed to parse message from FCM payload:", e, {
        messageString: data.message,
      });
      return null;
    }

    // Validate message structure
    if (!message.id) {
      console.error("❌ Invalid FCM message structure - missing id:", message);
      return null;
    }

    if (!message.sender && !message.senderUserId) {
      console.error(
        "❌ Invalid FCM message structure - missing sender:",
        message
      );
      return null;
    }

    // Transform to ChatMessage format
    return {
      id: message.id,
      senderUserId: message.sender?.id || message.senderUserId,
      content: message.content || "",
      type: message.type || "text",
      attachmentUrl: message.attachmentUrl,
      attachmentName: message.attachmentName,
      attachmentMimeType: message.attachmentMimeType,
      attachmentSize: message.attachmentSize,
      attachmentDuration: message.attachmentDuration,
      // Legacy fields for backward compatibility
      imageUrl: message.attachmentUrl || message.imageUrl,
      imageThumbnailUrl: message.imageThumbnailUrl,
      messageType: message.type || message.messageType,
      createdAt: message.createdAt || new Date().toISOString(),
      isPending: false,
      sender: message.sender,
    };
  } catch (error) {
    console.error("Error parsing FCM chat message:", error);
    return null;
  }
};
