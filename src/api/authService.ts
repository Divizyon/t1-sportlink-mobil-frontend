import apiClient from "./index";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Interface for login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Interface for registration data
export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

// Interface for user data
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

// Interface for authentication response
export interface AuthResponse {
  status: string;
  data: {
    user: User;
    session: {
      access_token: string;
      refresh_token: string;
    };
  };
}

const AUTH_TOKEN_KEY = "authToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_DATA_KEY = "userData";

export const authService = {
  // Login with email and password
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/auth/login",
        credentials
      );

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
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Register a new user
  async register(data: RegisterData): Promise<User> {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/auth/register",
        data
      );

      // Store tokens and user data if available
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
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear stored data regardless of API success
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(USER_DATA_KEY);
    }
  },

  // Check if user is logged in
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },

  // Get current user data
  async getCurrentUser(): Promise<User | null> {
    try {
      const userDataString = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userDataString) return null;

      return JSON.parse(userDataString);
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  // Refresh authentication token
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return false;

      const response = await apiClient.get("/auth/session/refresh");

      if (response.data.data.session) {
        await AsyncStorage.setItem(
          AUTH_TOKEN_KEY,
          response.data.data.session.access_token
        );
        await AsyncStorage.setItem(
          REFRESH_TOKEN_KEY,
          response.data.data.session.refresh_token
        );
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  },
};

export default authService;
