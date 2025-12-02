import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getMessaging,
  getToken,
  onMessage,
  Messaging,
  isSupported,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDH3mmLK_KmKZrx16ns5okqUuPpnmoeLwE",
  authDomain: "invare-sa-660e4.firebaseapp.com",
  projectId: "invare-sa-660e4",
  storageBucket: "invare-sa-660e4.firebasestorage.app",
  messagingSenderId: "504501059524",
  appId: "1:504501059524:web:fbab7043bcec2ff88bee91",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

/**
 * Safe function to get Firebase Messaging instance
 * This ensures messaging is only initialized when:
 * 1. Running in browser (not SSR)
 * 2. Browser supports required APIs (using Firebase's isSupported())
 * 3. Service worker is registered
 *
 * IMPORTANT: Never call getMessaging() at the top level of this file!
 * It will be executed during SSR and cause errors.
 *
 * @returns Promise<Messaging | null> - Messaging instance or null if not supported
 */
export async function getMessagingInstance(): Promise<Messaging | null> {
  // Check if running in browser (not SSR)
  if (typeof window === "undefined") {
    return null;
  }

  // Use Firebase's built-in isSupported() check
  try {
    const supported = await isSupported();
    if (!supported) {
      if (process.env.NODE_ENV === "development") {
        console.debug("Firebase Messaging is not supported in this browser");
      }
      return null;
    }
  } catch (error) {
    // If isSupported() fails, messaging is not available
    if (process.env.NODE_ENV === "development") {
      console.debug("Firebase Messaging isSupported() check failed:", error);
    }
    return null;
  }

  // Register service worker if not already registered
  try {
    // Check for existing registration first
    let registration = await navigator.serviceWorker.getRegistration("/");

    if (!registration) {
      // Register the service worker
      const newRegistration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        {
          scope: "/",
          updateViaCache: "none", // Always check for updates (better for Edge)
        }
      );

      if (!newRegistration) {
        throw new Error("Failed to register service worker");
      }

      registration = newRegistration;

      if (process.env.NODE_ENV === "development") {
        console.log("Service Worker registered for Firebase Messaging");
      }

      // Wait for service worker to be ready (if installing)
      const installing = registration.installing;
      if (installing) {
        // Wait for service worker to activate (with timeout for Edge compatibility)
        await Promise.race([
          new Promise<void>((resolve) => {
            const stateChangeHandler = () => {
              if (
                installing.state === "activated" ||
                installing.state === "redundant"
              ) {
                installing.removeEventListener(
                  "statechange",
                  stateChangeHandler
                );
                resolve();
              }
            };
            installing.addEventListener("statechange", stateChangeHandler);

            // Also check current state immediately
            if (
              installing.state === "activated" ||
              installing.state === "redundant"
            ) {
              installing.removeEventListener("statechange", stateChangeHandler);
              resolve();
            }
          }),
          // Timeout after 10 seconds (Edge may need more time)
          new Promise<void>((resolve) => setTimeout(resolve, 10000)),
        ]);
      }

      // Ensure service worker is active before proceeding
      if (registration.active) {
        if (process.env.NODE_ENV === "development") {
          console.log("Service Worker is active");
        }
      } else {
        // Wait a bit more for Edge
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log("Service Worker already registered");
      }

      // Update service worker to ensure latest version (important for Edge)
      try {
        await registration.update();
      } catch (updateError) {
        // Update may fail if no new version, that's okay
        if (process.env.NODE_ENV === "development") {
          console.debug("Service Worker update check:", updateError);
        }
      }
    }

    // Now it's safe to call getMessaging() - Firebase will use the registered service worker
    const messaging = getMessaging(app);

    if (process.env.NODE_ENV === "development") {
      console.log("Firebase Messaging initialized successfully");
    }

    return messaging;
  } catch (error: any) {
    // Catch any errors during initialization
    const errorMessage = error?.message || "";
    const errorCode = error?.code || "";

    if (
      errorCode === "messaging/unsupported-browser" ||
      errorMessage.includes("unsupported-browser") ||
      errorMessage.includes("doesn't support the API")
    ) {
      if (process.env.NODE_ENV === "development") {
        console.debug("Firebase Messaging is not supported in this browser");
      }
    } else {
      console.error("Firebase Messaging initialization error:", error);
    }
    return null;
  }
}

// Export other Firebase utilities
export { app, auth, provider, getToken, onMessage };
