import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API,
  // Buraya gerekirse headers veya interceptors ekleyebilirsin
});

// Her isteğe otomatik olarak Authorization header'ı ekle
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
