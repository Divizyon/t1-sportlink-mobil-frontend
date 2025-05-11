import { apiClient } from "./client";

// API'nin döndüğü yeni bildirim yapısı
export interface MobileNotification {
  id: number;
  title: string;
  body: string;
  notification_type: string;
  read_status: boolean;
  send_status: string;
  created_at: string;
  sent_at: string;
  data: any;
  user_id: string;
  device_token: string;
  platform: string;
}

// Eski bildirim yapısı (uyumluluk için korunuyor)
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
  success: boolean;
  count: number;
  data: MobileNotification[];
}

// Log fonksiyonu
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
    try {
      // Yeni bildirim API endpoint'ini kullan
      const response = await apiClient.get("/mobile/notifications");
      logApiCall("/mobile/notifications", response);

      return response;
    } catch (error) {
      logApiCall("/mobile/notifications", null, error);
      throw error;
    }
  },

  /**
   * Okunmamış bildirim sayısını getirir
   * @returns API yanıtı
   */
  getUnreadCount: async () => {
    try {
      // Yeni endpoint yapısını kullan
      const response = await apiClient.get(
        "/mobile/notifications/unread-count"
      );
      logApiCall("/mobile/notifications/unread-count", response);
      return response;
    } catch (error) {
      logApiCall("/mobile/notifications/unread-count", null, error);
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
      // Yeni endpoint yapısını kullan
      const response = await apiClient.patch(
        `/mobile/notifications/${notificationId}/read`
      );
      logApiCall(`/mobile/notifications/${notificationId}/read`, response);
      return response;
    } catch (error) {
      logApiCall(`/mobile/notifications/${notificationId}/read`, null, error);
      throw error;
    }
  },

  /**
   * Tüm bildirimleri okundu olarak işaretler
   * @returns API yanıtı
   */
  markAllAsRead: async () => {
    try {
      // Yeni endpoint yapısını kullan
      const response = await apiClient.patch(
        "/mobile/notifications/mark-all-read"
      );
      logApiCall("/mobile/notifications/mark-all-read", response);
      return response;
    } catch (error) {
      logApiCall("/mobile/notifications/mark-all-read", null, error);
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
        `/mobile/notifications/${notificationId}`
      );
      logApiCall(`/mobile/notifications/${notificationId}`, response);
      return response;
    } catch (error) {
      logApiCall(`/mobile/notifications/${notificationId}`, null, error);
      throw error;
    }
  },
};

export default notificationsService;
