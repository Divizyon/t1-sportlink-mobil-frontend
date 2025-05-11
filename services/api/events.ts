import { apiClient } from "./client";
import { showToast } from "../../src/utils/toastHelper";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Event interface
export interface Event {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "ACTIVE" | "REJECTED" | "CANCELLED" | "COMPLETED";
  sport_id: number;
  sport_name: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  location_lat: number;
  location_long: number;
  max_participants: number;
  creator_id: string;
  creator_name: string;
  created_at: string;
  updated_at: string;
  participant_count: number;
  user_joined: boolean;
}

// Event Rating interface
export interface EventRating {
  id?: number;
  event_id: number;
  user_id?: string;
  rating?: number | null;
  review: string;
  created_at?: string;
  users?: {
    full_name: string;
    profile_picture: string | null;
  };
}

// Event Rating Stats interface
export interface EventRatingStats {
  average: number;
  count: number;
}

// USER_DATA_KEY constant for AsyncStorage
const USER_DATA_KEY = "userData";

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
      showToast(
        "İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edin.",
        "error"
      );
      return {
        status: "error",
        data: fallback,
        message: "İnternet bağlantısı yok",
      };
    }

    return await apiFunc();
  } catch (error: any) {
    console.log("API çağrısı sırasında hata:", error.message);
    return {
      status: "error",
      data: fallback,
      message: error.message || "API isteği sırasında bir hata oluştu",
    };
  }
};

