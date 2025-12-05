"use client";

import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { subscribeToUserTopic } from "../lib/fcmService";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { initializeAuth, user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Initialize auth state from localStorage on app load
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Subscribe to user topic when user is authenticated
    if (isAuthenticated && user?.id) {
      const subscribeToTopic = async () => {
        try {
          await subscribeToUserTopic(user.id);
        } catch (error) {
          // Silently fail - don't block app flow if subscription fails
          if (process.env.NODE_ENV === "development") {
            console.error("Failed to subscribe to user topic:", error);
          }
        }
      };

      // Small delay to ensure FCM is initialized
      const timer = setTimeout(() => {
        subscribeToTopic();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user?.id]);

  return <>{children}</>;
};

export default AuthProvider;
