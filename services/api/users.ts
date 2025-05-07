import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  updated_at: string;
  profile_picture?: string;
  status: string;
  gender?: string;
  birthday_date?: string;
  address?: string;
  phone?: string;
  bio?: string;
}

export interface PaginatedResponse<T> {
  status: string;
  data: {
    users: T[];
    meta: {
      totalCount: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export const usersApi = {
  // USER rolündeki kullanıcıları getir
  getUsersByRole: async (page: number = 1, limit: number = 10) => {
    try {
      console.log('[Users API] Kullanıcılar getiriliyor...', { page, limit });
      const response = await apiClient.get<PaginatedResponse<User>>(`/users/role/user?page=${page}&limit=${limit}`);
      console.log('[Users API] Başarılı yanıt:', response.data);
      
      if (response.data.status === 'success') {
        return response.data;
      } else {
        console.error('[Users API] Başarısız yanıt:', response.data);
        throw new Error('Kullanıcılar getirilemedi');
      }
    } catch (error: any) {
      console.error('[Users API] Hata:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Hata durumunda boş veri döndür
      return {
        status: 'error',
        data: {
          users: [],
          meta: {
            totalCount: 0,
            page: page,
            limit: limit,
            totalPages: 0
          }
        }
      };
    }
  },

  // Kullanıcı ara
  searchUsers: async (query: string) => {
    try {
      console.log('[Users API] Kullanıcı arama yapılıyor...', { query });
      const response = await apiClient.get(`/users/search?q=${query}`);
      console.log('[Users API] Arama sonuçları:', response.data);
      return response.data.users as User[];
    } catch (error: any) {
      console.error('[Users API] Arama hatası:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return [];
    }
  },

  // Kullanıcı detaylarını getir
  getUserById: async (userId: string) => {
    try {
      console.log('[Users API] Kullanıcı detayları getiriliyor...', { userId });
      const response = await apiClient.get(`/users/${userId}`);
      console.log('[Users API] Kullanıcı detayları:', response.data);
      return response.data.user as User;
    } catch (error: any) {
      console.error('[Users API] Detay hatası:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return null;
    }
  }
}; 