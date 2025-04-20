/**
 * Profil sayfası için mock veriler
 */

// GET isteği için örnek yanıt
export const profileMockData = {
  // Response data
  responseData: {
    id: "u1",
    username: "denemeKullanici",
    email: "deneme@sportlink.com",
    name: "Ali Yılmaz",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    city: "Konya",
    bio: "Amatör futbolcu, haftada 3 gün antrenman yapıyorum.",
    phoneNumber: "+90 555 123 4567",
    birthDate: "1992-05-15",
    gender: "Erkek",
    interests: ["Futbol", "Koşu", "Tenis"],
    joinedAt: "2023-10-15T12:00:00Z",
    stats: {
      attendedEvents: 28,
      organizedEvents: 5,
      totalFriends: 42,
    },
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Profil bilgileri yüklenemedi.",
  },
};

// PUT isteği için örnek veri (profil güncelleme)
export const updateProfileMockData = {
  // Request data
  requestData: {
    name: "Ali Yılmaz",
    city: "Konya",
    bio: "Amatör futbolcu ve fitness eğitmeni.",
    phoneNumber: "+90 555 123 4567",
    interests: ["Futbol", "Fitness", "Tenis"],
  },

  // Response data
  responseData: {
    success: true,
    message: "Profil başarıyla güncellendi.",
    updatedProfile: {
      id: "u1",
      username: "denemeKullanici",
      email: "deneme@sportlink.com",
      name: "Ali Yılmaz",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      city: "Konya",
      bio: "Amatör futbolcu ve fitness eğitmeni.",
      phoneNumber: "+90 555 123 4567",
      interests: ["Futbol", "Fitness", "Tenis"],
    },
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Profil güncellenemedi.",
  },
};

// HTTP Methods
export const profileApiEndpoint = "/api/users/profile"; // GET, PUT
export const profileAvatarApiEndpoint = "/api/users/profile/avatar"; // POST (multipart/form-data)
