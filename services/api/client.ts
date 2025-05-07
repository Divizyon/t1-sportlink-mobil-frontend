import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL'ini environment'tan al, yoksa localhost'u kullan
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

// Debug modu aktif
const DEBUG = true;

// Debug log fonksiyonu
const debugLog = (...args: any[]) => {
  if (DEBUG) {
    console.log('[API Debug]', ...args);
  }
};

// Hata log fonksiyonu
const errorLog = (...args: any[]) => {
  if (DEBUG) {
    console.error('[API Error]', ...args);
  }
};

debugLog('API URL:', API_URL);

// Axios instance oluştur
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token ekleme
apiClient.interceptors.request.use(
  async (config) => {
    try {
      debugLog('İstek başlatılıyor:', {
        url: config.url,
        method: config.method,
        params: config.params,
        data: config.data
      });

      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        debugLog('Token eklendi:', token.substring(0, 20) + '...');
      } else {
        errorLog('Token bulunamadı!');
      }
      return config;
    } catch (error) {
      errorLog('Token eklenirken hata:', error);
      return config;
    }
  },
  (error) => {
    errorLog('İstek hatası:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
apiClient.interceptors.response.use(
  (response) => {
    debugLog('Başarılı yanıt:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    errorLog('API Hatası:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      stack: error.stack
    });

    if (error.response?.status === 401) {
      errorLog('Token geçersiz, siliniyor...');
      await AsyncStorage.removeItem('authToken');
    }

    // Hata yanıtını düzenle
    const errorResponse = {
      status: 'error',
      message: error.response?.data?.message || error.message || 'Bir hata oluştu',
      data: error.response?.data || null
    };

    return Promise.reject(errorResponse);
  }
); 