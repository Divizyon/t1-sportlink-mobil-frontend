import { create } from 'zustand';
import { NewsState, News } from '../types';
import { apiService } from '../../api/apiService';

const initialState: NewsState = {
  news: [],
  categories: [],
  selectedNews: null,
  isLoading: false,
  error: null,
};

export const useNewsStore = create<NewsState & {
  fetchNews: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchNewsDetail: (id: string) => Promise<void>;
  setSelectedNews: (news: News | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}>((set) => ({
  ...initialState,

  fetchNews: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.news.getList();
      set({
        news: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch news',
        isLoading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.news.getCategories();
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

  fetchNewsDetail: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.news.getDetail(id);
      set({
        selectedNews: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch news detail',
        isLoading: false,
      });
    }
  },

  setSelectedNews: (news: News | null) => set({ selectedNews: news }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
})); 