import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "./firebase";
import { registerUser, loginGoogle } from "@/store/slices/authSlice";
import { AppDispatch } from "@/store";

const REDIRECT_FLAG_KEY = "google_redirect_initiated";

/**
 * Detects if device is mobile
 */
function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768
  );
}

/**
 * Initiates Google sign-in
 * Uses popup on desktop, redirect on mobile
 */
export const initiateGoogleRedirect = async (
  dispatch: AppDispatch
): Promise<{
  success: boolean;
  error?: string;
  user?: any;
}> => {
  try {
    if (!auth) {
      return {
        success: false,
        error: "Firebase Auth is not initialized. Please refresh the page.",
      };
    }

    const provider = new GoogleAuthProvider();
    const isMobile = isMobileDevice();

    if (isMobile) {
      // Use redirect on mobile devices
      if (process.env.NODE_ENV === "development") {
        console.log("[GoogleAuth] Mobile device detected - using redirect");
      }

      // Set flag in sessionStorage to track redirect
      if (typeof window !== "undefined") {
        sessionStorage.setItem(REDIRECT_FLAG_KEY, "true");
      }

      // Redirect to Google - this will navigate away from the page
      await signInWithRedirect(auth, provider);

      return { success: true };
    } else {
      // Use popup on desktop
      if (process.env.NODE_ENV === "development") {
        console.log("[GoogleAuth] Desktop device - using popup");
      }

      // Sign in with popup - returns result directly
      const result = await signInWithPopup(auth, provider);

      if (!result || !result.user) {
        return {
          success: false,
          error: "Failed to get user information from Google",
        };
      }

      const firebaseUser = result.user;

      if (process.env.NODE_ENV === "development") {
        console.log("[GoogleAuth] Popup sign-in successful:", {
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          providerIds: firebaseUser.providerData?.map((p: any) => p.providerId),
        });
      }

      // Process the Firebase user directly
      return await processFirebaseUser(firebaseUser, dispatch);
    }
  } catch (error: any) {
    // Clear flag on error
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(REDIRECT_FLAG_KEY);
    }

    if (process.env.NODE_ENV === "development") {
      console.error("[GoogleAuth] Sign-in error:", error);
    }

    if (error.code === "auth/configuration-not-found") {
      return {
        success: false,
        error:
          "Authentication service is not configured. Please contact support.",
      };
    }

    if (error.code === "auth/popup-closed-by-user") {
      return {
        success: false,
        error: "Sign-in popup was closed. Please try again.",
      };
    }

    if (error.code === "auth/popup-blocked") {
      return {
        success: false,
        error:
          "Popup was blocked. Please allow popups for this site and try again.",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to sign in with Google",
    };
  }
};

/**
 * Processes Google redirect result after user returns from Google
 * Used on mobile devices after redirect
 */
