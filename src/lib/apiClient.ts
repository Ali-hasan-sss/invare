import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { API_CONFIG } from "@/config/api";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000, // Increase timeout to accommodate slower auth/register flows
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[apiClient] Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: `${config.baseURL}${config.url}`,
        timeout: config.timeout,
      });
    }

    return config;
  },
  (error) => {
    if (process.env.NODE_ENV === "development") {
      console.error("[apiClient] Request error:", error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[apiClient] Response:", {
        status: response.status,
        url: response.config.url,
      });
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === "development") {
      console.error("[apiClient] Response error:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        url: error.config?.url,
        isTimeout:
          error.code === "ECONNABORTED" || error.message?.includes("timeout"),
      });
    }

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear token and user data
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        // Only redirect if we're NOT already on the login/register page
        // This prevents page reload when login fails with 401
        const currentPath = window.location.pathname;
        const isAuthPage =
          currentPath.startsWith("/auth/login") ||
          currentPath.startsWith("/auth/register");

        if (!isAuthPage) {
          // Redirect to login only if we're not already on an auth page
          window.location.href = "/auth/login";
        }
        // If we're already on login/register page, just reject the error
        // without redirecting to prevent page reload
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
