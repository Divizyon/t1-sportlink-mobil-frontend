import { apiClient } from "./client";

export interface NotificationData {
  type: string;
  eventId?: string;
  deepLink?: string;
  eventTitle?: string;
  participantId?: string;
  participantName?: string;
  participantProfilePicture?: string;
}

export interface NotificationResponse {
  id: number;
  user_id: string;
  title: string;
  body: string;
  data: NotificationData;
  read_status: boolean;
  send_status: string;
  notification_type: string;
  created_at: string;
  sent_at: string;
  device_token?: string;
  platform?: string;
}

/**
 * Bildirimler ile ilgili API isteklerini yöneten servis
 */
const notificationsService = {
  /**
   * Tüm bildirimleri getirir
   * @returns API yanıtı
   */
  getNotifications: async () => {
    return await apiClient.get("/mobile/notifications");
  },

  /**
   * Belirli bir bildirimi okundu olarak işaretler
   * @param notificationId Bildirim ID'si
   * @returns API yanıtı
   */
  markAsRead: async (notificationId: number) => {
    return await apiClient.put(`/mobile/notifications/${notificationId}/read`);
  },

  /**
   * Tüm bildirimleri okundu olarak işaretler
   * @returns API yanıtı
   */
  markAllAsRead: async () => {
    return await apiClient.put("/mobile/notifications/mark-all-read");
  },
};

export default notificationsService;
