import axiosInstance from './axiosConfig';
import { API_ENDPOINTS } from './endpoints';

// Response tipleri
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Auth tipleri
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// User tipleri
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: string;
}

interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

// API servisleri
export const apiService = {
  // Auth servisleri
  auth: {
    login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
      const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
        API_ENDPOINTS.AUTH.LOGIN,
        data
      );
      return response.data;
    },

    register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
      const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
        API_ENDPOINTS.AUTH.REGISTER,
        data
      );
      return response.data;
    },

    logout: async (): Promise<void> => {
      await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
    },

    refreshToken: async (refreshToken: string): Promise<ApiResponse<{ token: string }>> => {
      const response = await axiosInstance.post<ApiResponse<{ token: string }>>(
        API_ENDPOINTS.AUTH.REFRESH_TOKEN,
        { refreshToken }
      );
      return response.data;
    },

    forgotPassword: async (email: string): Promise<ApiResponse<void>> => {
      const response = await axiosInstance.post<ApiResponse<void>>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      );
      return response.data;
    },

    resetPassword: async (token: string, password: string): Promise<ApiResponse<void>> => {
      const response = await axiosInstance.post<ApiResponse<void>>(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        { token, password }
      );
      return response.data;
    },
  },

  // User servisleri
  user: {
    getProfile: async (): Promise<ApiResponse<UserProfile>> => {
      const response = await axiosInstance.get<ApiResponse<UserProfile>>(
        API_ENDPOINTS.USER.PROFILE
      );
      return response.data;
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> => {
      const response = await axiosInstance.put<ApiResponse<UserProfile>>(
        API_ENDPOINTS.USER.UPDATE_PROFILE,
        data
      );
      return response.data;
    },

    changePassword: async (oldPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
      const response = await axiosInstance.post<ApiResponse<void>>(
        API_ENDPOINTS.USER.CHANGE_PASSWORD,
        { oldPassword, newPassword }
      );
      return response.data;
    },
  },

  // Sport servisleri
  sport: {
    getList: async (): Promise<ApiResponse<any[]>> => {
      const response = await axiosInstance.get<ApiResponse<any[]>>(API_ENDPOINTS.SPORT.LIST);
      return response.data;
    },

    getDetail: async (id: string): Promise<ApiResponse<any>> => {
      const response = await axiosInstance.get<ApiResponse<any>>(API_ENDPOINTS.SPORT.DETAIL(id));
      return response.data;
    },

    getCategories: async (): Promise<ApiResponse<any[]>> => {
      const response = await axiosInstance.get<ApiResponse<any[]>>(API_ENDPOINTS.SPORT.CATEGORIES);
      return response.data;
    },

    getEvents: async (): Promise<ApiResponse<any[]>> => {
      const response = await axiosInstance.get<ApiResponse<any[]>>(API_ENDPOINTS.SPORT.EVENTS);
      return response.data;
    },

    getEventDetail: async (id: string): Promise<ApiResponse<any>> => {
      const response = await axiosInstance.get<ApiResponse<any>>(API_ENDPOINTS.SPORT.EVENT_DETAIL(id));
      return response.data;
    },
  },

  // Match servisleri
  match: {
    getList: async (): Promise<ApiResponse<any[]>> => {
      const response = await axiosInstance.get<ApiResponse<any[]>>(API_ENDPOINTS.MATCH.LIST);
      return response.data;
    },

    getDetail: async (id: string): Promise<ApiResponse<any>> => {
      const response = await axiosInstance.get<ApiResponse<any>>(API_ENDPOINTS.MATCH.DETAIL(id));
      return response.data;
    },

    getLiveMatches: async (): Promise<ApiResponse<any[]>> => {
      const response = await axiosInstance.get<ApiResponse<any[]>>(API_ENDPOINTS.MATCH.LIVE);
      return response.data;
    },

    getUpcomingMatches: async (): Promise<ApiResponse<any[]>> => {
      const response = await axiosInstance.get<ApiResponse<any[]>>(API_ENDPOINTS.MATCH.UPCOMING);
      return response.data;
    },

    getPastMatches: async (): Promise<ApiResponse<any[]>> => {
      const response = await axiosInstance.get<ApiResponse<any[]>>(API_ENDPOINTS.MATCH.PAST);
      return response.data;
    },
  },

  // Tournament servisleri
  tournament: {
    getList: async (): Promise<ApiResponse<any[]>> => {
      const response = await axiosInstance.get<ApiResponse<any[]>>(API_ENDPOINTS.TOURNAMENT.LIST);
      return response.data;
    },

    getDetail: async (id: string): Promise<ApiResponse<any>> => {
      const response = await axiosInstance.get<ApiResponse<any>>(API_ENDPOINTS.TOURNAMENT.DETAIL(id));
      return response.data;
    },

    getStandings: async (id: string): Promise<ApiResponse<any[]>> => {
      const response = await axiosInstance.get<ApiResponse<any[]>>(
        API_ENDPOINTS.TOURNAMENT.STANDINGS(id)
      );
      return response.data;
    },

    getSchedule: async (id: string): Promise<ApiResponse<any[]>> => {
      const response = await axiosInstance.get<ApiResponse<any[]>>(
        API_ENDPOINTS.TOURNAMENT.SCHEDULE(id)
      );
      return response.data;
    },
  },

  // News servisleri
  news: {
    getList: async (): Promise<ApiResponse<any[]>> => {
      const response = await axiosInstance.get<ApiResponse<any[]>>(API_ENDPOINTS.NEWS.LIST);
      return response.data;
    },

    getDetail: async (id: string): Promise<ApiResponse<any>> => {
      const response = await axiosInstance.get<ApiResponse<any>>(API_ENDPOINTS.NEWS.DETAIL(id));
      return response.data;
    },

    getCategories: async (): Promise<ApiResponse<any[]>> => {
      const response = await axiosInstance.get<ApiResponse<any[]>>(API_ENDPOINTS.NEWS.CATEGORIES);
      return response.data;
    },
  },

  // Search servisleri
  search: {
    globalSearch: async (query: string): Promise<ApiResponse<any[]>> => {
      const response = await axiosInstance.get<ApiResponse<any[]>>(API_ENDPOINTS.SEARCH.GLOBAL, {
        params: { query },
      });
      return response.data;
    },

    getSuggestions: async (query: string): Promise<ApiResponse<any[]>> => {
      const response = await axiosInstance.get<ApiResponse<any[]>>(API_ENDPOINTS.SEARCH.SUGGESTIONS, {
        params: { query },
      });
      return response.data;
    },
  },
}; 