import { create } from 'zustand';
import { AuthState, User } from '../types';
import { apiService } from '../../api/apiService';
import * as SecureStore from 'expo-secure-store';

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}>((set, get) => ({
  ...initialState,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.auth.login({ email, password });
      
      // Store tokens securely
      await SecureStore.setItemAsync('userToken', response.data.token);
      await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
      
      set({
        user: response.data.user,
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      });
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.auth.register({ name, email, password });
      
      // Store tokens securely
      await SecureStore.setItemAsync('userToken', response.data.token);
      await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
      
      set({
        user: response.data.user,
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Registration failed',
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      await apiService.auth.logout();
      
      // Clear stored tokens
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('refreshToken');
      
      set(initialState);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Logout failed',
        isLoading: false,
      });
    }
  },

  setUser: (user: User | null) => set({ user }),
  setToken: (token: string | null) => set({ token }),
  setRefreshToken: (refreshToken: string | null) => set({ refreshToken }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
})); 