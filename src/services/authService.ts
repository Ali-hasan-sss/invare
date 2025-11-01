import apiClient from "../lib/apiClient";
import { API_CONFIG } from "../config/api";

// Types
export interface LoginCredentials {
  email: string;
  otp: string;
}

export interface RegisterUserData {
  email: string;
  firstName: string;
  lastName: string;
  countryId?: string;
}

export interface RegisterCompanyData {
  companyName: string;
  vatNumber: string;
  website: string;
  countryId?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
  };
}

export interface RegisterResponse {
  id: string;
  email: string;
}

export interface UserResponse {
  user: {
    id: string;
    email: string;
  };
}

// Auth Service Class
export class AuthService {
  /**
   * Login user with email and OTP
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  }

  /**
   * Register new user
   */
  static async registerUser(
    userData: RegisterUserData
  ): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER_USER,
        userData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "User registration failed"
      );
    }
  }

  /**
   * Register new company
   */
  static async registerCompany(
    companyData: RegisterCompanyData
  ): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER_COMPANY,
        companyData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Company registration failed"
      );
    }
  }

  /**
   * Get current user data
   */
  static async getCurrentUser(): Promise<UserResponse> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to get user data"
      );
    }
  }

  /**
   * Logout user (clear local storage)
   */
  static logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    const token = localStorage.getItem("accessToken");
    return !!token;
  }

  /**
   * Get stored access token
   */
  static getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  /**
   * Get stored user data
   */
  static getStoredUser(): any | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  /**
   * Check if current user is admin
   */
  static isAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.isAdmin === true;
  }

  /**
   * Store auth data after successful login
   */
  static storeAuthData(authResponse: AuthResponse): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", authResponse.accessToken);
      localStorage.setItem("user", JSON.stringify(authResponse.user));
    }
  }
}

// Export individual functions for convenience
export const authAPI = {
  login: AuthService.login,
  registerUser: AuthService.registerUser,
  registerCompany: AuthService.registerCompany,
  getCurrentUser: AuthService.getCurrentUser,
  logout: AuthService.logout,
  isAuthenticated: AuthService.isAuthenticated,
  getAccessToken: AuthService.getAccessToken,
  getStoredUser: AuthService.getStoredUser,
  storeAuthData: AuthService.storeAuthData,
  isAdmin: AuthService.isAdmin,
};

export default AuthService;
