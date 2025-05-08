import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const messagesApi = {
  // Tüm mesajları getir
  getMessages: async () => {
    const token = await AsyncStorage.getItem('token');
    console.log('[API Debug] Mesajlar istek başlatılıyor:', { url: '/mobile/messages', token });
    return axios.get(`${BASE_URL}/mobile/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Belirli bir kullanıcı ile olan mesajları getir
  getChatMessages: async (userId: string) => {
    const token = await AsyncStorage.getItem('token');
    console.log('[API Debug] Mesajlar (chat) istek başlatılıyor:', { url: `/mobile/messages/${userId}`, token });
    return axios.get(`${BASE_URL}/mobile/messages/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Mesaj gönder
  sendMessage: async (userId: string, message: string) => {
    const token = await AsyncStorage.getItem('token');
    console.log('[API Debug] Mesaj gönderiliyor:', { url: '/mobile/messages', token });
    return axios.post(`${BASE_URL}/mobile/messages`, {
      receiverId: userId,
      message
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}; 