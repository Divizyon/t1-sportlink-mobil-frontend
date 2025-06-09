import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/src/config";

interface UnreadMessageCount {
  sender_id: string;
  count: number;
  sender_name?: string;
  sender_avatar?: string;
}

interface MessageState {
  unreadCount: number;
  unreadMessages: UnreadMessageCount[];
  setUnreadCount: (count: number) => void;
  fetchUnreadMessages: () => Promise<void>;
  markMessagesAsRead: (senderId: string) => Promise<void>;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  unreadCount: 0,
  unreadMessages: [],

  setUnreadCount: (count: number) => set({ unreadCount: count }),

  fetchUnreadMessages: async () => {
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) return;

      const response = await fetch(`${API_URL}/mobile/messages/unread`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();

        // Backend API'den dönen veriyi işle
        if (data.status === "success" && Array.isArray(data.data)) {
          const unreadMessages = data.data.map((item: any) => {
            // Sayısal değeri doğru şekilde çıkar
            const count =
              typeof item.count === "number"
                ? item.count
                : typeof item.count === "string"
                ? parseInt(item.count, 10)
                : 0;

            return {
              sender_id: item.sender_id,
              count: count || 0,
              sender_name: item.sender_name,
              sender_avatar: item.sender_avatar,
            };
          });

          // Toplam okunmamış mesaj sayısını hesapla
          const totalCount = unreadMessages.reduce(
            (total: number, item: UnreadMessageCount) => total + item.count,
            0
          );

          set({
            unreadCount: totalCount,
            unreadMessages,
          });

          console.log(`Okunmamış mesaj sayısı güncellendi: ${totalCount}`);
        } else {
          console.error("Okunmamış mesaj verisi yanlış formatta:", data);
          set({ unreadCount: 0, unreadMessages: [] });
        }
      } else {
        console.error("Okunmamış mesaj sayısı alınamadı:", response.status);
        // Error durumunda mevcut durumu koruyalım
      }
    } catch (error) {
      console.error("Okunmamış mesaj sayısı alınırken hata:", error);
      // Error durumunda mevcut durumu koruyalım
    }
  },

  markMessagesAsRead: async (senderId: string) => {
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) return;

      // Mevcut okunmamış mesajları al
      const { unreadMessages, unreadCount } = get();

      // Bu gönderene ait mesajları bul
      const messageFromSender = unreadMessages.find(
        (msg) => msg.sender_id === senderId
      );

      if (messageFromSender) {
        // Bu göndericiden okunmamış mesaj sayısını toplam sayıdan çıkar
        const newTotalCount = Math.max(
          0,
          unreadCount - messageFromSender.count
        );

        // Okunmamış mesajlar listesinden bu göndericiyi çıkar
        const newUnreadMessages = unreadMessages.filter(
          (msg) => msg.sender_id !== senderId
        );

        // Store'u güncelle
        set({
          unreadCount: newTotalCount,
          unreadMessages: newUnreadMessages,
        });

        console.log(
          `${senderId} kullanıcısından gelen mesajlar okundu olarak işaretlendi. Yeni toplam: ${newTotalCount}`
        );
      }

      // Store değerlerini güncellendikten sonra tüm listeyi yeniden çekmek için
      // Kısa bir gecikme ile fetchUnreadMessages fonksiyonunu çağır
      setTimeout(() => {
        get().fetchUnreadMessages();
      }, 1000);
    } catch (error) {
      console.error("Mesajlar okundu olarak işaretlenirken hata:", error);
      // Hata durumunda en güncel listeyi almak için yeniden sorgula
      await get().fetchUnreadMessages();
    }
  },
}));