export const processGoogleRedirect = async (
  dispatch: AppDispatch
): Promise<{
  success: boolean;
  error?: string;
  user?: any;
}> => {
  try {
    if (!auth) {
      if (process.env.NODE_ENV === "development") {
        console.log("[GoogleAuth] Firebase Auth is not initialized");
      }
      return {
        success: false,
        error: "Firebase Auth is not initialized.",
      };
    }

    // Check if redirect was actually initiated (to prevent auto-triggering)
    const redirectInitiated =
      typeof window !== "undefined" &&
      sessionStorage.getItem(REDIRECT_FLAG_KEY) === "true";

    if (process.env.NODE_ENV === "development") {
      console.log("[GoogleAuth] Checking redirect:", {
        redirectInitiated,
        hasAuth: !!auth,
      });
    }

    if (!redirectInitiated) {
      // No redirect was initiated, skip processing
      if (process.env.NODE_ENV === "development") {
        console.log("[GoogleAuth] No redirect initiated, skipping");
      }
      return {
        success: false,
        error: "No redirect initiated",
      };
    }

    // Wait for Firebase to process the redirect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Get redirect result from Firebase
    if (process.env.NODE_ENV === "development") {
      console.log("[GoogleAuth] Calling getRedirectResult...");
    }

    let result: any = null;
    try {
      result = await getRedirectResult(auth);
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("[GoogleAuth] getRedirectResult error:", error);
      }
    }

    let firebaseUser = result?.user;

    // If no result from getRedirectResult, wait for auth state change
    if (!firebaseUser) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "[GoogleAuth] No result from getRedirectResult, waiting for auth state change..."
        );
      }

      const authInstance = auth;

      firebaseUser = await new Promise<any>((resolve, reject) => {
        let resolved = false;
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            unsubscribe();
            resolve(null);
          }
        }, 10000); // 10 second timeout

        const unsubscribe = onAuthStateChanged(
          authInstance,
          (user) => {
            if (resolved) return;

            if (
              user &&
              user.providerData &&
              user.providerData.some((p: any) => p.providerId === "google.com")
            ) {
              resolved = true;
              clearTimeout(timeout);
              unsubscribe();
              resolve(user);
            }
          },
          (error) => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              unsubscribe();
              reject(error);
            }
          }
        );

        // Check immediately
        const immediateUser = authInstance.currentUser;
        if (
          immediateUser &&
          immediateUser.providerData &&
          immediateUser.providerData.some(
            (p: any) => p.providerId === "google.com"
          )
        ) {
          resolved = true;
          clearTimeout(timeout);
          unsubscribe();
          resolve(immediateUser);
        }
      });
    }

    // Clear flag after we've checked for the result
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(REDIRECT_FLAG_KEY);
    }

    // If still no user, redirect didn't complete successfully
    if (!firebaseUser) {
      if (process.env.NODE_ENV === "development") {
        console.error("[GoogleAuth] No user found after redirect");
      }
      return {
        success: false,
        error: "No redirect result found. Please try again.",
      };
    }

    // Process the Firebase user
    if (process.env.NODE_ENV === "development") {
      console.log("[GoogleAuth] Processing Firebase user from redirect");
    }

    return await processFirebaseUser(firebaseUser, dispatch);
  } catch (error: any) {
    // Clear flag on error
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(REDIRECT_FLAG_KEY);
    }

    if (process.env.NODE_ENV === "development") {
      console.error("[GoogleAuth] Error processing redirect:", error);
    }

    if (error.code === "auth/configuration-not-found") {
      return {
        success: false,
        error: "Authentication service is not configured.",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to process Google authentication",
    };
  }
};

/**
 * Processes Firebase user: extracts info, registers, then logs in
 */
