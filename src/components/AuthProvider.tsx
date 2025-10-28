"use client";

import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { initializeAuth } = useAuth();

  useEffect(() => {
    // Initialize auth state from localStorage on app load
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
};

export default AuthProvider;
