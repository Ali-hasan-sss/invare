// Firebase Messaging Service Worker
// This file must be in the public folder to be accessible at the root URL

importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js"
);

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDH3mmLK_KmKZrx16ns5okqUuPpnmoeLwE",
  authDomain: "invare-sa-660e4.firebaseapp.com",
  projectId: "invare-sa-660e4",
  storageBucket: "invare-sa-660e4.firebasestorage.app",
  messagingSenderId: "504501059524",
  appId: "1:504501059524:web:fbab7043bcec2ff88bee91",
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

// Track active chat ID (when user is inside a chat dialog)
let activeChatId = null;

// Listen for messages from clients about chat state
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CHAT_STATE_CHANGE") {
    activeChatId = event.data.chatId;
    console.log(
      "[firebase-messaging-sw.js] Active chat changed:",
      activeChatId
    );
  }
});

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const messageChatId = payload.data?.chatId;

  // Don't show notification if user is currently viewing this chat
  if (activeChatId && messageChatId === activeChatId) {
    console.log(
      "[firebase-messaging-sw.js] User is in chat, skipping notification for chat:",
      messageChatId
    );
    // Still send message to clients so they can update the chat UI
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: "FCM_MESSAGE",
            payload: payload,
          });
        });
      });
    return;
  }

  const notificationTitle = payload.notification?.title || "New Message";
  const notificationOptions = {
    body:
      payload.notification?.body ||
      payload.data?.content ||
      "You have a new message",
    icon: payload.notification?.icon || "/logo.png",
    badge: "/logo.png",
    data: payload.data,
    tag: `chat-${payload.data?.chatId}`, // Tag to group notifications by chat
    requireInteraction: false,
  };

  // Show notification
  self.registration.showNotification(notificationTitle, notificationOptions);

  // Send message to all open clients (pages) so they can update the chat
  // This allows the message to appear in ChatDialog even when page is in background
  self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clients) => {
      console.log(
        "[firebase-messaging-sw.js] Sending message to",
        clients.length,
        "client(s)"
      );
      clients.forEach((client) => {
        console.log(
          "[firebase-messaging-sw.js] Posting message to client:",
          client.url
        );
        client.postMessage({
          type: "FCM_MESSAGE",
          payload: payload,
        });
      });
    });
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[firebase-messaging-sw.js] Notification click received.");

  event.notification.close();

  // Handle click action - you can customize this based on your needs
  if (event.notification.data && event.notification.data.chatId) {
    // Open the chat when notification is clicked
    event.waitUntil(
      clients.openWindow(`/chats?chatId=${event.notification.data.chatId}`)
    );
  } else {
    // Default: open the app
    event.waitUntil(clients.openWindow("/"));
  }
});
