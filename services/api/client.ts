import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API URL'ini environment'tan al, yoksa gerçek IP'yi kullan
const API_URL =
  Constants.expoConfig?.extra?.apiUrl || "http://192.168.56.1:3000/api";

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

// Axios instance oluştur
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: DEFAULT_TIMEOUT, // İstek zaman aşımı süresi
});

// Request interceptor - token ekleme
apiClient.interceptors.request.use(
  async (config) => {
    try {
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

    if (error.response?.status === 401) {
      errorLog("Token geçersiz, siliniyor...");
      await AsyncStorage.removeItem("authToken");
    }

    // Hata yanıtını düzenle
    const errorResponse = {
      status: "error",
      message:
        error.response?.data?.message || error.message || "Bir hata oluştu",
      data: error.response?.data || null,
    };

    return Promise.reject(errorResponse);
  }
);
