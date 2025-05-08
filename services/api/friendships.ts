import { apiClient } from "./client";
import { showToast } from "../../utils/toastHelper";

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
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
    const response = await apiClient.post("/mobile/friendships/requests", {
      receiver_id: receiverId,
    });
    return response.data;
  },

  // Gelen arkadaşlık isteklerini getir
  getIncomingRequests: async () => {
    const response = await apiClient.get(
      "/mobile/friendships/requests/incoming"
    );
    return response.data.data as FriendRequest[];
  },

  // Gönderilen arkadaşlık isteklerini getir
  getOutgoingRequests: async () => {
    const response = await apiClient.get(
      "/mobile/friendships/requests/outgoing"
    );
    return response.data.data as FriendRequest[];
  },

  // Arkadaşlık isteğini kabul et
  acceptRequest: async (requestId: string) => {
    const response = await apiClient.put(
      `/mobile/friendships/requests/${requestId}/accept`
    );
    return response.data;
  },

  // Arkadaşlık isteğini reddet
  rejectRequest: async (requestId: string) => {
    const response = await apiClient.put(
      `/mobile/friendships/requests/${requestId}/reject`
    );
    return response.data;
  },

  // Arkadaşlık isteğini iptal et
  cancelRequest: async (requestId: string) => {
    const response = await apiClient.delete(
      `/mobile/friendships/requests/${requestId}`
    );
    return response.data;
  },

  // Arkadaş listesini getir
  getFriends: async () => {
    const response = await apiClient.get("/mobile/friendships");
    return response.data.data as Friend[];
  },
};

/**
 * Gelen arkadaşlık isteklerini getirir
 */
export const getIncomingFriendshipRequests = async () => {
  try {
    const response = await apiClient.get(
      "/mobile/friendships/requests/incoming"
    );
    return {
      status: "success",
      data: response.data.data || [],
    };
  } catch (error: any) {
    console.log(
      "[Friendships API] Gelen arkadaşlık istekleri alınamadı:",
      error.message
    );
    return {
      status: "error",
      message: error.message,
      response: error.response,
      statusCode: error.status,
    };
  }
};

/**
 * Gelen arkadaşlık isteğini kabul eder
 * @param requestId Arkadaşlık isteği ID'si
 */
export const acceptFriendshipRequest = async (requestId: string) => {
  try {
    // PUT metodunu kullan ve status olarak accepted gönder
    const response = await apiClient.put(
      `/mobile/friendships/requests/${requestId}`,
      {
        status: "accepted",
      }
    );

    // Başarılı olduğunda bildirim göster
    showToast("Arkadaşlık isteği kabul edildi", "success");

    return {
      status: "success",
      data: response.data.data,
    };
  } catch (error: any) {
    console.log(
      "[Friendships API] Arkadaşlık isteği kabul edilemedi:",
      error.message
    );

    // Hata durumunda bildirim göster
    showToast(`İstek kabul edilemedi: ${error.message}`, "error");

    return {
      status: "error",
      message: error.message,
      response: error.response,
      statusCode: error.status,
    };
  }
};

/**
 * Gelen arkadaşlık isteğini reddeder
 * @param requestId Arkadaşlık isteği ID'si
 */
export const rejectFriendshipRequest = async (requestId: string) => {
  try {
    // PUT metodunu kullan ve status olarak rejected gönder
    const response = await apiClient.put(
      `/mobile/friendships/requests/${requestId}`,
      {
        status: "rejected",
      }
    );

    // Başarılı olduğunda bildirim göster
    showToast("Arkadaşlık isteği reddedildi", "info");

    return {
      status: "success",
      data: response.data.data,
    };
  } catch (error: any) {
    console.log(
      "[Friendships API] Arkadaşlık isteği reddedilemedi:",
      error.message
    );

    // Hata durumunda bildirim göster
    showToast(`İstek reddedilemedi: ${error.message}`, "error");

    return {
      status: "error",
      message: error.message,
      response: error.response,
      statusCode: error.status,
    };
  }
};
