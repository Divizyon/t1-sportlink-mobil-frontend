import apiClient from ".";

/**
 * Etkinlikler ile ilgili API isteklerini yöneten servis.
 */
const eventService = {
  /**
   * Tüm etkinlikleri getirir
   * @param page Sayfa numarası
   * @param limit Sayfa başına etkinlik sayısı
   * @returns API yanıtı
   */
  getAllEvents: async (page = 1, limit = 10) => {
    return await apiClient.get(`/events?page=${page}&limit=${limit}`);
  },

  /**
   * Kullanıcının katıldığı etkinlikleri getirir
   * @param page Sayfa numarası
   * @param limit Sayfa başına etkinlik sayısı
   * @returns API yanıtı
   */
  getParticipatedEvents: async (page = 1, limit = 10) => {
    return await apiClient.get(
      `/events/my/participated?page=${page}&limit=${limit}`
    );
  },

  /**
   * Kullanıcının oluşturduğu etkinlikleri getirir
   * @param page Sayfa numarası
   * @param limit Sayfa başına etkinlik sayısı
   * @returns API yanıtı
   */
  getCreatedEvents: async (page = 1, limit = 10) => {
    return await apiClient.get(
      `/events/my/created?page=${page}&limit=${limit}`
    );
  },

  /**
   * Etkinlik detaylarını getirir
   * @param eventId Etkinlik ID'si
   * @returns API yanıtı
   */
  getEventDetails: async (eventId: string | number) => {
    return await apiClient.get(`/events/${eventId}`);
  },

  /**
   * Bir etkinliğe katılmak için istek gönderir
   * @param eventId Etkinlik ID'si
   * @returns API yanıtı
   */
  joinEvent: async (eventId: string | number) => {
    return await apiClient.post(`/events/${eventId}/join`);
  },

  /**
   * Bir etkinlikten ayrılmak için istek gönderir
   * @param eventId Etkinlik ID'si
   * @returns API yanıtı
   */
  leaveEvent: async (eventId: string | number) => {
    return await apiClient.post(`/events/${eventId}/leave`);
  },

  /**
   * Yeni etkinlik oluşturur
   * @param eventData Etkinlik verileri
   * @returns API yanıtı
   */
  createEvent: async (eventData: any) => {
    return await apiClient.post("/events", eventData);
  },

  /**
   * Etkinliği günceller
   * @param eventId Etkinlik ID'si
   * @param eventData Güncellenecek etkinlik verileri
   * @returns API yanıtı
   */
  updateEvent: async (eventId: string | number, eventData: any) => {
    return await apiClient.put(`/events/${eventId}`, eventData);
  },

  /**
   * Etkinliği siler
   * @param eventId Etkinlik ID'si
   * @returns API yanıtı
   */
  deleteEvent: async (eventId: string | number) => {
    return await apiClient.delete(`/events/${eventId}`);
  },

  /**
   * Belirli bir konuma yakın etkinlikleri getirir
   * @param lat Enlem
   * @param lng Boylam
   * @param radius Yarıçap (km)
   * @param page Sayfa numarası
   * @param limit Sayfa başına etkinlik sayısı
   * @returns API yanıtı
   */
  getNearbyEvents: async (
    lat: number,
    lng: number,
    radius = 5,
    page = 1,
    limit = 10
  ) => {
    return await apiClient.get(
      `/events/nearby?lat=${lat}&lng=${lng}&radius=${radius}&page=${page}&limit=${limit}`
    );
  },
};

export default eventService;
