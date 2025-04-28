import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

// API base URL'i burada tanımlayın
const BASE_URL = 'https://api.example.com'; // TODO: Update with your actual API URL

// Axios instance oluşturma
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // SecureStore'dan token'ı al
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // 401 Unauthorized error handling
    if (error.response?.status === 401) {
      try {
        // Refresh token logic here
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken && originalRequest) {
          // Implement your refresh token logic here
          // const newToken = await refreshTokenAPI(refreshToken);
          // await SecureStore.setItemAsync('userToken', newToken);
          // originalRequest.headers.Authorization = `Bearer ${newToken}`;
          // return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Handle refresh token error
        // Usually logout the user
        await SecureStore.deleteItemAsync('userToken');
        await SecureStore.deleteItemAsync('refreshToken');
        // Navigate to login screen or dispatch logout action
      }
    }

    // Global error handling
    handleGlobalError(error);
    return Promise.reject(error);
  }
);

// Global error handler
const handleGlobalError = (error: AxiosError) => {
  if (error.response) {
    // Server error response (4xx, 5xx)
    console.error('Server Error:', error.response.data);
    // You can implement custom error handling here
    // Example: show toast message, update error state, etc.
  } else if (error.request) {
    // Request made but no response received
    console.error('Network Error:', error.request);
  } else {
    // Error in request configuration
    console.error('Error:', error.message);
  }
};

export default axiosInstance; 