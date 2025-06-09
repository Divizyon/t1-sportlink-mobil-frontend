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
    return await apiFunc();
  } catch (error: any) {
    console.log("API çağrısı sırasında hata:", error.message);

    // API'den dönen hata bilgilerini kontrol et ve uygun şekilde yansıt
    if (error.status_code && error.message) {
      // Eğer API hata formatında bir nesne dönmüşse
      return {
        status: "error",
        data: fallback,
        message: error.message,
        status_code: error.status_code,
      };
    }

    // Backend'den gelen hata bilgisi kontrol et (400, 404, 409 vb.)
    if (error.response?.data) {
      return {
        status: "error",
        data: fallback,
        message: error.response.data.message || "Bir hata oluştu",
        status_code: error.response.status,
      };
    }

    return {
      status: "error",
      data: fallback,
      message: error.message || "API isteği sırasında bir hata oluştu",
    };
  }
};

export const friendshipsApi = {
  // Arkadaşlık isteği gönder
  sendRequest: async (receiverId: string) => {
    try {
      console.log(
        `[API] Arkadaşlık isteği gönderiliyor: receiverId=${receiverId}`
      );

      // Güvenlik kontrolü: receiverId geçerli mi?
      if (!receiverId || typeof receiverId !== "string") {
        console.error(`[API] Geçersiz receiver_id: ${receiverId}`);
        return {
          status: "error",
          message: "Geçersiz kullanıcı ID'si",
          data: null,
        };
      }

      // API isteği gönder
      const response = await apiClient.post("/mobile/friendships/requests", {
        receiver_id: receiverId,
      });

      console.log(`[API] Başarılı yanıt:`, response.data);

      // Başarılı yanıt
      return {
        status: "success",
        message: "Arkadaşlık isteği başarıyla gönderildi",
        data: response.data,
      };
    } catch (error: any) {
      console.error(`[API] İstek gönderme hatası:`, error);

      // Spesifik hata durumlarını kontrol et
      if (error.response?.status === 409) {
        // Zaten mevcut istek varsa (çakışma)
        return {
          status: "error",
          message:
            error.response.data?.message ||
            "Bu kullanıcıya zaten istek gönderilmiş veya zaten arkadaşsınız",
          code: 409,
          data: null,
        };
      } else if (error.response?.status === 400) {
        // Kendine istek veya geçersiz formatta istek
        return {
          status: "error",
          message:
            error.response.data?.message ||
            "Geçersiz istek. Kendinize arkadaşlık isteği gönderemezsiniz.",
          code: 400,
          data: null,
        };
      } else if (error.response?.status === 404) {
        // Kullanıcı bulunamadı
        return {
          status: "error",
          message: "Kullanıcı bulunamadı",
          code: 404,
          data: null,
        };
      }

      // Diğer hatalar
      return {
        status: "error",
        message:
          error.response?.data?.message ||
          error.message ||
          "Arkadaşlık isteği gönderilemedi",
        code: error.response?.status || 500,
        data: null,
      };
    }
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
      console.log("[API] Giden arkadaşlık istekleri alınıyor...");
      const response = await apiClient.get(
        "/mobile/friendships/requests/outgoing"
      );
      console.log(
        "[API] Giden istekler yanıtı:",
        JSON.stringify(response.data, null, 2)
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
    try {
      console.log(`[API] Arkadaşlık isteği iptal ediliyor: ID=${requestId}`);

      // requestId'nin sayı olduğundan emin olalım
      const numericRequestId = Number(requestId);
      if (isNaN(numericRequestId)) {
        console.error(`[API] Geçersiz requestId formatı: ${requestId}`);
        return {
          status: "error",
          message: "Geçersiz istek ID formatı",
          data: null,
          code: 400,
        };
      }

      // Backend'in DELETE metodunu kullanarak istek iptali
      const response = await apiClient.delete(
        `/mobile/friendships/requests/${numericRequestId}`
      );

      console.log(`[API] İptal yanıtı:`, response.data);

      // Başarılı yanıt
      return {
        status: "success",
        message: "İstek başarıyla iptal edildi",
        data: response.data,
      };
    } catch (error: any) {
      // Detaylı hata bilgisi için log kaydı
      console.error(`[API] İstek iptal hatası:`, error);

      // 404 hatası - istek bulunamadı veya zaten silinmiş
      if (error.response?.status === 404) {
        console.log(
          `[API] İstek bulunamadı (ID: ${requestId}). Muhtemelen zaten silinmiş.`
        );
        return {
          status: "success", // 404 durumunu da başarılı olarak kabul ediyoruz
          message: "İstek zaten silinmiş veya bulunamadı",
          data: null,
          code: 404,
        };
      }

      // 403 hatası - yetkisiz işlem
      if (error.response?.status === 403) {
        return {
          status: "error",
          message: "Bu arkadaşlık isteğini iptal etme yetkiniz yok",
          data: null,
          code: 403,
        };
      }

      // 400 hatası - geçersiz durum değeri
      if (error.response?.status === 400) {
        return {
          status: "error",
          message: error.response.data?.message || "Geçersiz iptal isteği",
          data: null,
          code: 400,
        };
      }

      // Diğer tüm hatalar
      return {
        status: "error",
        message:
          error.response?.data?.message ||
          error.message ||
          "İstek iptal edilirken bir hata oluştu",
        data: null,
        code: error.response?.status || 500,
      };
    }
  },

  // Arkadaş listesini getir
  getFriends: async () => {
    return safeApiCall(async () => {
      console.log("Arkadaş listesi getiriliyor...");
      try {
        const response = await apiClient.get("/mobile/friendships");
        console.log("Ham API yanıtı:", JSON.stringify(response, null, 2));
        console.log("Arkadaş listesi alındı, status:", response.status);
        console.log(
          "Arkadaş listesi data:",
          JSON.stringify(response.data, null, 2)
        );
        console.log(
          "Arkadaş listesi data.data:",
          JSON.stringify(response.data.data, null, 2)
        );

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

  // Çevrimiçi durumunu güncelle
  updateOnlineStatus: async (isOnline: boolean) => {
    return safeApiCall(async () => {
      console.log(`Çevrimiçi durumu güncelleniyor: ${isOnline}`);

      try {
        const response = await apiClient.put("/mobile/friendships/status", {
          is_online: isOnline,
        });

        console.log("Çevrimiçi durum güncelleme yanıtı:", response.data);
        return response.data;
      } catch (error) {
        console.error("Çevrimiçi durum güncelleme hatası:", error);
        throw error;
      }
    });
  },

  // Arkadaşı sil
  deleteFriend: async (friendId: string) => {
    try {
      console.log(`[API] Arkadaş siliniyor: ID=${friendId}`);

      if (!friendId) {
        return {
          status: "error",
          message: "Arkadaş ID'si geçersiz",
          data: null,
        };
      }

      const response = await apiClient.delete(
        `/mobile/friendships/${friendId}`
      );

      console.log(`[API] Arkadaş silme yanıtı:`, response.data);

      showToast("Arkadaş başarıyla silindi", "success");

      return {
        status: "success",
        message: "Arkadaş başarıyla silindi",
        data: response.data,
      };
    } catch (error: any) {
      console.error(`[API] Arkadaş silme hatası:`, error);

      showToast("Arkadaş silinemedi", "error");

      if (error.response?.status === 404) {
        return {
          status: "error",
          message: "Arkadaş bulunamadı",
          data: null,
        };
      }

      return {
        status: "error",
        message:
          error.response?.data?.message ||
          error.message ||
          "Arkadaş silinemedi",
        data: null,
      };
    }
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

/**
 * Giden arkadaşlık isteklerini getirir
 */
export const getOutgoingFriendshipRequests = async () => {
  try {
    const response = await apiClient.get(
      "/mobile/friendships/requests/outgoing"
    );
    return {
      status: "success",
      data: response.data.data || [],
    };
  } catch (error: any) {
    console.log(
      "[Friendships API] Giden arkadaşlık istekleri alınamadı:",
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
