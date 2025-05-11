import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the User type
interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

// Define the AuthContext type
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: async () => {},
  logout: async () => {},
});

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load saved authentication state on app start
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        // Load token
        const savedToken = await AsyncStorage.getItem('token');
        
        // Load user data
        const savedUserData = await AsyncStorage.getItem('user');
        const savedUser = savedUserData ? JSON.parse(savedUserData) : null;
        
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAuthState();
  }, []);

  // Login function
  const login = async (newToken: string, newUser: User) => {
    try {
      // Save token to storage
      await AsyncStorage.setItem('token', newToken);
      
      // Save user to storage
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      
      // Update state
      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error during login:', error);
      throw new Error('Login failed');
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear storage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // Update state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
      throw new Error('Logout failed');
    }
  };

  // Context value
  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
  };

  // Render loading state or provider
  if (loading) {
    return null; // or a loading component
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext; 