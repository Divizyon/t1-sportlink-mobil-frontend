import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import apiClient from "./index";
import { User, LoginCredentials, RegisterData, AuthResponse } from "../types";

// Auth service için sabit değerler
const AUTH_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_DATA_KEY = "userData";

// Ağ bağlantısını kontrol etme fonksiyonu
const checkNetworkConnection = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected !== null ? netInfo.isConnected : false;
};

// Auth servisi
export const authService = {
  // Login with email and password
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      // Ağ bağlantısını kontrol et
      const isOnline = await checkNetworkConnection();
      if (!isOnline) {
        throw new Error("İnternet bağlantısı yok");
      }

      console.log("Login isteği gönderiliyor:", credentials.email);
      const response = await apiClient.post<AuthResponse>(
        "/auth/login",
        credentials
      );
      console.log("Login yanıtı alındı:", response.status);

      // Store tokens and user data
      if (response.data.data.session) {
        await AsyncStorage.setItem(
          AUTH_TOKEN_KEY,
          response.data.data.session.access_token
        );
        await AsyncStorage.setItem(
          REFRESH_TOKEN_KEY,
          response.data.data.session.refresh_token
        );
        await AsyncStorage.setItem(
          USER_DATA_KEY,
          JSON.stringify(response.data.data.user)
        );
      }

      return response.data.data.user;
    } catch (error: any) {
      console.error("Login error details:", error.message, error.code);

      // Özel hata mesajları ekleyin
      if (error.message === "Network Error") {
        console.error("Network error: API sunucusuna erişilemiyor");
      } else if (error.code === "ECONNABORTED") {
        console.error("Connection timeout: API isteği zaman aşımına uğradı");
      } else if (error.response) {
        console.error("API error:", error.response.status, error.response.data);
      }

      throw error;
    }
  },

  // Register a new user
  async register(data: RegisterData): Promise<User> {
    try {
      // Ağ bağlantısını kontrol et
      const isOnline = await checkNetworkConnection();
      if (!isOnline) {
        throw new Error("İnternet bağlantısı yok");
      }

      console.log("Register isteği gönderiliyor:", data.email);
      const response = await apiClient.post<AuthResponse>(
        "/auth/register",
        data
      );
      console.log("Register yanıtı alındı:", response.status);

      // Store tokens and user data if available
      if (response.data.data && response.data.data.session) {
        await AsyncStorage.setItem(
          AUTH_TOKEN_KEY,
          response.data.data.session.access_token
        );
        await AsyncStorage.setItem(
          REFRESH_TOKEN_KEY,
          response.data.data.session.refresh_token
        );
        await AsyncStorage.setItem(
          USER_DATA_KEY,
          JSON.stringify(response.data.data.user)
        );
      }

      return response.data.data.user;
    } catch (error: any) {
      console.error("Register error details:", error.message, error.code);

      // Özel hata mesajları ekleyin
      if (error.message === "Network Error") {
        console.error("Network error: API sunucusuna erişilemiyor");
      } else if (error.code === "ECONNABORTED") {
        console.error("Connection timeout: API isteği zaman aşımına uğradı");
      } else if (error.response) {
        console.error("API error:", error.response.status, error.response.data);
      }

      throw error;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      // Ağ bağlantısını kontrol et
      const isOnline = await checkNetworkConnection();
      if (!isOnline) {
        console.warn(
          "İnternet bağlantısı olmadığından, sadece yerel oturum kapatılacak"
        );
      } else {
        // Token'ı al
        const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

        if (token) {
          try {
            // Logout endpoint'ine istek gönder
            await apiClient.post("/auth/logout");
            console.log("Sunucu oturumu başarıyla kapatıldı");
          } catch (error: any) {
            console.error(
              "Logout API error details:",
              error.message,
              error.code
            );
            // Sunucu hatası olsa bile yerel oturumu kapatmaya devam et
          }
        }
      }
    } catch (error: any) {
      console.error("Logout error details:", error.message, error.code);
    } finally {
      // Yerel depolamadan oturum verilerini temizle
      await this.clearSession();
      console.log("Yerel oturum verileri temizlendi");
    }
  },

  // Kullanıcının oturum durumunu kontrol et
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) return false;

      // Token geçerliliğini kontrol etmek için API'ye istek yapabilirsiniz
      // Basit bir token kontrolü için sadece token varlığını kontrol ediyoruz
      return true;
    } catch (error) {
      console.error("isAuthenticated error:", error);
      return false;
    }
  },

  // Mevcut kullanıcı verilerini getir
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userData) return null;

      return JSON.parse(userData) as User;
    } catch (error) {
      console.error("getCurrentUser error:", error);
      return null;
    }
  },

  // Oturum bilgilerini temizleme
  async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    } catch (error) {
      console.error("Oturum temizleme hatası:", error);
    }
  },
};

export default authService;
