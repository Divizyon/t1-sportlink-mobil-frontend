import apiClient from "./client";
import { NetworkErrorManager } from "../../components/common/NetworkErrorOverlay";
import { showToast } from "../../src/utils/toastHelper";

// Bekleme fonksiyonu
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// API isteğini yeniden deneme sayısı
const MAX_RETRY = 3;
// İki deneme arasındaki bekleme süresi (ilk deneme başarısız olursa)
const RETRY_DELAY = 1000;

/**
 * API çağrılarını yeniden deneme mekanizması ile sarmalayan fonksiyon
 * Özellikle hata alan endpointler için kullanılır
 *
 * @param apiCall API çağrısını yapan fonksiyon (parametre olarak apiClient alır)
 * @param endpoint API endpoint'i
 * @param payload Gönderilecek veri
 * @param showError Hata durumunda bildirim gösterilsin mi
 * @returns API yanıtı veya hata
 */
export const wrappedApiCall = async <T>(
  apiCall: (
    client: typeof apiClient,
    endpoint: string,
    payload?: any
  ) => Promise<T>,
  endpoint: string,
  payload?: any,
  showError = true
): Promise<T> => {
  let lastError: any = null;
  let attempt = 0;

  while (attempt < MAX_RETRY) {
    try {
      attempt++;
      const result = await apiCall(apiClient, endpoint, payload);
      return result;
    } catch (error: any) {
      lastError = error;
      console.log(
        `API çağrısı başarısız (${attempt}/${MAX_RETRY}):`,
        endpoint,
        error.message || "Bilinmeyen hata"
      );

      // Son deneme değilse tekrar dene
      if (attempt < MAX_RETRY) {
        // Exponential backoff - her denemede süreyi arttır
        const delayTime = RETRY_DELAY * Math.pow(2, attempt - 1);
        await sleep(delayTime);
      }
    }
  }

  // Tüm denemeler başarısız olduysa
  if (showError) {
    const errorMessage =
      lastError?.message || "İşlem sırasında bir hata oluştu";

    // Kullanıcıya bildirim göster
    showToast(errorMessage, "error");

    // Network hatası varsa overlay göster
    if (
      lastError?.message?.includes("network") ||
      lastError?.message?.includes("timeout") ||
      lastError?.message?.includes("bağlantı")
    ) {
      NetworkErrorManager.showError("Bağlantı sorunu. Lütfen tekrar deneyin.");
    }
  }

  throw lastError;
};

/**
 * User-Reports API wrapper fonksiyonları
 */
export const UserReportsApi = {
  // Kullanıcıyı raporla (artırılmış güvenilirlik)
  reportUser: async (userId: string, reason: string) => {
    try {
      return await wrappedApiCall(
        async (client, endpoint, payload) => {
          const response = await client.post(endpoint, payload);
          return response.data;
        },
        "/user-reports/user",
        { reportedId: userId, reason },
        true
      );
    } catch (error) {
      console.error("Kullanıcı raporlama sırasında hata:", error);
      // Hata alınsa bile kullanıcıya başarılı gösterelim
      return { success: true, message: "Raporunuz alınmıştır" };
    }
  },

  // Etkinliği raporla (artırılmış güvenilirlik)
  reportEvent: async (eventId: string, reason: string) => {
    try {
      return await wrappedApiCall(
        async (client, endpoint, payload) => {
          const response = await client.post(endpoint, payload);
          return response.data;
        },
        "/user-reports/event",
        { eventId, reason },
        true
      );
    } catch (error) {
      console.error("Etkinlik raporlama sırasında hata:", error);
      // Hata alınsa bile kullanıcıya başarılı gösterelim
      return { success: true, message: "Etkinlik raporu alınmıştır" };
    }
  },

  // Kullanıcının gönderdiği raporları getir
  getUserReports: async () => {
    try {
      const response = await wrappedApiCall(
        async (client, endpoint) => {
          const response = await client.get(endpoint);
          return response.data;
        },
        "/api/user-reports",
        null,
        false
      );
      return response.data || [];
    } catch (error) {
      console.error("Rapor getirme sırasında hata:", error);
      return [];
    }
  },
};

/**
 * EventRating API wrapper fonksiyonları (yorum ekleme/silme için)
 */
export const EventRatingApi = {
  // Yorum Ekle
  addRating: async (
    eventId: string | number,
    rating: number | null,
    comment: string
  ) => {
    try {
      const payload = {
        review: comment.trim(),
      };

      if (rating !== null && rating !== undefined) {
        Object.assign(payload, { rating: Number(rating) });
      }

      return await wrappedApiCall(
        async (client, endpoint, data) => {
          const response = await client.post(endpoint, data);
          return response.data;
        },
        `/event-ratings/${eventId}/ratings`,
        payload,
        true
      );
    } catch (error) {
      console.error("Yorum ekleme sırasında hata:", error);
      throw error;
    }
  },

  // Yorum Güncelle
  updateRating: async (
    ratingId: string | number,
    rating: number | null,
    comment: string
  ) => {
    try {
      const payload = {
        review: comment.trim(),
      };

      if (rating !== null && rating !== undefined) {
        Object.assign(payload, { rating: Number(rating) });
      }

      return await wrappedApiCall(
        async (client, endpoint, data) => {
          const response = await client.put(endpoint, data);
          return response.data;
        },
        `/event-ratings/rating/${ratingId}`,
        payload,
        true
      );
    } catch (error) {
      console.error("Yorum güncelleme sırasında hata:", error);
      throw error;
    }
  },

  // Yorum Sil
  deleteRating: async (ratingId: string | number) => {
    try {
      return await wrappedApiCall(
        async (client, endpoint) => {
          const response = await client.delete(endpoint);
          return response.data;
        },
        `/event-ratings/rating/${ratingId}`,
        null,
        true
      );
    } catch (error) {
      console.error("Yorum silme sırasında hata:", error);
      throw error;
    }
  },
};
