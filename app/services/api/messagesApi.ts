import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../../../services/api/client';

export const messagesApi = {
  // Sohbet listesini getir
  getMessages: async () => {
    try {
      console.log('[API Debug] Mesajlar istek başlatılıyor:', { url: '/mobile/messages/chat-list' });
      return apiClient.get('/mobile/messages/chat-list');
    } catch (error) {
      console.error('Mesajlar alınırken hata:', error);
      throw error;
    }
  },

  // Belirli bir kullanıcı ile olan mesajları getir
  getChatMessages: async (userId: string) => {
    try {
      console.log('[API Debug] Mesajlar (chat) istek başlatılıyor:', { url: `/mobile/messages/${userId}` });
      return apiClient.get(`/mobile/messages/${userId}`);
    } catch (error) {
      console.error('Mesajlar alınırken hata:', error);
      throw error;
    }
  },

  // Mesaj gönder
  sendMessage: async (userId: string, content: string) => {
    try {
      console.log('[API Debug] Mesaj gönderiliyor:', { url: `/mobile/messages/${userId}` });
      return apiClient.post(`/mobile/messages/${userId}`, {
        content,
        content_type: 'text'
      });
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      throw error;
    }
  }
}; 