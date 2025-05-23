import axios, { AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { router } from "expo-router";
import { showToast } from "../utils/toastHelper";

// Extend global object type to include our sportlinkForceLogout method
declare global {
  var sportlinkForceLogout: (() => Promise<void>) | undefined;
}

// Track auth state
let isRefreshingToken = false;
let tokenRefreshPromise: Promise<string | null> | null = null;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: any;
}> = [];

// Process queued requests
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else if (token) {
      // Clone the original request but update the Authorization header
      const newRequest = { ...request.config };
      newRequest.headers.Authorization = `Bearer ${token}`;
      request.resolve(axios(newRequest));
    }
  });

  // Reset the queue
  failedQueue = [];
};

// Force logout function
const forceLogout = async () => {
  console.log("API Client: Force logout due to authentication failure");
  try {
    // Clear all storage items related to auth
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("refreshToken");
    await AsyncStorage.removeItem("userData");
    await AsyncStorage.removeItem("userInfo");

    // Show toast notification
    showToast("Oturumunuz sona erdi. Lütfen tekrar giriş yapın.", "error");

    // Get auth context's forceLogout function if available
    try {
      // Try to access auth context's forceLogout via an exposed global method
      // This is needed because we can't directly import/use the hook in this file
      if (
        global.sportlinkForceLogout &&
        typeof global.sportlinkForceLogout === "function"
      ) {
        console.log("Using AuthContext's forceLogout method");
        await global.sportlinkForceLogout();
        return; // If successful, don't continue with our navigation
      }
    } catch (authErr) {
      console.error("Failed to use AuthContext method:", authErr);
    }

    // Use our own navigation as fallback
    console.log("Using API client direct navigation to login");
    setTimeout(() => {
      try {
        router.navigate("/(auth)/signin");
      } catch (navErr) {
        console.error("API client navigate failed:", navErr);
        // Final attempt with replace
        try {
          router.replace("/(auth)/signin");
        } catch (replaceErr) {
          console.error("API client replace also failed:", replaceErr);
        }
      }
    }, 300);
  } catch (error) {
    console.error("Force logout error in API client:", error);
    // Last resort navigation
    try {
      router.navigate("/(auth)/signin");
    } catch (finalErr) {
      console.error("Final navigation attempt failed:", finalErr);
    }
  }
};

const API_URL = process.env.EXPO_PUBLIC_API;

console.log("Kullanılan API URL:", API_URL);

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 saniyelik timeout
}) as AxiosInstance & { checkToken: () => Promise<boolean> };