export const eventsApi = {
  // Kullanıcı ID'sini getir
  getCurrentUserId: async (): Promise<string | null> => {
    try {
      const userData = await AsyncStorage.getItem(USER_DATA_KEY);
      if (!userData) return null;

      const user = JSON.parse(userData);
      return user.id || null;
    } catch (error) {
      console.error("getCurrentUserId error:", error);
      return null;
    }
  },

  // Generic method to fetch events from any endpoint
  getAllEvents: async (
    page: number = 1,
    limit: number = 10,
    endpoint: string = "events",
    additionalParams: any = {}
  ) => {
    return safeApiCall(async () => {
      // Create a copy of additionalParams to avoid modifying the original
      let params = {
        page,
        limit,
        ...additionalParams,
      };

      // If this is a nearby events request, add required parameter names
      if (endpoint.includes("nearby") && params.lat && params.lng) {
        params = {
          ...params,
          latitude: params.lat,
          longitude: params.lng,
          distance: params.radius || 10,
        };
      }

      // Debug the parameters being sent
      console.log(`API Request to ${endpoint} with params:`, params);

      const response = await apiClient.get(endpoint, { params });

      // Handle different response structures based on backend API design
      if (response.data && response.data.data) {
        // For /api/events endpoint (events, events with status, or my/created events)
        if (endpoint === "events" || endpoint.includes("status/")) {
          return response.data.data.events || [];
        }
        // For /api/events/my/participated endpoint
        else if (
          endpoint.includes("my/participated") ||
          endpoint.includes("my/created")
        ) {
          return response.data.data.events || [];
        }
        // For /api/events/nearby endpoint
        else if (endpoint.includes("nearby")) {
          return response.data.data.events || [];
        }
        // For /api/events/today endpoint
        else if (endpoint.includes("today")) {
          return response.data.data || [];
        }
      }

      // Default fallback - just return an empty array to avoid errors
      console.warn(
        `Unknown response format from ${endpoint}. Using empty array fallback.`
      );
      return [];
    }, []);
  },

  // Bugünkü etkinlikleri getir
  getTodayEvents: async (page: number = 1, limit: number = 10) => {
    return safeApiCall(async () => {
      console.log("Bugünkü etkinlikler getiriliyor...");
      const response = await apiClient.get("events/today", {
        params: { page, limit },
      });
      return response.data.data || [];
    }, []);
  },

  // Etkinlik sayılarını getir
  getEventCounts: async () => {
    return safeApiCall(async () => {
      const response = await apiClient.get("events/counts");
      return response.data.data;
    });
  },

  // Etkinlik detayını getir
  getEventDetail: async (eventId: string) => {
    return safeApiCall(async () => {
      const response = await apiClient.get(`events/${eventId}`);
      return response.data.data.event as Event;
    }, null);
  },

  // Yakındaki etkinlikleri getir
  getNearbyEvents: async (lat: number, lng: number, distance: number = 10, page: number = 1, limit: number = 10, additionalParams: any = {}) => {
    return safeApiCall(async () => {
      console.log(`[API] getNearbyEvents çağrılıyor: lat=${lat}, lng=${lng}, distance=${distance}, page=${page}, limit=${limit}, additionalParams=`, additionalParams);
      
      // Koordinat kontrolü - geçerli koordinat değilse uyarı ver ve boş dizi döndür
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        console.error("[API] Geçersiz koordinatlar:", { lat, lng });
        showToast("Konum bilgisi geçersiz. Lütfen konum izninizi kontrol edin.", "error");
        return [];
      }
      
      // Tarih kontrolü
      if (additionalParams.event_date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(additionalParams.event_date)) {
          console.error("[API] Geçersiz tarih formatı:", additionalParams.event_date);
          // Try to fix date format if possible
          const dateObj = new Date(additionalParams.event_date);
          if (!isNaN(dateObj.getTime())) {
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            additionalParams.event_date = `${year}-${month}-${day}`;
            console.log("[API] Tarih formatı düzeltildi:", additionalParams.event_date);
          }
        }
      }
      
      // API isteği için parametreleri oluştur
      const params = { 
        latitude: lat,
        longitude: lng,
        distance,
        page, 
        limit,
        ...additionalParams
      };
      
      console.log("[API] Yakındaki etkinlikler için API isteği:", params);
      
      try {
        const response = await apiClient.get(`events/nearby`, { params });
        
        console.log(`[API] Yakındaki etkinlikler yanıtı: ${response.data.data.events?.length || 0} etkinlik bulundu`);
        
        if (response.data.data.events?.length === 0) {
          console.log(`[API] ${distance}km mesafede etkinlik bulunamadı`);
        } else if (additionalParams.event_date) {
          // Log dates for debugging
          console.log(`[API] Tarih filtresi ${additionalParams.event_date} ile dönen etkinlikler:`);
          response.data.data.events.forEach((event: any, i: number) => {
            console.log(`[API] Etkinlik ${i+1}: ID=${event.id}, Tarih=${event.event_date}, Başlık=${event.title}`);
          });
        }
        
        return response.data.data.events as Event[];
      } catch (error: any) {
        console.error("[API] Yakındaki etkinlikler getirilirken hata:", error.message);
        throw error;
      }
    }, []);
  },

  // Belirli duruma sahip etkinlikleri getir
  getEventsByStatus: async (
    status: string,
    page: number = 1,
    limit: number = 10
  ) => {
    return safeApiCall(async () => {
      // Normalize status to uppercase to ensure consistent API calls
      const normalizedStatus = status.toUpperCase();

      console.log(
        `API Call: getEventsByStatus with status=${normalizedStatus}, page=${page}, limit=${limit}`
      );

      const response = await apiClient.get(
        `events/status/${normalizedStatus}`,
        {
          params: { page, limit },
        }
      );

      console.log(
        `API Response: getEventsByStatus returned ${
          response.data?.data?.events?.length || 0
        } events`
      );

      return response.data.data.events as Event[];
    }, []);
  },

  // Etkinlik oluştur
  createEvent: async (
    eventData: Omit<
      Event,
      | "id"
      | "created_at"
      | "updated_at"
      | "creator_id"
      | "creator_name"
      | "participant_count"
      | "user_joined"
      | "status"
    >
  ) => {
    return safeApiCall(async () => {
      const response = await apiClient.post("events", eventData);
      return response.data.data.event as Event;
    });
  },

  // Etkinliğe katıl
  joinEvent: async (eventId: string) => {
    try {
      console.log(`Etkinliğe katılma isteği gönderiliyor: ${eventId}`);
      const response = await apiClient.post(`events/${eventId}/join`);
      console.log("Katılma isteği başarılı:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Etkinliğe katılma hatası:", error);

      // API'den dönen hata mesajını al
      let errorMessage = "Etkinliğe katılırken bir hata oluştu";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.data?.message) {
        errorMessage = error.response.data.data.message;
      }

      // Zaten katılmış olma durumunu özel olarak işle
      const isAlreadyJoined =
        errorMessage.toLowerCase().includes("zaten katıl") ||
        errorMessage.toLowerCase().includes("already joined") ||
        error.response?.status === 400;

      if (isAlreadyJoined) {
        console.log("Kullanıcı zaten etkinliğe katılmış - Özel işleme");
        return {
          status: "error",
          message: "Bu etkinliğe zaten katıldınız",
          data: { alreadyJoined: true },
          isJoined: true,
        };
      }

      // Hatayı uygun formatla döndür
      return {
        status: "error",
        message: errorMessage,
        data: null,
      };
    }
  },

  // Etkinlikten ayrıl
  leaveEvent: async (eventId: string) => {
    try {
      console.log(`Etkinlikten ayrılma isteği gönderiliyor: ${eventId}`);
      const response = await apiClient.post(`events/${eventId}/leave`);
      console.log("Ayrılma isteği başarılı:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Etkinlikten ayrılma hatası:", error);

      // API'den dönen hata mesajını al
      let errorMessage = "Etkinlikten ayrılırken bir hata oluştu";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.data?.message) {
        errorMessage = error.response.data.data.message;
      }

      // Hatayı uygun formatla döndür
      return {
        status: "error",
        message: errorMessage,
        data: null,
      };
    }
  },

  // Etkinlik katılımcılarını getir
  getEventParticipants: async (eventId: string) => {
    return safeApiCall(async () => {
      console.log(`Etkinlik katılımcıları getiriliyor, eventId=${eventId}`);
      const response = await apiClient.get(`events/${eventId}/participants`);

      console.log("Katılımcılar API yanıtı:", JSON.stringify(response.data));

      // API yanıt yapısını kontrol et ve uygun şekilde dön
      if (
        response.data &&
        response.data.status === "success" &&
        response.data.data &&
        Array.isArray(response.data.data.participants)
      ) {
        console.log(
          `${response.data.data.participants.length} katılımcı alındı`
        );
        return response.data.data.participants;
      } else if (response.data && Array.isArray(response.data)) {
        // Bazı eski API yanıtları doğrudan dizi dönebilir
        return response.data;
      }

      // Yanıt beklenmeyen formatta ise boş dizi döndür
      console.warn(
        `Beklenmeyen API yanıt formatı: ${eventId} için katılımcılar alınamadı`
      );
      return [];
    }, []);
  },

  // Etkinlik durumunu güncelle (sadece organizatör veya admin yapabilir)
  updateEventStatus: async (
    eventId: string,
    status: "ACTIVE" | "CANCELLED" | "COMPLETED"
  ) => {
    return safeApiCall(async () => {
      const response = await apiClient.patch(`events/${eventId}/status`, {
        status,
      });
      return response.data.data.event as Event;
    });
  },

  // Etkinlik bilgilerini güncelle (sadece organizatör veya admin yapabilir)
  updateEvent: async (eventId: string, eventData: Partial<Event>) => {
    return safeApiCall(async () => {
      const response = await apiClient.put(`events/${eventId}`, eventData);
      return response.data.data.event as Event;
    });
  },

  // Kullanıcıyı etkinliğe davet et
  inviteUserToEvent: async (eventId: string, inviteeId: string) => {
    return safeApiCall(async () => {
      const response = await apiClient.post(`events/${eventId}/invite`, {
        inviteeId,
      });
      return response.data;
    });
  },

  // Etkinliğin ortalama puanını getir
  getEventRatingAverage: async (eventId: string) => {
    return safeApiCall(
      async () => {
        const response = await apiClient.get(
          `event-ratings/${eventId}/average`
        );
        return response.data.data as EventRatingStats;
      },
      { average: 0, count: 0 }
    );
  },

  // Etkinliğin tüm yorumlarını getir
  getEventRatings: async (eventId: string) => {
    return safeApiCall(async () => {
      const response = await apiClient.get(`event-ratings/${eventId}/ratings`);
      return response.data.data as EventRating[];
    }, []);
  },

  // Kullanıcının etkinliğe yaptığı yorumu getir
  getUserRatingForEvent: async (eventId: string) => {
    return safeApiCall(async () => {
      const response = await apiClient.get(
        `event-ratings/${eventId}/my-rating`
      );
      return response.data.data as EventRating | null;
    }, null);
  },

  // Etkinliğe yorum/puanlama ekle
  addEventRating: async (eventId: string, review: string, rating?: number) => {
    return safeApiCall(async () => {
      const data: any = { review };
      if (rating) data.rating = rating;

      const response = await apiClient.post(
        `event-ratings/${eventId}/ratings`,
        data
      );
      return response.data.data as EventRating;
    });
  },

  // Etkinlik yorumunu güncelle
  updateEventRating: async (
    ratingId: number,
    review: string,
    rating?: number
  ) => {
    return safeApiCall(async () => {
      const data: any = { review };
      if (rating) data.rating = rating;

      const response = await apiClient.put(
        `event-ratings/rating/${ratingId}`,
        data
      );
      return response.data.data as EventRating;
    });
  },

  // Etkinlik yorumunu sil
  deleteEventRating: async (ratingId: number) => {
    return safeApiCall(async () => {
      const response = await apiClient.delete(
        `event-ratings/rating/${ratingId}`
      );
      return response.data;
    });
  },

  // Kullanıcının katıldığı etkinlikleri getir
  getUserParticipatedEvents: async (
    page: number = 1,
    limit: number = 10,
    status?: string
  ) => {
    return safeApiCall(async () => {
      console.log(`API Call: getUserParticipatedEvents with params:`, { page, limit, status });
      
      const queryParams: Record<string, any> = { page, limit };
      if (status) {
        queryParams.status = status;
      }

      console.log(
        `API Call: getUserParticipatedEvents with params:`,
        queryParams
      );

      const response = await apiClient.get(`events/my/participated`, {
        params: queryParams,
      });

      console.log(
        `API Response: getUserParticipatedEvents returned ${
          response.data?.data?.events?.length || 0
        } events`
      );

      return response.data.data.events as Event[];
    }, []);
  },

  // Kullanıcının oluşturduğu etkinlikleri getir
  getUserCreatedEvents: async (
    page: number = 1,
    limit: number = 10,
    status?: string
  ) => {
    return safeApiCall(async () => {
      console.log(
        `Kullanıcının oluşturduğu etkinlikler getiriliyor. Sayfa: ${page}, Limit: ${limit}`
      );
      let queryParams: any = { page, limit };
      if (status) {
        // Normalize status to uppercase to ensure consistent API calls
        queryParams.status = status.toUpperCase();
      }

      console.log(`API Call: getUserCreatedEvents with params:`, queryParams);

      const response = await apiClient.get(`events/my/created`, {
        params: queryParams,
      });

      console.log(
        `API Response: getUserCreatedEvents returned ${
          response.data?.data?.events?.length || 0
        } events`
      );

      return response.data.data.events as Event[];
    }, []);
  },
};
