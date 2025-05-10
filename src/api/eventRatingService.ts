import apiClient from ".";

// Veri yapısı tanımları
interface EventRating {
  id: number;
  event_id: number;
  user_id: string;
  rating: number | null; // Backend null değer dönebiliyor
  review: string;
  created_at: string;
  updated_at?: string;
  // Backend iki farklı format kullanabilir, her ikisini de destekleyelim
  user?: {
    id?: number | string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
  };
  users?: {
    id?: number | string;
    full_name?: string;
    profile_picture?: string;
  };
}

// API yanıt formatları
interface SuccessResponse {
  success: boolean;
  data:
    | EventRating[]
    | EventRating
    | null
    | {
        average?: number;
        count?: number;
      };
}

interface StatusResponse {
  status: string;
  data: {
    ratings?: EventRating[];
    rating?: EventRating;
    average?: number;
  };
  message?: string;
}

type RatingResponse = SuccessResponse | StatusResponse;

// Yanıt tipini kontrol için yardımcı fonksiyonlar
const isSuccessResponse = (response: any): response is SuccessResponse => {
  return response && typeof response.success === "boolean";
};

const isStatusResponse = (response: any): response is StatusResponse => {
  return response && response.status === "success";
};

// EventRating nesnesinin geçerli olup olmadığını kontrol eden yardımcı fonksiyon
const isValidRating = (rating: any): rating is EventRating => {
  return rating && typeof rating === "object" && rating.id !== undefined;
};

// Rating değerini güvenli şekilde dönüştüren yardımcı fonksiyon
const safeRatingValue = (rating: number | null | undefined): number => {
  if (rating === null || rating === undefined) return 0;
  const numRating = Number(rating);
  return !isNaN(numRating) ? numRating : 0;
};

