import { apiClient } from "./client";

// Yeni bildirim yapısı - API'nin döndüğü formata göre güncellendi
export interface NotificationResponse {
  id: number;
  user_id: string;
  content: string;
  notification_type: string;
  read_status: boolean;
  created_at: string;
  event_id?: number;
  link?: string;
}

// API yanıt yapısı
export interface ApiNotificationResponse {
  status: string;
  count: number;
  data: NotificationResponse[];
}

// Log fonksiyonu ekleyelim
const logApiCall = (endpoint: string, result: any, error?: any) => {
  if (error) {
    console.log(`[Notifications API] Error calling ${endpoint}:`, error);
  } else {
    console.log(`[Notifications API] Success calling ${endpoint}:`, result);
  }
};

/**
 * Bildirimler ile ilgili API isteklerini yöneten servis
 */
const notificationsService = {
  /**
   * Tüm bildirimleri getirir
   * @returns API yanıtı
   */
  getNotifications: async () => {
    // API isteği için deneme sayısı
    const MAX_RETRY = 2;
    let lastError: any = null;

    const endpoints = ["/notifications", "/mobile/notifications"];

    // Her bir endpoint'i sırayla deneyelim
    for (const endpoint of endpoints) {
      // Her endpoint için belirlenen retry sayısı kadar deneyelim
      for (let retryCount = 0; retryCount < MAX_RETRY; retryCount++) {
        try {
          const response = await apiClient.get(endpoint);
          logApiCall(endpoint, response);

          // Yanıtın geçerli olup olmadığını kontrol et
          if (response && response.data) {
            return response;
          } else {
            throw new Error("Geçersiz API yanıtı: Boş yanıt");
          }
        } catch (error) {
          lastError = error;
          console.log(
            `${endpoint} endpoint'i için ${retryCount + 1}. deneme başarısız:`,
            error
          );

          // Son deneme değilse, biraz bekleyip tekrar dene
          if (retryCount < MAX_RETRY - 1) {
            // Üstel bekleme (exponential backoff) - her denemede bekleme süresini artır
            const waitTime = 1000 * Math.pow(2, retryCount);
            console.log(`${waitTime}ms bekledikten sonra tekrar deneniyor...`);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          }
        }
      }
    }

    // Tüm denemeler başarısız olduysa son hatayı fırlat
    console.error("Tüm bildirim API istekleri başarısız oldu:", lastError);
    throw (
      lastError || new Error("Bildirimler alınamadı: Tüm denemeler başarısız")
    );
  },

  /**
   * Okunmamış bildirim sayısını getirir
   * @returns API yanıtı
   */
  getUnreadCount: async () => {
    try {
      const response = await apiClient.get("/notifications/unread-count");
      logApiCall("/notifications/unread-count", response);
      return response;
    } catch (error) {
      logApiCall("/notifications/unread-count", null, error);
      throw error;
    }
  },

  /**
   * Belirli bir bildirimi okundu olarak işaretler
   * @param notificationId Bildirim ID'si
   * @returns API yanıtı
   */
  markAsRead: async (notificationId: number) => {
    try {
      const response = await apiClient.put(
        `/notifications/${notificationId}/read`
      );
      logApiCall(`/notifications/${notificationId}/read`, response);
      return response;
    } catch (error) {
      logApiCall(`/notifications/${notificationId}/read`, null, error);
      throw error;
    }
  },

  /**
   * Tüm bildirimleri okundu olarak işaretler
   * @returns API yanıtı
   */
  markAllAsRead: async () => {
    try {
      const response = await apiClient.put("/notifications/mark-all-read");
      logApiCall("/notifications/mark-all-read", response);
      return response;
    } catch (error) {
      logApiCall("/notifications/mark-all-read", null, error);
      throw error;
    }
  },

  /**
   * Belirli bir bildirimi siler
   * @param notificationId Bildirim ID'si
   * @returns API yanıtı
   */
  deleteNotification: async (notificationId: number) => {
    try {
      const response = await apiClient.delete(
        `/notifications/${notificationId}`
      );
      logApiCall(`/notifications/${notificationId}`, response);
      return response;
    } catch (error) {
      logApiCall(`/notifications/${notificationId}`, null, error);
      throw error;
    }
  },
};

export default notificationsService;
