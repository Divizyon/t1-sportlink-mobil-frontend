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
  forceLogout: (customMessage?: string) => Promise<void>;
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
  const initialLoadCompleteRef = useRef(false);

  // Force logout and navigate to login screen
  const forceLogout = useCallback(async (customMessage?: string) => {
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
      
      // Show toast notification with custom message if provided
      if (customMessage) {
        showToast(customMessage, "error");
      }
      
      // Force navigation to login after a slight delay to allow state updates
      setTimeout(() => {
        console.log("Redirecting to login page...");
        try {
          // First try to use replace if we can go back
          if (router.canGoBack()) {
            router.replace("/(auth)/signin");
          } else {
            // Otherwise just navigate to it
            router.navigate("/(auth)/signin");
          }
        } catch (err) {
          console.error("Navigation error:", err);
          // Fallback navigation
          router.navigate("/(auth)/signin");
        }
      }, 500);
    } catch (error) {
      console.error("Force logout error:", error);
      // Fallback direct navigation if something fails
      try {
        router.replace("/(auth)/signin");
      } catch (err) {
        console.error("Error during fallback navigation:", err);
        router.navigate("/(auth)/signin");
      }
    }
  }, []);

  // Validate token with the API
  const validateToken = useCallback(async (): Promise<boolean> => {
    // Skip validation for non-authenticated users
    if (!isAuthenticated) {
      console.log("Not authenticated, skipping token validation");
      return false;
    }
    
    try {
      // Check if token exists
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        console.log("No token found, session is invalid");
        return false;
      }
      
      // For more robust validation, we should ideally check with the server
      // But for now, just having a token is considered valid
      
      // Optional: Add actual token validation with API endpoint if available
      // const isValid = await apiClient.checkToken();
      // return isValid;
      
      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      // In case of error, consider the token invalid to be safe
      return false;
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

        // Check authentication status
        const isAuth = await authService.isAuthenticated();
        setIsAuthenticated(isAuth);

        if (isAuth) {
          // If authenticated, load user data
          const userData = await authService.getCurrentUser();
          if (userData) {
            setUser(userData);
            
            // Skip token validation on startup to prevent redirects from welcome screen
            // Set the token as valid by default
            setIsTokenValid(true);
            initialLoadCompleteRef.current = true;
          } else {
            // Clear authentication if no user data found but don't force redirect
            console.warn("No user data found, clearing authentication state");
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
        // On error, just clear authentication state but don't force redirect
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
        initialLoadCompleteRef.current = true;
      }
    };

    loadUser();
  }, []); // Removed dependencies to prevent loops

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
