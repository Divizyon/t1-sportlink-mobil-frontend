import { apiClient } from './client';

interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  content_type: string;
  is_read: boolean;
  created_at: string;
}

interface Peer {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
  is_online: boolean;
  last_seen_at: string;
}

interface Conversation {
  messages: Message[];
  peer: Peer;
}

export const messageApi = {
  // Bir kullanıcı ile olan konuşmayı getir
  getConversation: async (userId: string): Promise<Conversation> => {
    const response = await apiClient.get(`/mobile/messages/${userId}`);
    return response.data.data;
  },

  // Mesaj gönder
  sendMessage: async (userId: string, content: string, contentType: string = 'text'): Promise<Message> => {
    const response = await apiClient.post(`/mobile/messages/${userId}`, {
      content,
      content_type: contentType
    });
    return response.data.data;
  },

  // Mesajları okundu olarak işaretle
  markAsRead: async (userId: string): Promise<void> => {
    await apiClient.put(`/mobile/messages/${userId}/read`);
  }
}; 