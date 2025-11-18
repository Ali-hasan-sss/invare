import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase";
import { loginGoogle, registerUser } from "@/store/slices/authSlice";
import { AppDispatch } from "@/store";

// Helper function to handle Google sign-up (register only)
export const handleGoogleSignUp = async (
  dispatch: AppDispatch
): Promise<{
  success: boolean;
  error?: string;
  user?: any;
}> => {
  try {
    // Check if auth is initialized
    if (!auth) {
      return {
        success: false,
        error: "Firebase Auth is not initialized. Please refresh the page.",
      };
    }

    const provider = new GoogleAuthProvider();

    // Sign in with Google using Firebase
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    if (!firebaseUser.email || !firebaseUser.uid) {
      return {
        success: false,
        error: "Failed to get user information from Google",
      };
    }

    // Extract name from Firebase user
    const displayName = firebaseUser.displayName || "";
    const nameParts = displayName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Register the user directly with Google information
    const registerResult = await dispatch(
      registerUser({
        email: firebaseUser.email!,
        firstName: firstName || firebaseUser.email!.split("@")[0],
        lastName: lastName || "",
        countryId: undefined, // Optional, user can set it later
        googleId: firebaseUser.uid, // Google OAuth sub ID
        registerType: "google", // Mark registration as Google sign-up
      })
    );

    // Check if registration was successful
    if (
      registerResult &&
      "type" in registerResult &&
      registerResult.type.includes("fulfilled")
    ) {
      const payload = registerResult.payload as any;

      // If accessToken and user are returned, store them
      if (
        payload?.accessToken &&
        payload?.user &&
        typeof window !== "undefined"
      ) {
        localStorage.setItem("accessToken", payload.accessToken);
        localStorage.setItem("user", JSON.stringify(payload.user));
        document.cookie = `accessToken=${
          payload.accessToken
        }; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
        document.cookie = `user=${encodeURIComponent(
          JSON.stringify(payload.user)
        )}; path=/; max-age=${7 * 24 * 60 * 60}`;
      }

      return {
        success: true,
        user: payload?.user || payload,
      };
    }

    // Registration failed
    const errorMessage =
      (registerResult as any)?.payload || "Registration failed";
    return {
      success: false,
      error:
        typeof errorMessage === "string" ? errorMessage : "Registration failed",
    };
  } catch (error: any) {
    console.error("Google sign-up error:", error);

    // Handle specific Firebase errors silently
    if (error.code === "auth/popup-closed-by-user") {
      return {
        success: false,
        error: "Sign up was cancelled",
      };
    }

    if (error.code === "auth/popup-blocked") {
      return {
        success: false,
        error: "Popup was blocked. Please allow popups and try again.",
      };
    }

    if (error.code === "auth/configuration-not-found") {
      if (process.env.NODE_ENV === "development") {
        console.error(
          "Firebase Auth configuration error:",
          "Please enable Firebase Authentication and Google Sign-in provider in Firebase Console"
        );
      }
      return {
        success: false,
        error:
          "Authentication service is not configured. Please contact support.",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to sign up with Google",
    };
  }
};

// Helper function to handle Google authentication
export const handleGoogleAuth = async (
  dispatch: AppDispatch
): Promise<{
  success: boolean;
  error?: string;
  user?: any;
}> => {
  try {
    // Check if auth is initialized
    if (!auth) {
      return {
        success: false,
        error: "Firebase Auth is not initialized. Please refresh the page.",
      };
    }

    const provider = new GoogleAuthProvider();

    // Sign in with Google using Firebase
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    if (!firebaseUser.email || !firebaseUser.uid) {
      return {
        success: false,
        error: "Failed to get user information from Google",
      };
    }

    // Try to login with backend first
    const loginResult = await dispatch(
      loginGoogle({
        email: firebaseUser.email,
        googleId: firebaseUser.uid,
      })
    );

    // Check if login was successful
    if (
      loginResult &&
      "type" in loginResult &&
      loginResult.type.includes("fulfilled")
    ) {
      return {
        success: true,
        user: (loginResult.payload as any)?.user,
      };
    }

    // If login was rejected, check if it's because user doesn't exist
    if (
      loginResult &&
      "type" in loginResult &&
      loginResult.type.includes("rejected")
    ) {
      const errorMessage = (loginResult.payload as string) || "";
      const isUserNotFound =
        errorMessage.includes("not found") ||
        errorMessage.includes("doesn't exist") ||
        errorMessage.includes("404") ||
        errorMessage.toLowerCase().includes("user not found") ||
        errorMessage.toLowerCase().includes("email not found");

      if (isUserNotFound) {
        // Extract name from Firebase user
        const displayName = firebaseUser.displayName || "";
        const nameParts = displayName.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        // Register the user silently with registerType: "google"
        const registerResult = await dispatch(
          registerUser({
            email: firebaseUser.email!,
            firstName: firstName || firebaseUser.email!.split("@")[0],
            lastName: lastName || "",
            countryId: undefined,
            googleId: firebaseUser.uid, // Google OAuth sub ID
            registerType: "google", // Mark registration as Google sign-up
          })
        );

        // Check if registration was successful
        if (
          registerResult &&
          "type" in registerResult &&
          registerResult.type.includes("fulfilled")
        ) {
          // After registration, try to login again
          const retryLoginResult = await dispatch(
            loginGoogle({
              email: firebaseUser.email!,
              googleId: firebaseUser.uid,
            })
          );

          if (
            retryLoginResult &&
            "type" in retryLoginResult &&
            retryLoginResult.type.includes("fulfilled")
          ) {
            return {
              success: true,
              user: (retryLoginResult.payload as any)?.user,
            };
          }
        }
      }

      // If we reach here, authentication failed for some reason
      // Return silently as requested - no error shown to user
      return {
        success: false,
        error: errorMessage || "Authentication failed",
      };
    }

    // If we reach here, something unexpected went wrong
    return {
      success: false,
      error: "Authentication failed. Please try again.",
    };
  } catch (error: any) {
    console.error("Google authentication error:", error);

    // Handle specific Firebase errors silently
    if (error.code === "auth/popup-closed-by-user") {
      return {
        success: false,
        error: "Sign in was cancelled",
      };
    }

    if (error.code === "auth/popup-blocked") {
      return {
        success: false,
        error: "Popup was blocked. Please allow popups and try again.",
      };
    }

    if (error.code === "auth/configuration-not-found") {
      // Firebase Auth is not configured in Firebase Console
      // This is a configuration issue, return silently as requested
      if (process.env.NODE_ENV === "development") {
        console.error(
          "Firebase Auth configuration error:",
          "Please enable Firebase Authentication and Google Sign-in provider in Firebase Console"
        );
      }
      return {
        success: false,
        error:
          "Authentication service is not configured. Please contact support.",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to authenticate with Google",
    };
  }
};
