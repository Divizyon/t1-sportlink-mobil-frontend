import { apiClient } from "./client";
import { showToast } from "../../src/utils/toastHelper";
import NetInfo from "@react-native-community/netinfo";

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

// API isteği için ağ bağlantısını kontrol et
const checkNetwork = async () => {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected && netInfo.isInternetReachable;
};

// Ağ bağlantısı kontrol edilerek API isteği atma yardımcı fonksiyonu
const safeApiCall = async (apiFunc: Function, fallback: any = null) => {
  try {
    const isConnected = await checkNetwork();
    if (!isConnected) {
      console.log("Ağ bağlantısı yok, istek yapılamıyor");
      showToast("İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.", "error");
      return { status: "error", data: fallback, message: "İnternet bağlantısı yok" };
    }
    
    return await apiFunc();
  } catch (error: any) {
    console.log("API çağrısı sırasında hata:", error.message);
    return { 
      status: "error", 
      data: fallback, 
      message: error.message || "API isteği sırasında bir hata oluştu" 
    };
  }
};

export const friendshipsApi = {
  // Arkadaşlık isteği gönder
  sendRequest: async (receiverId: string) => {
    return safeApiCall(async () => {
      const response = await apiClient.post("/mobile/friendships/requests", {
        receiver_id: receiverId,
      });
      return response.data;
    });
  },

  // Gelen arkadaşlık isteklerini getir
  getIncomingRequests: async () => {
    return safeApiCall(async () => {
      const response = await apiClient.get(
        "/mobile/friendships/requests/incoming"
      );
      return response.data.data as FriendRequest[];
    }, []);
  },

  // Gönderilen arkadaşlık isteklerini getir
  getOutgoingRequests: async () => {
    return safeApiCall(async () => {
      const response = await apiClient.get(
        "/mobile/friendships/requests/outgoing"
      );
      return response.data.data as FriendRequest[];
    }, []);
  },

  // Arkadaşlık isteğini kabul et
  acceptRequest: async (requestId: string) => {
    return safeApiCall(async () => {
      const response = await apiClient.put(
        `/mobile/friendships/requests/${requestId}/accept`
      );
      return response.data;
    });
  },

  // Arkadaşlık isteğini reddet
  rejectRequest: async (requestId: string) => {
    return safeApiCall(async () => {
      const response = await apiClient.put(
        `/mobile/friendships/requests/${requestId}/reject`
      );
      return response.data;
    });
  },

  // Arkadaşlık isteğini iptal et
  cancelRequest: async (requestId: string) => {
    return safeApiCall(async () => {
      const response = await apiClient.delete(
        `/mobile/friendships/requests/${requestId}`
      );
      return response.data;
    });
  },

  // Arkadaş listesini getir
  getFriends: async () => {
    return safeApiCall(async () => {
      console.log("Arkadaş listesi getiriliyor...");
      try {
        const response = await apiClient.get("/mobile/friendships");
        console.log("Ham API yanıtı:", JSON.stringify(response, null, 2));
        console.log("Arkadaş listesi alındı, status:", response.status);
        console.log("Arkadaş listesi data:", JSON.stringify(response.data, null, 2));
        console.log("Arkadaş listesi data.data:", JSON.stringify(response.data.data, null, 2));
        
        if (response.data && response.data.data) {
          const friends = response.data.data;
          console.log(`${friends.length} arkadaş bulundu`);
          return friends as Friend[];
        } else {
          console.log("Arkadaş listesi boş veya tanımsız");
          return [];
        }
      } catch (error) {
        console.error("Arkadaş listesi getirme hatası:", error);
        throw error;
      }
    }, []);
  },
};

/**
 * Gelen arkadaşlık isteklerini getirir
 */
export const getIncomingFriendshipRequests = async () => {
  try {
    const isConnected = await checkNetwork();
    if (!isConnected) {
      showToast("İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.", "error");
      return {
        status: "error",
        data: [],
        message: "İnternet bağlantısı yok"
      };
    }

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
    const isConnected = await checkNetwork();
    if (!isConnected) {
      showToast("İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.", "error");
      return {
        status: "error",
        message: "İnternet bağlantısı yok"
      };
    }

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
    const isConnected = await checkNetwork();
    if (!isConnected) {
      showToast("İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.", "error");
      return {
        status: "error",
        message: "İnternet bağlantısı yok"
      };
    }

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