async function processFirebaseUser(
  firebaseUser: any,
  dispatch: AppDispatch
): Promise<{
  success: boolean;
  error?: string;
  user?: any;
}> {
  try {
    if (!firebaseUser.email || !firebaseUser.uid) {
      return {
        success: false,
        error: "Failed to get user information from Google",
      };
    }

    // Extract Google OAuth ID from providerData
    let googleId = firebaseUser.uid; // Fallback to Firebase UID

    if (firebaseUser.providerData && firebaseUser.providerData.length > 0) {
      const googleProvider = firebaseUser.providerData.find(
        (provider: any) => provider.providerId === "google.com"
      );
      if (googleProvider?.uid) {
        googleId = googleProvider.uid; // This is the actual Google OAuth sub ID
      }
    }

    // Extract name from displayName
    const displayName = firebaseUser.displayName || "";
    const nameParts = displayName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    if (process.env.NODE_ENV === "development") {
      console.log("[GoogleAuth] Processing Firebase user:", {
        email: firebaseUser.email,
        googleId: googleId,
        displayName: firebaseUser.displayName,
        firstName: firstName || firebaseUser.email.split("@")[0],
        lastName: lastName || "",
      });
    }

    // Prepare register data
    const registerData = {
      email: firebaseUser.email,
      firstName: firstName || firebaseUser.email.split("@")[0],
      lastName: lastName || "",
      countryId: undefined as string | undefined,
      googleId: googleId,
      registerType: "google" as const,
    };

    if (process.env.NODE_ENV === "development") {
      console.log("[GoogleAuth] Sending register request:", {
        ...registerData,
        googleId: googleId ? `${googleId.substring(0, 10)}...` : undefined,
      });
    }

    // Step 1: Register the user
    const registerResult = await dispatch(registerUser(registerData));

    if (process.env.NODE_ENV === "development") {
      console.log("[GoogleAuth] Register result:", {
        type: registerResult?.type,
        isFulfilled: registerResult?.type?.includes("fulfilled"),
        isRejected: registerResult?.type?.includes("rejected"),
      });
    }

    // Check if registration was successful
    if (
      registerResult &&
      "type" in registerResult &&
      registerResult.type.includes("fulfilled")
    ) {
      const payload = registerResult.payload as any;

      // If register returns accessToken and user, use them
      if (payload?.accessToken && payload?.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", payload.accessToken);
          localStorage.setItem("user", JSON.stringify(payload.user));
          document.cookie = `accessToken=${
            payload.accessToken
          }; path=/; max-age=${7 * 24 * 60 * 60}`;
          document.cookie = `user=${encodeURIComponent(
            JSON.stringify(payload.user)
          )}; path=/; max-age=${7 * 24 * 60 * 60}`;
        }

        if (process.env.NODE_ENV === "development") {
          console.log("[GoogleAuth] Registration successful with token");
        }

        return {
          success: true,
          user: payload.user,
        };
      }

      // If register doesn't return token, try to login
      if (process.env.NODE_ENV === "development") {
        console.log(
          "[GoogleAuth] Register successful but no token, attempting login"
        );
      }
    } else {
      // Registration failed
      const errorMessage =
        registerResult &&
        "payload" in registerResult &&
        registerResult.type.includes("rejected")
          ? (registerResult.payload as string)
          : "Registration failed";

      if (process.env.NODE_ENV === "development") {
        console.error("[GoogleAuth] Registration failed:", errorMessage);
      }

      return {
        success: false,
        error:
          typeof errorMessage === "string"
            ? errorMessage
            : "Registration failed",
      };
    }

    // Step 2: Login after registration
    const loginResult = await dispatch(
      loginGoogle({
        email: firebaseUser.email,
        googleId: googleId,
      })
    );

    if (process.env.NODE_ENV === "development") {
      console.log("[GoogleAuth] Login result:", {
        type: loginResult?.type,
        isFulfilled: loginResult?.type?.includes("fulfilled"),
      });
    }

    if (
      loginResult &&
      "type" in loginResult &&
      loginResult.type.includes("fulfilled")
    ) {
      const payload = loginResult.payload as any;

      // Store token and user data
      if (
        payload?.accessToken &&
        payload?.user &&
        typeof window !== "undefined"
      ) {
        localStorage.setItem("accessToken", payload.accessToken);
        localStorage.setItem("user", JSON.stringify(payload.user));
        document.cookie = `accessToken=${
          payload.accessToken
        }; path=/; max-age=${7 * 24 * 60 * 60}`;
        document.cookie = `user=${encodeURIComponent(
          JSON.stringify(payload.user)
        )}; path=/; max-age=${7 * 24 * 60 * 60}`;
      }

      if (process.env.NODE_ENV === "development") {
        console.log("[GoogleAuth] Login successful");
      }

      return {
        success: true,
        user: payload?.user || payload,
      };
    }

    // Login failed
    const loginError =
      loginResult &&
      "payload" in loginResult &&
      loginResult.type.includes("rejected")
        ? (loginResult.payload as string)
        : "Login failed";

    if (process.env.NODE_ENV === "development") {
      console.error("[GoogleAuth] Login failed:", loginError);
    }

    return {
      success: false,
      error: typeof loginError === "string" ? loginError : "Login failed",
    };
  } catch (error: any) {
    if (process.env.NODE_ENV === "development") {
      console.error("[GoogleAuth] Error processing Firebase user:", error);
    }

    return {
      success: false,
      error: error.message || "Failed to process user information",
    };
  }
}