const eventRatingService = {
  /**
   * Bir etkinliğin tüm yorumlarını ve değerlendirmelerini getirir
   */
  async getEventRatings(eventId: string | number): Promise<EventRating[]> {
    try {
      console.log(`Etkinlik yorumları getiriliyor: ${eventId}`);
      const response = await apiClient.get<RatingResponse>(
        `/event-ratings/${eventId}/ratings`
      );

      // Yanıt inceleme için loglama
      console.log("Ratings yanıtı:", JSON.stringify(response.data));

      // Veri yapısını kontrol et ve doğru şekilde işle
      if (isSuccessResponse(response.data)) {
        // 1. Format: { success: true, data: [...] }
        if (Array.isArray(response.data.data)) {
          // Geçersiz elemanları filtrele
          const validRatings = response.data.data.filter(isValidRating);

          // Rating değerlerini normalize et
          const normalizedRatings = validRatings.map((rating) => ({
            ...rating,
            rating: safeRatingValue(rating.rating),
          }));

          console.log(`${normalizedRatings.length} adet geçerli yorum bulundu`);
          return normalizedRatings;
        }
        // Veri null olabilir (hiç yorum yoksa)
        if (response.data.data === null) {
          console.log("Hiç yorum bulunamadı (null)");
          return [];
        }
      } else if (isStatusResponse(response.data)) {
        // 2. Format: { status: "success", data: { ratings: [...] } }
        if (response.data.data && Array.isArray(response.data.data.ratings)) {
          const validRatings = response.data.data.ratings.filter(isValidRating);

          // Rating değerlerini normalize et
          const normalizedRatings = validRatings.map((rating) => ({
            ...rating,
            rating: safeRatingValue(rating.rating),
          }));

          console.log(`${normalizedRatings.length} adet geçerli yorum bulundu`);
          return normalizedRatings;
        }
      }

      console.log(
        "Hiç yorum bulunamadı veya veri yapısı beklendiği gibi değil"
      );
      return [];
    } catch (error) {
      console.error("Etkinlik yorumları alınırken hata oluştu:", error);
      return [];
    }
  },

  /**
   * Kullanıcının bir etkinliğe daha önce yaptığı yorumu getirir
   */
  async getMyRating(eventId: string | number): Promise<EventRating | null> {
    try {
      console.log(`Kullanıcının etkinlik yorumu getiriliyor: ${eventId}`);
      const response = await apiClient.get<RatingResponse>(
        `/event-ratings/${eventId}/my-rating`
      );

      console.log("My rating yanıtı:", JSON.stringify(response.data));

      if (isSuccessResponse(response.data)) {
        // Veri null olabilir (kullanıcının yorumu yoksa)
        if (response.data.data === null) {
          console.log("Kullanıcının yorumu bulunamadı (null)");
          return null;
        }

        // Veri doğrudan EventRating objesi olabilir
        if (response.data.data && !Array.isArray(response.data.data)) {
          if (isValidRating(response.data.data)) {
            // Rating değerini normalize et
            const normalizedRating = {
              ...response.data.data,
              rating: safeRatingValue(response.data.data.rating),
            } as EventRating;

            console.log("Kullanıcının yorumu bulundu:", normalizedRating);
            return normalizedRating;
          }
        }
      } else if (isStatusResponse(response.data)) {
        if (response.data.data && response.data.data.rating) {
          if (isValidRating(response.data.data.rating)) {
            // Rating değerini normalize et
            const normalizedRating = {
              ...response.data.data.rating,
              rating: safeRatingValue(response.data.data.rating.rating),
            } as EventRating;

            console.log("Kullanıcının yorumu bulundu:", normalizedRating);
            return normalizedRating;
          }
        }
      }

      console.log("Kullanıcının yorumu bulunamadı");
      return null;
    } catch (error) {
      console.error("Kullanıcının yorumu alınırken hata oluştu:", error);
      return null;
    }
  },

  /**
   * Yeni bir yorum ve değerlendirme ekler
   */
  async addRating(
    eventId: string | number,
    rating: number | null,
    comment: string
  ): Promise<EventRating | null> {
    try {
      console.log(`Etkinliğe yorum ekleniyor: ${eventId}, puan: ${rating}`);

      // Doğrulama kontrolü
      if (!eventId) throw new Error("Etkinlik ID'si gerekli");
      if (!comment || comment.trim() === "")
        throw new Error("Yorum boş olamaz");

      // Doğru formatta veri gönderiyoruz - 'comment' yerine 'review' parametresi
      const payload: any = {
        review: comment.trim(), // Trim edilmiş yorum 'review' olarak gönder
      };

      // Rating varsa ekle (COMPLETED etkinlikler için)
      if (rating !== null && rating !== undefined) {
        if (rating < 1 || rating > 5) {
          throw new Error("Puan 1-5 arası olmalıdır");
        }
        payload.rating = Number(rating);
      }

      const response = await apiClient.post<RatingResponse>(
        `/event-ratings/${eventId}/ratings`,
        payload
      );

      console.log("Add rating yanıtı:", JSON.stringify(response.data));

      if (isSuccessResponse(response.data)) {
        if (
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          if (isValidRating(response.data.data[0])) {
            // Rating değerini normalize et
            const normalizedRating = {
              ...response.data.data[0],
              rating: safeRatingValue(response.data.data[0].rating),
            } as EventRating;
            return normalizedRating;
          }
          return null;
        } else if (response.data.data && !Array.isArray(response.data.data)) {
          // Data doğrudan bir EventRating olabilir
          if (isValidRating(response.data.data)) {
            // Rating değerini normalize et
            const normalizedRating = {
              ...response.data.data,
              rating: safeRatingValue(response.data.data.rating),
            } as EventRating;
            return normalizedRating;
          }
        }
      } else if (isStatusResponse(response.data)) {
        if (response.data.data && response.data.data.rating) {
          if (isValidRating(response.data.data.rating)) {
            // Rating değerini normalize et
            const normalizedRating = {
              ...response.data.data.rating,
              rating: safeRatingValue(response.data.data.rating.rating),
            } as EventRating;
            return normalizedRating;
          }
          return null;
        }
      }

      return null;
    } catch (error: any) {
      console.error("Yorum eklenirken hata oluştu:", error);

      // Özel hata mesajlarını ele alıyoruz
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  },

  /**
   * Var olan bir yorumu günceller
   */
  async updateRating(
    ratingId: string | number,
    rating: number | null,
    comment: string
  ): Promise<EventRating | null> {
    try {
      console.log(`Yorum güncelleniyor: ${ratingId}, puan: ${rating}`);

      // Doğrulama kontrolü
      if (!ratingId) throw new Error("Yorum ID'si gerekli");
      if (!comment || comment.trim() === "")
        throw new Error("Yorum boş olamaz");

      // Doğru formatta veri gönderiyoruz - 'comment' yerine 'review' parametresi
      const payload: any = {
        review: comment.trim(), // Trim edilmiş yorum 'review' olarak gönder
      };

      // Rating varsa ekle (tamamlanmış etkinlikler için)
      if (rating !== null && rating !== undefined) {
        if (rating < 1 || rating > 5) {
          throw new Error("Puan 1-5 arası olmalıdır");
        }
        payload.rating = Number(rating);
      }

      const response = await apiClient.put<RatingResponse>(
        `/event-ratings/rating/${ratingId}`,
        payload
      );

      console.log("Update rating yanıtı:", JSON.stringify(response.data));

      if (isSuccessResponse(response.data)) {
        if (response.data.data && !Array.isArray(response.data.data)) {
          // Data doğrudan bir EventRating olabilir
          if (isValidRating(response.data.data)) {
            // Rating değerini normalize et
            const normalizedRating = {
              ...response.data.data,
              rating: safeRatingValue(response.data.data.rating),
            } as EventRating;
            return normalizedRating;
          }
        }
      } else if (isStatusResponse(response.data)) {
        if (response.data.data && response.data.data.rating) {
          if (isValidRating(response.data.data.rating)) {
            // Rating değerini normalize et
            const normalizedRating = {
              ...response.data.data.rating,
              rating: safeRatingValue(response.data.data.rating.rating),
            } as EventRating;
            return normalizedRating;
          }
          return null;
        }
      }

      return null;
    } catch (error: any) {
      console.error("Yorum güncellenirken hata oluştu:", error);

      // Özel hata mesajlarını ele alıyoruz
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  },

  /**
   * Bir yorumu siler
   */
  async deleteRating(ratingId: string | number): Promise<boolean> {
    try {
      console.log(`Yorum siliniyor: ${ratingId}`);

      if (!ratingId) throw new Error("Yorum ID'si gerekli");

      const response = await apiClient.delete<RatingResponse>(
        `/event-ratings/rating/${ratingId}`
      );

      if (isSuccessResponse(response.data)) {
        return response.data.success;
      } else if (isStatusResponse(response.data)) {
        return response.data.status === "success";
      }

      return false;
    } catch (error: any) {
      console.error("Yorum silinirken hata oluştu:", error);

      // Özel hata mesajlarını ele alıyoruz
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        throw new Error(error.response.data.message);
      }

      throw error;
    }
  },

  /**
   * Etkinliğin ortalama puanını getirir
   */
  async getAverageRating(eventId: string | number): Promise<number> {
    try {
      console.log(`Etkinlik ortalama puanı getiriliyor: ${eventId}`);

      // eventId parametresi için doğrulama kontrolü
      if (!eventId) {
        console.error("Geçersiz eventId parametresi:", eventId);
        return 0;
      }

      const response = await apiClient.get<RatingResponse>(
        `/event-ratings/${eventId}/average`
      );

      console.log("Average rating yanıtı:", JSON.stringify(response.data));

      // Yanıt yapısına göre doğru değeri çıkar
      if (isSuccessResponse(response.data)) {
        if (response.data.data && !Array.isArray(response.data.data)) {
          // { success: true, data: { average: X, count: Y } }
          const avgData = response.data.data as any;
          if (typeof avgData.average === "number") {
            return avgData.average;
          }
        }
      } else if (isStatusResponse(response.data)) {
        if (
          response.data.data &&
          typeof response.data.data.average === "number"
        ) {
          // { status: "success", data: { average: X } }
          return response.data.data.average;
        }
      }

      console.log("Ortalama puan bulunamadı, varsayılan değer döndürülüyor");
      return 0; // Değer bulunamazsa 0 döndür
    } catch (error) {
      console.error("Ortalama puan alınırken hata oluştu:", error);
      // Hata durumunda 0 döndür
      return 0;
    }
  },
};

export default eventRatingService;
