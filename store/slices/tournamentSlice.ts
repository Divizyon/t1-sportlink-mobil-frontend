import { create } from 'zustand';
import { TournamentState, Tournament } from '../types';
import { apiService } from '../../api/apiService';

const initialState: TournamentState = {
  tournaments: [],
  selectedTournament: null,
  isLoading: false,
  error: null,
};

export const useTournamentStore = create<TournamentState & {
  fetchTournaments: () => Promise<void>;
  fetchTournamentDetails: (id: string) => Promise<void>;
  fetchStandings: (id: string) => Promise<void>;
  fetchSchedule: (id: string) => Promise<void>;
  setSelectedTournament: (tournament: Tournament | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}>((set) => ({
  ...initialState,

  fetchTournaments: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.tournament.getList();
      set({
        tournaments: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch tournaments',
        isLoading: false,
      });
    }
  },

  fetchTournamentDetails: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.tournament.getDetail(id);
      set({
        selectedTournament: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch tournament details',
        isLoading: false,
      });
    }
  },

  fetchStandings: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.tournament.getStandings(id);
      set({
        selectedTournament: {
          ...get().selectedTournament!,
          standings: response.data,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch standings',
        isLoading: false,
      });
    }
  },

  fetchSchedule: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.tournament.getSchedule(id);
      set({
        selectedTournament: {
          ...get().selectedTournament!,
          schedule: response.data,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch schedule',
        isLoading: false,
      });
    }
  },

  setSelectedTournament: (tournament: Tournament | null) => set({ selectedTournament: tournament }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
})); 