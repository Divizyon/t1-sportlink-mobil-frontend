import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { showToast } from "../../src/utils/toastHelper";

// API URL'ini environment'tan al, yoksa gerçek IP'yi kullan
const API_URL = process.env.EXPO_PUBLIC_API;

// API URL'i kontrol et ve bazı diagnostik log kayıtları ekle
console.log(
  "==================== API CLIENT CONFIGURATION ===================="
);
console.log(
  "Environment variable EXPO_PUBLIC_API:",
  process.env.EXPO_PUBLIC_API
);
console.log("Using API URL:", API_URL || "not set (default will be used)");
console.log(
  "==================================================================="
);

// Debug modu aktif
const DEBUG = true;

// API istemcisi için varsayılan zaman aşımı süresi (ms)
const DEFAULT_TIMEOUT = 10000; // 10 saniye

// Debug log fonksiyonu
const debugLog = (...args: any[]) => {
  if (DEBUG) {
    console.log("[API Debug]", ...args);
  }
};

// Hata log fonksiyonu
const errorLog = (...args: any[]) => {
  if (DEBUG) {
    console.error("[API Error]", ...args);
  }
};

debugLog("API URL:", API_URL);

// Track auth state
let isRefreshingToken = false;
let tokenRefreshPromise: Promise<string | null> | null = null;
let failedQueue: { resolve: Function; reject: Function }[] = [];

// Process the failed queue
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(token);
    }
  });

  failedQueue = [];
};

// Try to refresh the token
const refreshAuthToken = async (): Promise<string | null> => {
  try {
    // Check if refresh token exists
    const refreshToken = await AsyncStorage.getItem("refreshToken");
    if (!refreshToken) {
      errorLog("Refresh token bulunamadı");
      return null;
    }

    debugLog("Token yenileniyor...");

    // Call the refresh endpoint with the refresh token
    const response = await axios.post(`${API_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    if (response.data?.data?.token) {
      const newToken = response.data.data.token;

      // Save the new token
      await AsyncStorage.setItem("authToken", newToken);

      // If refresh token is also returned, save it
      if (response.data.data.refreshToken) {
        await AsyncStorage.setItem(
          "refreshToken",
          response.data.data.refreshToken
        );
      }

      debugLog("Token başarıyla yenilendi");
      return newToken;
    }

    return null;
  } catch (error) {
    errorLog("Token yenileme başarısız:", error);
    return null;
  }
};

// Axios instance oluştur
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000, // 10 saniye timeout ekle
});

// Request interceptor - token ekleme
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Çift /api/ öneki sorununu gider
      if (config.url && config.url.startsWith("/api/")) {
        config.url = config.url.replace(/^\/api\//, "/");
        debugLog("URL düzeltildi:", config.url);
      }

      debugLog("İstek başlatılıyor:", {
        url: config.url,
        method: config.method,
        params: config.params,
        data: config.data,
      });

      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        debugLog("Token eklendi:", token.substring(0, 20) + "...");
      } else {
        errorLog("Token bulunamadı!");
      }
      return config;
    } catch (error) {
      errorLog("Token eklenirken hata:", error);
      return config;
    }
  },
  (error) => {
    errorLog("İstek hatası:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
apiClient.interceptors.response.use(
  (response) => {
    debugLog("Başarılı yanıt:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    // Zaman aşımı hatası kontrolü
    if (
      error.code === "ECONNABORTED" &&
      error.message &&
      error.message.includes("timeout")
    ) {
      errorLog("API İstek zaman aşımı:", {
        url: error.config?.url,
        timeout: error.config?.timeout,
      });
      return Promise.reject({
        status: "error",
        message: "Sunucudan yanıt alınamadı: İstek zaman aşımı",
        data: null,
      });
    }

    errorLog("API Hatası:", {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      stack: error.stack,
    });

    // Original request configuration
    const originalRequest = error.config;

    // Only try to refresh once per request to avoid infinite loops
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshingToken) {
        // Wait for the token refresh to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshingToken = true;

      try {
        // Try to refresh the token
        const newToken = await refreshAuthToken();

        if (newToken) {
          // Set auth header
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Process queued requests
          processQueue(null, newToken);

          // Return the original request with the new token
          return apiClient(originalRequest);
        } else {
          // Token refresh failed
          processQueue(error, null);

          // Clear tokens if refresh failed
          await AsyncStorage.removeItem("authToken");
          await AsyncStorage.removeItem("refreshToken");

          // Notify user about session expiration
          showToast(
            "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
            "error"
          );

          // Redirect to login
          setTimeout(() => {
            router.replace("/(auth)/signin");
          }, 500);

          return Promise.reject({
            status: "error",
            message: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
            data: error.response?.data || null,
          });
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshingToken = false;
      }
    }

    // Handle all other errors
    const errorResponse = {
      status: "error",
      message:
        error.response?.data?.message || error.message || "Bir hata oluştu",
      data: error.response?.data || null,
      status_code: error.response?.status || 500,
    };

    return Promise.reject(errorResponse);
  }
);
