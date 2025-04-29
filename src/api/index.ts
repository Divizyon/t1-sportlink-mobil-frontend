import { SignInCredentials, SignUpCredentials, User } from '../types';

// API temel URL'ini burada tanımlayın
const API_URL = 'http://localhost:3000/api'; // API URL'inizi buraya ekleyin

// API istekleri için yardımcı fonksiyon
const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Bir hata oluştu');
  }

  return data;
};

// Auth API fonksiyonları
export const authApi = {
  // Giriş yapma
  signIn: async (credentials: SignInCredentials) => {
    const data = await fetchApi('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return data;
    
    // Geçici mock data
    return {
      user: {
        id: '1',
        username: 'testuser',
        email: credentials.email,
        profilePicture: 'https://example.com/profile.jpg',
      },
      token: 'mock-token-123456',
    };
  },

  // Kayıt olma
  signUp: async (credentials: SignUpCredentials) => {
    // TODO: Burayı API isteğiyle güncelleyiniz
    /* Örnek implementasyon:
    const data = await fetchApi('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return data;
    */
    
    // Geçici mock data
    return {
      user: {
        id: '1',
        username: credentials.username,
        email: credentials.email,
        profilePicture: undefined,
      },
      token: 'mock-token-123456',
    };
  },

  // Kullanıcı bilgilerini getirme
  getCurrentUser: async (token: string) => {
    // TODO: Burayı API isteğiyle güncelleyiniz
    /* Örnek implementasyon:
    const data = await fetchApi('/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data.user;
    */
    
    // Geçici mock data
    return {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      profilePicture: 'https://example.com/profile.jpg',
    };
  },
};
