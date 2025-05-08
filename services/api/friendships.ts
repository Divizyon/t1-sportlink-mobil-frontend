import { apiClient } from './client';

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
    username: string;
  };
}

export interface Friend {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture: string;
  is_online: boolean;
  last_seen_at: string;
}

export const friendshipsApi = {
  // Arkadaşlık isteği gönder
  sendRequest: async (receiverId: string) => {
    const response = await apiClient.post('/mobile/friendships/requests', {
      receiver_id: receiverId
    });
    return response.data;
  },

  // Gelen arkadaşlık isteklerini getir
  getIncomingRequests: async () => {
    const response = await apiClient.get('/mobile/friendships/requests/incoming');
    return response.data.data as FriendRequest[];
  },

  // Gönderilen arkadaşlık isteklerini getir
  getOutgoingRequests: async () => {
    const response = await apiClient.get('/mobile/friendships/requests/outgoing');
    return response.data.data as FriendRequest[];
  },

  // Arkadaşlık isteğini kabul et
  acceptRequest: async (requestId: string) => {
    const response = await apiClient.put(`/mobile/friendships/requests/${requestId}/accept`);
    return response.data;
  },

  // Arkadaşlık isteğini reddet
  rejectRequest: async (requestId: string) => {
    const response = await apiClient.put(`/mobile/friendships/requests/${requestId}/reject`);
    return response.data;
  },

  // Arkadaşlık isteğini iptal et
  cancelRequest: async (requestId: string) => {
    const response = await apiClient.delete(`/mobile/friendships/requests/${requestId}`);
    return response.data;
  },

  // Arkadaş listesini getir
  getFriends: async () => {
    const response = await apiClient.get('/mobile/friendships');
    return response.data.data as Friend[];
  }
}; 