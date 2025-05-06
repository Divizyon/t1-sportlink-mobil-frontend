import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../api/authService";
import { User, LoginCredentials, RegisterData } from "../types";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    first_name: string,
    last_name: string
  ) => Promise<User>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
          } else {
            // Kullanıcı verileri alınamazsa oturumu kapat
            console.warn("Kullanıcı verileri alınamadı, oturum kapatılıyor");
            await authService.logout();
            setIsAuthenticated(false);
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
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const userData = await authService.login({ email, password });
      setUser(userData);
      setIsAuthenticated(true);
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
      });
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
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
