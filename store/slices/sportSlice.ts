import { create } from 'zustand';
import { SportState, Sport } from '../types';
import { apiService } from '../../api/apiService';

const initialState: SportState = {
  sports: [],
  selectedSport: null,
  categories: [],
  isLoading: false,
  error: null,
};

export const useSportStore = create<SportState & {
  fetchSports: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  setSelectedSport: (sport: Sport | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}>((set) => ({
  ...initialState,

  fetchSports: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.sport.getList();
      set({
        sports: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch sports',
        isLoading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.sport.getCategories();
      set({
        categories: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
        isLoading: false,
      });
    }
  },

  setSelectedSport: (sport: Sport | null) => set({ selectedSport: sport }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
})); 