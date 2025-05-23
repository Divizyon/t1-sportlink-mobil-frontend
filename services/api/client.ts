import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { showToast } from "../../src/utils/toastHelper";
import { NetworkErrorManager } from "../../components/common/NetworkErrorOverlay";

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
const DEFAULT_TIMEOUT = 20000; // 20 saniye (10 yerine 20)

// MAX_RETRY_ATTEMPTS: Bir isteğin başarısız olması durumunda kaç kez deneneceği
const MAX_RETRY_ATTEMPTS = 3;

// RETRY_DELAY_MS: İki deneme arasındaki bekleme süresi (ms)
const RETRY_DELAY_MS = 800;

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

// Bekleme fonksiyonu
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

// Basit bir ağ bağlantı kontrolü - fetch kullanarak
const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    // 1 saniye zaman aşımı ile basit bir test
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    // API URL'i test ediyoruz
    await fetch(API_URL || "https://www.google.com", {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    console.log("Ağ bağlantısı kontrol hatası:", error);
    return false;
  }
};

// Axios instance oluştur
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
    Expires: "0",
  },
  timeout: DEFAULT_TIMEOUT,
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
      return config; // Hatayı iletmek yerine isteğe devam et, response interceptor'da hata yakalanacak
    }
  },
  (error) => {
    errorLog("İstek hatası:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi ve tekrar deneme mekanizması
apiClient.interceptors.response.use(
  (response) => {
    debugLog("Başarılı yanıt:", {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  async (error) => {
    // Retry mekanizmasını kontrol et
    const config = error.config || {};
    config.headers = config.headers || {}; // Eğer headers yoksa ekleyelim
    const retryAttempt = config.__retryAttempt || 0;

    // Zaman aşımı hatası kontrolü
    if (
      error.code === "ECONNABORTED" ||
      error.message === "Network Error" ||
      (error.message && error.message.includes("timeout"))
    ) {
      // Zaman aşımı hatası, tekrar deneyelim
      if (retryAttempt < MAX_RETRY_ATTEMPTS) {
        console.log(
          `[API Info] Ağ hatası, tekrar deneniyor (${
            retryAttempt + 1
          }/${MAX_RETRY_ATTEMPTS})`,
          {
            url: config?.url,
            error: error.message,
          }
        );

        if (retryAttempt === 0) {
          // İlk hatada kullanıcıya bildirim göster
          NetworkErrorManager.showError(
            "Bağlantı sorunu yaşanıyor, yeniden bağlanılıyor...",
            5000
          );
        }

        // Bağlantı durumunu kontrol et
        const isConnected = await checkNetworkConnection();
        if (!isConnected) {
          console.log(
            "[API Info] İnternet bağlantısı yok, istek iptal ediliyor"
          );
          NetworkErrorManager.showError(
            "İnternet bağlantınızı kontrol edin ve tekrar deneyin.",
            0 // Sıfır, manuel kapatılana kadar görünür kalmasını sağlar
          );
          return Promise.reject({
            status: "error",
            message: "İnternet bağlantınızı kontrol edin ve tekrar deneyin.",
            data: null,
          });
        }

        // Bekleme süresi: üstel geri çekilme (exponential backoff)
        const delay = RETRY_DELAY_MS * Math.pow(2, retryAttempt);
        await sleep(delay);

        // İsteği tekrarla
        config.__retryAttempt = retryAttempt + 1;
        return apiClient(config);
      }

      console.log(
        "[API Info] Maksimum deneme sayısına ulaşıldı, istek başarısız:",
        {
          url: config?.url,
          timeout: config?.timeout,
        }
      );

      // Tüm denemeler başarısız olduğunda kullanıcıya bildirim göster
      NetworkErrorManager.showError(
        "Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.",
        8000
      );

      return Promise.reject({
        status: "error",
        message: "Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.",
        data: null,
      });
    }

    // Hata durumlarını sessizce logla
    const endpoint = config?.url || "bilinmeyen endpoint";
    const statusCode = error.response?.status || "bilinmeyen";

    // Network hatası denemeleri (5xx hatalar)
    if (statusCode >= 500 && statusCode < 600) {
      if (retryAttempt < MAX_RETRY_ATTEMPTS) {
        console.log(
          `[API Info] ${statusCode} hatası, tekrar deneniyor (${
            retryAttempt + 1
          }/${MAX_RETRY_ATTEMPTS})`,
          {
            url: endpoint,
            status: statusCode,
          }
        );

        if (retryAttempt === 0) {
          // İlk sunucu hatasında kullanıcıya bildirim göster
          NetworkErrorManager.showError(
            "Sunucu yanıt verirken sorun yaşandı, yeniden deneniyor...",
            3000
          );
        }

        // Bekleme süresi: üstel geri çekilme (exponential backoff)
        const delay = RETRY_DELAY_MS * Math.pow(2, retryAttempt);
        await sleep(delay);

        // İsteği tekrarla
        config.__retryAttempt = retryAttempt + 1;
        return apiClient(config);
      }

      // Tüm denemeler başarısız olduğunda
      NetworkErrorManager.showError(
        "Sunucu şu anda meşgul. Lütfen daha sonra tekrar deneyin.",
        5000
      );
    }

    // Arkadaşlık istekleri veya 400/404 hataları için ERROR log oluşturma, sadece INFO
    if (
      endpoint.includes("/friendships") ||
      endpoint.includes("/user-reports") ||
      endpoint.includes("/event-ratings") ||
      statusCode === 400 ||
      statusCode === 404
    ) {
      // Bazı endpointler için hataları daha sessiz loglayalım
      console.log(`[API Info] Endpoint yanıtı (${statusCode}): ${endpoint}`);
      if (error.response?.data?.message) {
        console.log(`[API Info] Mesaj: ${error.response.data.message}`);
      }

      // User-reports endpointleri için özel hata yönetimi
      if (endpoint.includes("/user-reports") && retryAttempt < 2) {
        // Bu endpointler için sessizce yeniden deneme yap
        console.log(
          `[API Info] user-reports endpoint tekrar deneniyor: ${endpoint}`
        );

        const delay = RETRY_DELAY_MS * Math.pow(2, retryAttempt);
        await sleep(delay);

        config.__retryAttempt = (retryAttempt || 0) + 1;
        return apiClient(config);
      }

      // İşlem devam etsin, hata başka yerde yakalanacak
    } else if (statusCode !== 401) {
      // 401 olmayan diğer hatalar için normal log
      console.log("[API Info]", error.message, error.response?.data);
    }

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

export default apiClient;
