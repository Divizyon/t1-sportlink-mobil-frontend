import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken } from '@/services/authService';
import { apiClient } from '@/services/api/client';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await apiClient.get('/mobile/auth/me');
        setUser(response.data.data);
      } catch (err) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', err);
        setError('Kullanıcı bilgileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}; 