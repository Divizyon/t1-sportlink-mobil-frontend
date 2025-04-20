/**
 * Kullanıcılar sayfası için mock veriler
 */

// GET isteği için örnek yanıt (kullanıcı listesi)
export const usersMockData = {
  // Response data
  responseData: {
    users: [
      {
        id: "u1",
        name: "Ali Yılmaz",
        username: "aliyilmaz",
        email: "ali.yilmaz@example.com",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        city: "Konya",
        role: "user",
        locationCoords: {
          latitude: 37.8746,
          longitude: 32.4932,
        },
        joinedAt: "2023-10-15T12:00:00Z",
      },
      {
        id: "u2",
        name: "Zeynep Demir",
        username: "zeynepd",
        email: "zeynep.demir@example.com",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        city: "İstanbul",
        role: "user",
        locationCoords: {
          latitude: 41.0082,
          longitude: 28.9784,
        },
        joinedAt: "2024-03-10T09:30:00Z",
      },
      {
        id: "u3",
        name: "Mehmet Kaya",
        username: "mehmetkaya",
        email: "mehmet.kaya@example.com",
        avatar: "https://randomuser.me/api/portraits/men/65.jpg",
        city: "Ankara",
        role: "admin",
        locationCoords: {
          latitude: 39.9208,
          longitude: 32.8541,
        },
        joinedAt: "2022-12-01T17:45:00Z",
      },
    ],
    totalCount: 3,
    page: 1,
    totalPages: 1,
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Kullanıcılar yüklenemedi.",
  },
};

// GET isteği için örnek yanıt (kullanıcı detayı)
export const userDetailMockData = {
  // Response data
  responseData: {
    id: "u1",
    name: "Ali Yılmaz",
    username: "aliyilmaz",
    email: "ali.yilmaz@example.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    city: "Konya",
    bio: "Amatör futbolcu, haftada 3 gün antrenman yapıyorum.",
    phoneNumber: "+90 555 123 4567",
    birthDate: "1992-05-15",
    gender: "Erkek",
    interests: ["Futbol", "Koşu", "Tenis"],
    role: "user",
    locationCoords: {
      latitude: 37.8746,
      longitude: 32.4932,
    },
    joinedAt: "2023-10-15T12:00:00Z",
    stats: {
      attendedEvents: 28,
      organizedEvents: 5,
      totalFriends: 42,
    },
    mutualFriends: 3,
    isFriend: true,
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Kullanıcı bilgileri yüklenemedi.",
  },
};

// GET isteği için örnek yanıt (kullanıcı arkadaşları)
export const userFriendsMockData = {
  // Response data
  responseData: {
    friends: [
      {
        id: "u2",
        name: "Zeynep Demir",
        username: "zeynepd",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        city: "İstanbul",
      },
      {
        id: "u3",
        name: "Mehmet Kaya",
        username: "mehmetkaya",
        avatar: "https://randomuser.me/api/portraits/men/65.jpg",
        city: "Ankara",
      },
    ],
    totalCount: 2,
    page: 1,
    totalPages: 1,
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Arkadaş listesi yüklenemedi.",
  },
};

// POST isteği için örnek veri (arkadaşlık isteği)
export const friendRequestMockData = {
  // Request data (gönderme)
  sendRequestData: {
    userId: "u2",
    action: "send",
  },

  // Response data (gönderme)
  sendResponseData: {
    success: true,
    message: "Arkadaşlık isteği gönderildi.",
    requestId: "fr1",
  },

  // Request data (kabul etme)
  acceptRequestData: {
    requestId: "fr1",
    action: "accept",
  },

  // Response data (kabul etme)
  acceptResponseData: {
    success: true,
    message: "Arkadaşlık isteği kabul edildi.",
    userId: "u2",
  },

  // Request data (reddetme)
  rejectRequestData: {
    requestId: "fr1",
    action: "reject",
  },

  // Response data (reddetme)
  rejectResponseData: {
    success: true,
    message: "Arkadaşlık isteği reddedildi.",
    requestId: "fr1",
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "İşlem gerçekleştirilemedi.",
  },
};

// DELETE isteği için örnek veri (arkadaşlıktan çıkarma)
export const removeFriendMockData = {
  // Response data
  responseData: {
    success: true,
    message: "Kullanıcı arkadaş listesinden çıkarıldı.",
    userId: "u2",
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Kullanıcı arkadaş listesinden çıkarılamadı.",
  },
};

// HTTP Methods
export const usersApiEndpoint = "/api/users"; // GET (liste)
export const userDetailApiEndpoint = "/api/users/:id"; // GET (detay)
export const userFriendsApiEndpoint = "/api/users/:id/friends"; // GET (arkadaşlar)
export const friendRequestApiEndpoint = "/api/friend-requests"; // POST (istek gönderme, kabul etme, reddetme)
export const removeFriendApiEndpoint = "/api/users/:id/friends/:friendId"; // DELETE (arkadaşlıktan çıkarma)
export const searchUsersApiEndpoint = "/api/users/search"; // GET (kullanıcı arama)
