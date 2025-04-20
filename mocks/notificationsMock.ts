/**
 * Bildirimler sayfası için mock veriler
 */

// GET isteği için örnek yanıt
export const notificationsMockData = {
  // Response data
  responseData: {
    notifications: [
      {
        id: "n1",
        type: "event_invitation",
        title: "Etkinlik Daveti",
        message:
          "Ali Yılmaz sizi 'Hazırlık Maçı - A Takımı' etkinliğine davet etti.",
        relatedId: "1", // event id
        sender: {
          id: "u1",
          name: "Ali Yılmaz",
          avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        },
        isRead: false,
        createdAt: new Date(new Date().setHours(new Date().getHours() - 2)),
      },
      {
        id: "n2",
        type: "event_reminder",
        title: "Etkinlik Hatırlatması",
        message:
          "'Taktik Antrenmanı' etkinliği bugün saat 16:00'da başlayacak.",
        relatedId: "201", // event id
        isRead: true,
        createdAt: new Date(new Date().setHours(new Date().getHours() - 6)),
      },
      {
        id: "n3",
        type: "event_update",
        title: "Etkinlik Güncellemesi",
        message: "'Dayanıklılık Antrenmanı' etkinliğinin saati güncellendi.",
        relatedId: "2", // event id
        isRead: false,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1)),
      },
      {
        id: "n4",
        type: "friend_request",
        title: "Arkadaşlık İsteği",
        message: "Zeynep Demir size arkadaşlık isteği gönderdi.",
        relatedId: "u2", // user id
        sender: {
          id: "u2",
          name: "Zeynep Demir",
          avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        },
        isRead: false,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2)),
      },
      {
        id: "n5",
        type: "event_cancelled",
        title: "Etkinlik İptali",
        message: "'Kondisyon Antrenmanı' etkinliği iptal edildi.",
        relatedId: "3", // event id
        isRead: true,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 3)),
      },
    ],
    unreadCount: 3,
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Bildirimler yüklenemedi.",
  },
};

// PUT isteği için örnek veri (bildirimi okundu olarak işaretleme)
export const markNotificationReadMockData = {
  // Request data (tek bildirim)
  singleRequestData: {
    notificationId: "n1",
    isRead: true,
  },

  // Request data (tüm bildirimleri okundu olarak işaretleme)
  allRequestData: {
    markAllAsRead: true,
  },

  // Response data (tek bildirim)
  singleResponseData: {
    success: true,
    message: "Bildirim okundu olarak işaretlendi.",
    notificationId: "n1",
  },

  // Response data (tüm bildirimler)
  allResponseData: {
    success: true,
    message: "Tüm bildirimler okundu olarak işaretlendi.",
    unreadCount: 0,
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Bildirim güncellenemedi.",
  },
};

// DELETE isteği için örnek veri (bildirimi silme)
export const deleteNotificationMockData = {
  // Response data
  responseData: {
    success: true,
    message: "Bildirim silindi.",
    notificationId: "n1",
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Bildirim silinemedi.",
  },
};

// HTTP Methods
export const notificationsApiEndpoint = "/api/notifications"; // GET (liste)
export const notificationReadApiEndpoint = "/api/notifications/read"; // PUT (okundu işaretleme)
export const notificationDeleteApiEndpoint = "/api/notifications/:id"; // DELETE (silme)
