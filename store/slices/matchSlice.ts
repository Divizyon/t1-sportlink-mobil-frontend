import { create } from 'zustand';
import { MatchState, Match } from '../types';
import { apiService } from '../../api/apiService';

const initialState: MatchState = {
  matches: [],
  liveMatches: [],
  upcomingMatches: [],
  pastMatches: [],
  selectedMatch: null,
  isLoading: false,
  error: null,
};

export const useMatchStore = create<MatchState & {
  fetchMatches: () => Promise<void>;
  fetchLiveMatches: () => Promise<void>;
  fetchUpcomingMatches: () => Promise<void>;
  fetchPastMatches: () => Promise<void>;
  setSelectedMatch: (match: Match | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}>((set) => ({
  ...initialState,

  fetchMatches: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.match.getList();
      set({
        matches: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch matches',
        isLoading: false,
      });
    }
  },

  fetchLiveMatches: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.match.getLiveMatches();
      set({
        liveMatches: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch live matches',
        isLoading: false,
      });
    }
  },

  fetchUpcomingMatches: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.match.getUpcomingMatches();
      set({
        upcomingMatches: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch upcoming matches',
        isLoading: false,
      });
    }
  },

  fetchPastMatches: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.match.getPastMatches();
      set({
        pastMatches: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch past matches',
        isLoading: false,
      });
    }
  },

  setSelectedMatch: (match: Match | null) => set({ selectedMatch: match }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
})); 