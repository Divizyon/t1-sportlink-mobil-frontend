/**
 * Arama sayfası için mock veriler
 */

// GET isteği için örnek yanıt (arama sonuçları)
export const searchMockData = {
  // Response data
  responseData: {
    users: [
      {
        id: "u1",
        name: "Ali Yılmaz",
        username: "aliyilmaz",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        city: "Konya",
        isFriend: true,
      },
      {
        id: "u5",
        name: "Ahmet Yıldız",
        username: "ahmetyildiz",
        avatar: "https://randomuser.me/api/portraits/men/76.jpg",
        city: "İzmir",
        isFriend: false,
      },
    ],
    events: [
      {
        id: 1,
        title: "Hazırlık Maçı - A Takımı",
        date: new Date(new Date().setDate(new Date().getDate() + 2)),
        time: "15:00",
        location: "Ana Saha",
        category: "Futbol",
        participants: 18,
        maxParticipants: 22,
        organizer: {
          id: "u3",
          name: "Mehmet Can",
        },
        image: "https://example.com/images/football-match.jpg",
      },
      {
        id: 6,
        title: "Futbol Antrenmanı",
        date: new Date(new Date().setDate(new Date().getDate() + 5)),
        time: "17:00",
        location: "B Sahası",
        category: "Futbol",
        participants: 12,
        maxParticipants: 20,
        organizer: {
          id: "u2",
          name: "Zeynep Demir",
        },
        image: "https://example.com/images/football-training.jpg",
      },
    ],
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Arama gerçekleştirilemedi.",
  },
};

// GET isteği için örnek yanıt (sadece kullanıcı arama)
export const searchUsersMockData = {
  // Response data
  responseData: {
    users: [
      {
        id: "u1",
        name: "Ali Yılmaz",
        username: "aliyilmaz",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        city: "Konya",
        isFriend: true,
      },
      {
        id: "u5",
        name: "Ahmet Yıldız",
        username: "ahmetyildiz",
        avatar: "https://randomuser.me/api/portraits/men/76.jpg",
        city: "İzmir",
        isFriend: false,
      },
    ],
    totalCount: 2,
    page: 1,
    totalPages: 1,
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Kullanıcı araması gerçekleştirilemedi.",
  },
};

// GET isteği için örnek yanıt (sadece etkinlik arama)
export const searchEventsMockData = {
  // Response data
  responseData: {
    events: [
      {
        id: 1,
        title: "Hazırlık Maçı - A Takımı",
        date: new Date(new Date().setDate(new Date().getDate() + 2)),
        time: "15:00",
        location: "Ana Saha",
        category: "Futbol",
        participants: 18,
        maxParticipants: 22,
        organizer: {
          id: "u3",
          name: "Mehmet Can",
        },
        image: "https://example.com/images/football-match.jpg",
      },
      {
        id: 6,
        title: "Futbol Antrenmanı",
        date: new Date(new Date().setDate(new Date().getDate() + 5)),
        time: "17:00",
        location: "B Sahası",
        category: "Futbol",
        participants: 12,
        maxParticipants: 20,
        organizer: {
          id: "u2",
          name: "Zeynep Demir",
        },
        image: "https://example.com/images/football-training.jpg",
      },
    ],
    totalCount: 2,
    page: 1,
    totalPages: 1,
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Etkinlik araması gerçekleştirilemedi.",
  },
};

// HTTP Methods
export const searchApiEndpoint = "/api/search"; // GET (genel arama)
export const searchUsersApiEndpoint = "/api/search/users"; // GET (kullanıcı arama)
export const searchEventsApiEndpoint = "/api/search/events"; // GET (etkinlik arama)
