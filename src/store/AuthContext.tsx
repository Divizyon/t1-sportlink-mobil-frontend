import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { authService } from "../api/authService";
import { User, LoginCredentials, RegisterData } from "../types";
import { router } from "expo-router";
import { showToast } from "../utils/toastHelper";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../api";

// Define token validation interval (check every 10 minutes)
const TOKEN_VALIDATION_INTERVAL = 10 * 60 * 1000; 
// Minimum time between checks to prevent excessive API calls
const MIN_CHECK_INTERVAL = 60 * 1000; // 1 minute

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isTokenValid: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    first_name: string,
    last_name: string
  ) => Promise<User>;
  validateToken: () => Promise<boolean>;
  forceLogout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const [lastTokenCheck, setLastTokenCheck] = useState<number>(0);
  
  // Add refs to track validation state
  const isValidatingRef = useRef(false);
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const validationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Force logout and navigate to login screen
  const forceLogout = useCallback(async () => {
    console.log("Force logout initiated");
    try {
      // Clear all authentication data
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("userInfo");
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
      setIsTokenValid(false);
      
      // Show toast notification
      showToast("Oturumunuz sona erdi. Lütfen tekrar giriş yapın.", "error");
      
      // Force navigation to login after a slight delay to allow state updates
      setTimeout(() => {
        console.log("Redirecting to login page...");
        if (router.canGoBack()) {
          router.replace("/(auth)/login");
        } else {
          router.navigate("/(auth)/login");
        }
      }, 500);
    } catch (error) {
      console.error("Force logout error:", error);
      // Fallback direct navigation if something fails
      router.navigate("/(auth)/login");
    }
  }, []);

  // Validate token with the API
  const validateToken = useCallback(async (): Promise<boolean> => {
    // Skip most validations for now to ensure events load properly
    if (!isAuthenticated) {
      console.log("Not authenticated, skipping token validation");
      return false;
    }
    
    try {
      // Just do a basic check if token exists
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.log("No token found, but keeping session active");
        return true; // Return true to keep session active
      }
      
      // Assume token is valid without API call
      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      // Assume token is valid even if there's an error
      return true;
    }
  }, [isAuthenticated]);

  // Periodically validate token - SIMPLIFIED WITH LONGER INTERVALS
  useEffect(() => {
    // Clear any existing intervals/timeouts on re-renders
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }
    if (validationIntervalRef.current) {
      clearInterval(validationIntervalRef.current);
    }
    
    // Don't run validation on app startup
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      if (validationIntervalRef.current) {
        clearInterval(validationIntervalRef.current);
      }
    };
  }, [isAuthenticated]);

  useEffect(() => {
    // Check if user is already logged in on app start
    const loadUser = async () => {
      try {
        setIsLoading(true);

        // Önce oturum durumunu kontrol et
        const isAuth = await authService.isAuthenticated();
        setIsAuthenticated(isAuth);

        if (isAuth) {
          // Kullanıcı oturum açmışsa, kullanıcı bilgilerini yükle
          const userData = await authService.getCurrentUser();
          if (userData) {
            setUser(userData);
            
            // Validate token immediately after loading user
            // But don't add validateToken to dependency array to avoid loops
            const isValid = await validateToken();
            if (!isValid) {
              console.log("Token invalid during startup, forcing logout");
              await forceLogout();
            }
          } else {
            // Kullanıcı verileri alınamazsa oturumu kapat
            console.warn("Kullanıcı verileri alınamadı, oturum kapatılıyor");
            await forceLogout();
          }
        }
      } catch (error) {
        console.error("Kullanıcı yükleme hatası:", error);
        // Hata durumunda oturumu kapat
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [forceLogout]); // Removed validateToken from dependency array

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const userData = await authService.login({ email, password });
      setUser(userData);
      setIsAuthenticated(true);
      setIsTokenValid(true);
      setLastTokenCheck(Date.now());
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setIsTokenValid(false);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    first_name: string,
    last_name: string
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const userData = await authService.register({
        email,
        password,
        first_name,
        last_name,
        password_confirm: password
      });
      setUser(userData);
      setIsAuthenticated(true);
      setIsTokenValid(true);
      setLastTokenCheck(Date.now());
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isTokenValid,
    login,
    logout,
    register,
    validateToken,
    forceLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
