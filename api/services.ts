import axiosInstance from './axiosConfig';

// API response tipleri
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Örnek response tipleri
interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

// Auth servisleri
export const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.post<ApiResponse<User>>('/auth/register', userData);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },
};

// Kullanıcı servisleri
export const userService = {
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.get<ApiResponse<User>>('/user/profile');
    return response.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await axiosInstance.put<ApiResponse<User>>('/user/profile', userData);
    return response.data;
  },
};

// Diğer API servisleri buraya eklenebilir
export const apiService = {
  auth: authService,
  user: userService,
}; 