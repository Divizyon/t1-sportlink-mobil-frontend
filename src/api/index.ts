import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// API adresini yapılandırma
// Farklı ortamlar için doğru IP adresi
let API_URL = "";

// Emülatör/Simülatör için
if (__DEV__) {
  // Android Emülatör için özel IP
  if (Platform.OS === "android") {
    API_URL = "http://192.168.1.137:3000/api"; // Android emülatör için localhost karşılığı
  }
  // iOS Simülatör için localhost
  else if (Platform.OS === "ios") {
    API_URL = "http://localhost:3000/api";
  }
  // Gerçek cihaz için kendi bilgisayarınızın IP'si
  else {
    API_URL = "http://192.168.1.137:3000/api"; // Kendi ağınıza göre değiştirin
  }
} else {
  // Üretim ortamı için
  API_URL = "https://api.sportlink.com/api";
}

console.log("Kullanılan API URL:", API_URL);

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15 saniyelik timeout
});

// Add a request interceptor to add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem("authToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // URL yolunda çift '/api' olup olmadığını kontrol et
    if (config.url && config.url.startsWith("/api/")) {
      // URL'den başındaki '/api/' kısmını çıkar
      config.url = config.url.replace(/^\/api\//, "/");
      console.log("URL düzeltildi:", config.url);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Network veya server hatalarını işle
    if (error.message === "Network Error") {
      console.log("Ağ hatası - sunucuya erişilemiyor");
      return Promise.reject(error);
    }

    if (error.code === "ECONNABORTED") {
      console.log("Bağlantı zaman aşımı");
      return Promise.reject(error);
    }

    // Eğer cevap yoksa (server down olabilir)
    if (!error.response) {
      console.log("Sunucudan yanıt alınamadı");
      return Promise.reject(error);
    }

    // Yetkisiz erişim hatası (401) ve henüz tekrar denenmemişse
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Şifre değiştirme URL'si için token yenileme işlemini atla
      if (
        originalRequest.url &&
        originalRequest.url.includes("/profile/password")
      ) {
        console.log("Şifre değiştirme endpointi için token yenileme atlanıyor");
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        // Token yenileme işlemi burada yapılacak
        console.log("Token yenileniyor...");
        const refreshToken = await AsyncStorage.getItem("refreshToken");

        if (!refreshToken) {
          // Refresh token yoksa, kullanıcıyı çıkış yapmaya yönlendir
          await AsyncStorage.removeItem("authToken");
          await AsyncStorage.removeItem("refreshToken");
          await AsyncStorage.removeItem("userData");
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
            await AsyncStorage.setItem(
              "authToken",
              response.data.data.session.access_token
            );
            await AsyncStorage.setItem(
              "refreshToken",
              response.data.data.session.refresh_token
            );

            // Orijinal isteği yeni token ile tekrarla
            originalRequest.headers.Authorization = `Bearer ${response.data.data.session.access_token}`;
            return axios(originalRequest);
          }

          // Token yenileme başarısız olursa sessionı temizle
          await AsyncStorage.removeItem("authToken");
          await AsyncStorage.removeItem("refreshToken");
          await AsyncStorage.removeItem("userData");
          return Promise.reject(new Error("Token yenileme başarısız"));
        } catch (error) {
          // Token yenileme isteği sırasında hata olursa sessionı temizle
          await AsyncStorage.removeItem("authToken");
          await AsyncStorage.removeItem("refreshToken");
          await AsyncStorage.removeItem("userData");
          return Promise.reject(new Error("Token yenileme başarısız"));
        }
      } catch (refreshError) {
        console.error("Token yenileme hatası:", refreshError);
        // Kullanıcı oturumu kapatılmalı ve giriş sayfasına yönlendirilmeli
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("refreshToken");
        await AsyncStorage.removeItem("userData");

        return Promise.reject(refreshError);
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
      console.log("Sunucu hatası");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
