import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

/**
 * CivicSolve — Centralized Axios API Client
 * Configured with VITE_API_BASE_URL (default: http://localhost:8080/api/v1)
 * and an automatic JWT request interceptor.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor: Automatically attach Bearer token from localStorage (SSR-safe)
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    let token: string | null = null;
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        token =
          localStorage.getItem("token") ||
          localStorage.getItem("civicsolve_token");
      } catch {}
    }
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn("API 401 Unauthorized response received:", error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default api;