// Add a request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const originalUrl = config.url || "";

    // Debug log the request
    console.log(`API Request: ${config.method?.toUpperCase()} ${originalUrl}`);

    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem("authToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("Token bulunamadı, istek yetkisiz olarak gönderiliyor");
    }

    // URL endpoint kontrolü ve düzeltmesi
    if (config.url) {
      // Backend sadece '/api' öneki OLMADAN istekleri kabul ediyor gibi görünüyor

      // /api ile başlayan URL'lerdeki prefix'i temizle
      if (config.url.startsWith("/api/")) {
        const newUrl = config.url.replace(/^\/api\//, "/");
        console.log(`API URL düzeltildi: ${originalUrl} -> ${newUrl}`);
        config.url = newUrl;
      }

      // /mobile ile başlayan URL'lerdeki prefix'i temizle
      if (config.url.startsWith("/mobile/")) {
        const newUrl = config.url.replace(/^\/mobile\//, "/");
        console.log(`Mobile URL düzeltildi: ${originalUrl} -> ${newUrl}`);
        config.url = newUrl;
      }

      // URL'in başında / olduğundan emin ol
      if (!config.url.startsWith("/") && !config.url.startsWith("http")) {
        config.url = "/" + config.url;
        console.log(`URL'e / eklendi: ${originalUrl} -> ${config.url}`);
      }
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Debug log the successful response
    if (process.env.NODE_ENV === "development") {
      console.log(
        `API Response Success: ${response.config.url} - Status: ${response.status}`
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Debug log the error - sadece kritik hataları konsola bas
    if (originalRequest?.url && error.response?.status) {
      // Development modunda daha detaylı log
      if (process.env.NODE_ENV === "development") {
        console.error(
          `API Response Error: ${originalRequest.url} - Status: ${error.response.status}`
        );
        console.error(`Error message: ${error.message}`);
      }
    }

    // Network veya server hatalarını işle
    if (error.message === "Network Error") {
      if (process.env.NODE_ENV === "development") {
        console.log("Ağ hatası - sunucuya erişilemiyor");
      }
      return Promise.reject(error);
    }

    if (error.code === "ECONNABORTED") {
      if (process.env.NODE_ENV === "development") {
        console.log("Bağlantı zaman aşımı");
      }
      return Promise.reject(error);
    }

    // Eğer cevap yoksa (server down olabilir)
    if (!error.response) {
      if (process.env.NODE_ENV === "development") {
        console.log("Sunucudan yanıt alınamadı");
      }
      return Promise.reject(error);
    }

    // Yetkisiz erişim hatası (401) ve henüz tekrar denenmemişse
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Login endpointi için özel kontrol - yanlış giriş bilgileri
      if (originalRequest.url && originalRequest.url.includes("/auth/login")) {
        if (process.env.NODE_ENV === "development") {
          console.log("Giriş hatası - yanlış kimlik bilgileri");
        }
        return Promise.reject(error);
      }

      // Şifre değiştirme URL'si için token yenileme işlemini atla
      if (
        originalRequest.url &&
        originalRequest.url.includes("/profile/password")
      ) {
        console.log("Şifre değiştirme endpointi için token yenileme atlanıyor");
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If token refresh is already in progress, queue this request
      if (isRefreshingToken) {
        console.log(
          "Token yenileme zaten devam ediyor, istek kuyruğa alınıyor"
        );
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      isRefreshingToken = true;

      try {
        // Token yenileme işlemi burada yapılacak
        console.log("Token yenileniyor...");
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        if (!refreshToken) {
          // Refresh token yoksa, kullanıcıyı çıkış yapmaya yönlendir
          console.log("Refresh token bulunamadı, oturum kapatılıyor");
          await forceLogout();
          processQueue(new Error("Oturum süresi doldu"));
          return Promise.reject(
            new Error("Oturum süresi doldu, tekrar giriş yapın")
          );
        }

        // Refresh token isteği
        try {
          const response = await axios.post(`${API_URL}/auth/session/refresh`, {
            refresh_token: refreshToken,
          });

          if (
            response.data &&
            response.data.data &&
            response.data.data.session
          ) {
            // Yeni tokenları kaydet
            const newToken = response.data.data.session.access_token;
            const newRefreshToken = response.data.data.session.refresh_token;

            await AsyncStorage.setItem("authToken", newToken);
            await AsyncStorage.setItem("refreshToken", newRefreshToken);

            console.log("Token başarıyla yenilendi");

            // Process all queued requests with the new token
            processQueue(null, newToken);

            // Orijinal isteği yeni token ile tekrarla
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } else {
            console.log("Token yenileme yanıtı geçersiz format");
            await forceLogout();
            processQueue(
              new Error("Token yenileme başarısız - geçersiz yanıt")
            );
            return Promise.reject(
              new Error("Token yenileme başarısız - geçersiz yanıt")
            );
          }
        } catch (refreshError) {
          console.error("Token yenileme isteği hatası:", refreshError);
          // Token yenileme isteği sırasında hata olursa sessionı temizle
          await forceLogout();
          processQueue(refreshError);
          return Promise.reject(
            new Error("Token yenileme başarısız - API hatası")
          );
        }
      } catch (refreshError) {
        console.error("Token yenileme işlemi hatası:", refreshError);
        // Kullanıcı oturumu kapatılmalı ve giriş sayfasına yönlendirilmeli
        await forceLogout();
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshingToken = false;
      }
    }

    // 404 hatası için özel işlemler
    if (error.response?.status === 404) {
      console.log("İstek yapılan kaynak bulunamadı:", error.config.url);
      // URL'de çifte /api/ sorunu varsa bunu düzelt ve tekrar dene
      if (error.config.url && error.config.url.includes("/api/api/")) {
        console.log("Hatalı URL formatı tespit edildi, düzeltiliyor...");
        const correctedUrl = error.config.url.replace("/api/api/", "/api/");
        error.config.url = correctedUrl;
        return axios(error.config);
      }
    }

    if (error.response?.status === 500) {
      console.log("Sunucu hatası:", error.response.data);
    }

    return Promise.reject(error);
  }
);

// Add auth endpoint to check token validity
apiClient.checkToken = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      console.log("Token bulunamadı, doğrulama yapılamıyor");
      return false;
    }

    await apiClient.get("/mobile/auth/check");
    console.log("Token doğrulandı");
    return true;
  } catch (error) {
    console.error("Token doğrulama hatası:", error);

    // Check if it's an auth error
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      console.log("Token geçersiz, oturum kapatılıyor");
      await forceLogout();
    }

    return false;
  }
};

export default apiClient;
