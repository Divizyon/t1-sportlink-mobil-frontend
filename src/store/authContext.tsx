import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../api';
import {
  AuthContextType,
  AuthState,
  SignInCredentials,
  SignUpCredentials,
  User,
} from '../types';

// Initial state
const initialAuthState: AuthState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  token: null,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'SIGN_IN_REQUEST' }
  | { type: 'SIGN_IN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'SIGN_IN_FAILURE'; payload: string }
  | { type: 'SIGN_UP_REQUEST' }
  | { type: 'SIGN_UP_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'SIGN_UP_FAILURE'; payload: string }
  | { type: 'SIGN_OUT' }
  | { type: 'RESTORE_TOKEN'; payload: { user: User; token: string } }
  | { type: 'CLEAR_ERROR' };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SIGN_IN_REQUEST':
    case 'SIGN_UP_REQUEST':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'SIGN_IN_SUCCESS':
    case 'SIGN_UP_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'SIGN_IN_FAILURE':
    case 'SIGN_UP_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'SIGN_OUT':
      return {
        ...initialAuthState,
        isLoading: false,
      };
    case 'RESTORE_TOKEN':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Storage keys
const TOKEN_STORAGE_KEY = '@SportLink:token';
const USER_STORAGE_KEY = '@SportLink:user';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialAuthState);

  // Attempt to restore token on app load
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        const userString = await AsyncStorage.getItem(USER_STORAGE_KEY);

        if (token && userString) {
          const user = JSON.parse(userString);
          
          // İsteğe bağlı: Tokeni doğrulama api isteği
          // const currentUser = await authApi.getCurrentUser(token);
          
          dispatch({
            type: 'RESTORE_TOKEN',
            payload: { user, token },
          });
        } else {
          dispatch({ type: 'SIGN_OUT' });
        }
      } catch (error) {
        dispatch({ type: 'SIGN_OUT' });
      }
    };

    bootstrapAsync();
  }, []);

  // Auth methods
  const signIn = async (credentials: SignInCredentials) => {
    try {
      dispatch({ type: 'SIGN_IN_REQUEST' });
      
      const { user, token } = await authApi.signIn(credentials);
      
      // Save to storage
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      
      dispatch({
        type: 'SIGN_IN_SUCCESS',
        payload: { user, token },
      });
    } catch (error) {
      let errorMessage = 'Giriş işlemi başarısız oldu';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      dispatch({
        type: 'SIGN_IN_FAILURE',
        payload: errorMessage,
      });
    }
  };

  const signUp = async (credentials: SignUpCredentials) => {
    try {
      dispatch({ type: 'SIGN_UP_REQUEST' });
      
      const { user, token } = await authApi.signUp(credentials);
      
      // Save to storage
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      
      dispatch({
        type: 'SIGN_UP_SUCCESS',
        payload: { user, token },
      });
    } catch (error) {
      let errorMessage = 'Kayıt işlemi başarısız oldu';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      dispatch({
        type: 'SIGN_UP_FAILURE',
        payload: errorMessage,
      });
    }
  };

  const signOut = async () => {
    // Remove from storage
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    
    dispatch({ type: 'SIGN_OUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        signIn,
        signUp,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 