/**
 * Login sayfası için mock veriler
 */

// POST isteği için örnek veri
export const loginMockData = {
  // Request data
  requestData: {
    email: "deneme@sportlink.com",
    password: "Deneme1234!",
  },

  // Response data
  responseData: {
    success: true,
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1MSIsImVtYWlsIjoiZGVuZW1lQHNwb3J0bGluay5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTY0NjMxMjgwMH0",
    user: {
      id: "u1",
      username: "denemeKullanici",
      email: "deneme@sportlink.com",
      name: "Ali Yılmaz",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      role: "user",
    },
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Geçersiz e-posta veya şifre. Lütfen tekrar deneyiniz.",
  },
};

// HTTP Method: POST
export const loginApiEndpoint = "/api/auth/login";
