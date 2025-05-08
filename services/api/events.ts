import { apiClient } from "./client";
import { showToast } from "../../utils/toastHelper";
import NetInfo from "@react-native-community/netinfo";

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

export const eventsApi = {
  // Generic method to fetch events from any endpoint
  getAllEvents: async (page: number = 1, limit: number = 10, endpoint: string = "events", additionalParams: any = {}) => {
    return safeApiCall(async () => {
      const params = {
        page,
        limit,
        ...additionalParams
      };
      
      const response = await apiClient.get(endpoint, { params });
      
      // Handle different response structures
      if (endpoint.includes('nearby') || endpoint === 'events') {
        return response.data.data.events as Event[];
      } else if (endpoint.includes('participated')) {
        return response.data.data.events as Event[];
      } else {
        // Default fallback
        return response.data.data?.events || [] as Event[];
      }
    }, []);
  },
  
  // Bugünkü etkinlikleri getir
  getTodayEvents: async () => {
    return safeApiCall(async () => {
      console.log("Bugünkü etkinlikler getiriliyor...");
      const response = await apiClient.get("events/today");
      console.log("Bugünkü etkinlikler alındı:", response.data.data);
      return response.data.data as Event[];
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
      // Bilinen problem: ID 120 sürekli hata veriyor
      if (eventId === "120" || eventId === "safe-120") {
        console.log("Bilinen sorunlu event ID (120) isteği engellendi");
        throw new Error("Etkinlik bulunamadı");
      }
      
      const response = await apiClient.get(`events/${eventId}`);
      return response.data.data.event as Event;
    }, null);
  },
  
  // Yakındaki etkinlikleri getir
  getNearbyEvents: async (lat: number, lng: number, radius: number = 10, page: number = 1, limit: number = 10) => {
    return safeApiCall(async () => {
      const response = await apiClient.get(`events/nearby`, {
        params: { lat, lng, radius, page, limit }
      });
      return response.data.data.events as Event[];
    }, []);
  },
  
  // Katıldığım etkinlikleri getir
  getUserParticipatedEvents: async (page: number = 1, limit: number = 10, status?: string) => {
    return safeApiCall(async () => {
      let queryParams: any = { page, limit };
      if (status) queryParams.status = status;
      
      const response = await apiClient.get(`events/my/participated`, {
        params: queryParams
      });
      return response.data.data.events as Event[];
    }, []);
  },
  
  // Kullanıcının oluşturduğu etkinlikleri getir
  getUserCreatedEvents: async (page: number = 1, limit: number = 10) => {
    return safeApiCall(async () => {
      console.log(`Kullanıcının oluşturduğu etkinlikler getiriliyor. Sayfa: ${page}, Limit: ${limit}`);
      const response = await apiClient.get(`events`, {
        params: { creator: true, page, limit }
      });
      
      // Yanıt logu göster (Kısaltılmış log)
      console.log("Oluşturulan etkinlikler API yanıtı alındı");
      
      // events alanı yoksa, [] dön
      if (!response.data.data.events) {
        console.log("Oluşturulan etkinlikler API'si boş dizi döndü");
        return [];
      }
      
      return response.data.data.events as Event[];
    }, []);
  },
  
  // Etkinlik oluştur
  createEvent: async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'creator_id' | 'creator_name' | 'participant_count' | 'user_joined' | 'status'>) => {
    return safeApiCall(async () => {
      const response = await apiClient.post("events", eventData);
      return response.data.data.event as Event;
    });
  },
  
  // Etkinliğe katıl
  joinEvent: async (eventId: string) => {
    return safeApiCall(async () => {
      const response = await apiClient.post(`events/${eventId}/join`);
      return response.data.data;
    });
  },
  
  // Etkinlikten ayrıl
  leaveEvent: async (eventId: string) => {
    return safeApiCall(async () => {
      const response = await apiClient.post(`events/${eventId}/leave`);
      return response.data.data;
    });
  },
  
  // Etkinlik katılımcılarını getir
  getEventParticipants: async (eventId: string) => {
    return safeApiCall(async () => {
      const response = await apiClient.get(`events/${eventId}/participants`);
      return response.data.data.participants;
    }, []);
  },
  
  // Etkinlik durumunu güncelle (sadece organizatör veya admin yapabilir)
  updateEventStatus: async (eventId: string, status: "ACTIVE" | "CANCELLED" | "COMPLETED") => {
    return safeApiCall(async () => {
      const response = await apiClient.patch(`events/${eventId}/status`, { status });
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

  // Etkinliğin ortalama puanını getir
  getEventRatingAverage: async (eventId: string) => {
    return safeApiCall(async () => {
      const response = await apiClient.get(`event-ratings/${eventId}/average`);
      return response.data.data as EventRatingStats;
    }, { average: 0, count: 0 });
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
      const response = await apiClient.get(`event-ratings/${eventId}/my-rating`);
      return response.data.data as EventRating | null;
    }, null);
  },

  // Etkinliğe yorum/puanlama ekle
  addEventRating: async (eventId: string, review: string, rating?: number) => {
    return safeApiCall(async () => {
      const data: any = { review };
      if (rating) data.rating = rating;
      
      const response = await apiClient.post(`event-ratings/${eventId}/ratings`, data);
      return response.data.data as EventRating;
    });
  },

  // Etkinlik yorumunu güncelle
  updateEventRating: async (ratingId: number, review: string, rating?: number) => {
    return safeApiCall(async () => {
      const data: any = { review };
      if (rating) data.rating = rating;
      
      const response = await apiClient.put(`event-ratings/rating/${ratingId}`, data);
      return response.data.data as EventRating;
    });
  },

  // Etkinlik yorumunu sil
  deleteEventRating: async (ratingId: number) => {
    return safeApiCall(async () => {
      const response = await apiClient.delete(`event-ratings/rating/${ratingId}`);
      return response.data;
    });
  }
}; 