import { create } from "zustand";
import notificationsService from "../../services/api/notifications";

interface NotificationState {
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  // Metodlar
  fetchUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: () => void;
  resetUnreadCount: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,
  isLoading: false,
  error: null,

  // Okunmamış bildirim sayısını getir
  fetchUnreadCount: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await notificationsService.getUnreadCount();
      if (response && response.data) {
        // API yanıtına göre doğru değeri al
        let count = 0;
        if (typeof response.data === "number") {
          count = response.data;
        } else if (response.data.count !== undefined) {
          count = response.data.count;
        } else if (
          response.data.data !== undefined &&
          typeof response.data.data === "number"
        ) {
          count = response.data.data;
        } else if (response.data.unreadCount !== undefined) {
          count = response.data.unreadCount;
        }
        set({ unreadCount: count, isLoading: false });
      }
    } catch (error) {
      console.error("Okunmamış bildirim sayısı alınırken hata:", error);
      set({ error: "Bildirim sayısı alınamadı", isLoading: false });
    }
  },

  // Okunmamış bildirim sayısını manuel olarak ayarla
  setUnreadCount: (count: number) => {
    set({ unreadCount: count });
  },

  // Okunmamış bildirim sayısını bir azalt
  decrementUnreadCount: () => {
    const { unreadCount } = get();
    if (unreadCount > 0) {
      set({ unreadCount: unreadCount - 1 });
    }
  },

  // Okunmamış bildirim sayısını sıfırla
  resetUnreadCount: () => {
    set({ unreadCount: 0 });
  },
}));
