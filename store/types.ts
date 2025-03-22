// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Sport types
export interface Sport {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category: string;
}

export interface SportState {
  sports: Sport[];
  selectedSport: Sport | null;
  categories: string[];
  isLoading: boolean;
  error: string | null;
}

// Match types
export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  status: 'scheduled' | 'live' | 'completed';
  score?: {
    home: number;
    away: number;
  };
}

export interface MatchState {
  matches: Match[];
  liveMatches: Match[];
  upcomingMatches: Match[];
  pastMatches: Match[];
  selectedMatch: Match | null;
  isLoading: boolean;
  error: string | null;
}

// Tournament types
export interface Tournament {
  id: string;
  name: string;
  sport: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  teams: string[];
}

export interface TournamentState {
  tournaments: Tournament[];
  selectedTournament: Tournament | null;
  isLoading: boolean;
  error: string | null;
}

// News types
export interface News {
  id: string;
  title: string;
  content: string;
  image?: string;
  category: string;
  date: string;
}

export interface NewsState {
  news: News[];
  categories: string[];
  selectedNews: News | null;
  isLoading: boolean;
  error: string | null;
}

// Root store type
export interface RootState {
  auth: AuthState;
  sport: SportState;
  match: MatchState;
  tournament: TournamentState;
  news: NewsState;
} 