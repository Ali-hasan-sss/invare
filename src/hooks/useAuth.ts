import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  loginUser,
  registerUser,
  registerCompany,
  getCurrentUser,
  logout,
  clearError,
  initializeAuth,
  LoginCredentials,
  RegisterUserData,
  RegisterCompanyData,
} from "../store/slices/authSlice";

// Main auth hook
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      return dispatch(loginUser(credentials));
    },
    [dispatch]
  );

  // Register user function
  const registerUserAccount = useCallback(
    async (userData: RegisterUserData) => {
      return dispatch(registerUser(userData));
    },
    [dispatch]
  );

  // Register company function
  const registerCompanyAccount = useCallback(
    async (companyData: RegisterCompanyData) => {
      return dispatch(registerCompany(companyData));
    },
    [dispatch]
  );

  // Get current user function
  const fetchCurrentUser = useCallback(async () => {
    return dispatch(getCurrentUser());
  }, [dispatch]);

  // Logout function
  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  // Clear error function
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Initialize auth from localStorage
  const initializeAuthState = useCallback(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return {
    // State
    user: authState.user,
    company: authState.company,
    accessToken: authState.accessToken,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,

    // Actions
    login,
    registerUser: registerUserAccount,
    registerCompany: registerCompanyAccount,
    getCurrentUser: fetchCurrentUser,
    logout: logoutUser,
    clearError: clearAuthError,
    initializeAuth: initializeAuthState,
  };
};

// Hook for checking authentication status
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    user,
    isLoggedIn: isAuthenticated && !!user,
  };
};

// Hook for user data
export const useUser = () => {
  const { user, company, isLoading } = useAuth();

  return {
    user,
    company,
    isLoading,
    isUser: !!user,
    isCompany: !!company,
  };
};

// Hook for auth actions only
export const useAuthActions = () => {
  const {
    login,
    registerUser,
    registerCompany,
    logout,
    clearError,
    initializeAuth,
  } = useAuth();

  return {
    login,
    registerUser,
    registerCompany,
    logout,
    clearError,
    initializeAuth,
  };
};

// Hook for auth state only
export const useAuthState = () => {
  const { isAuthenticated, isLoading, error, user, company, accessToken } =
    useAuth();

  return {
    isAuthenticated,
    isLoading,
    error,
    user,
    company,
    accessToken,
  };
};

export default useAuth;
