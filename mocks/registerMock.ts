/**
 * Kayıt sayfası için mock veriler
 */

// POST isteği için örnek veri
export const registerMockData = {
  // Request data
  requestData: {
    name: "Murat Demir",
    email: "sporcu123@sportlink.com",
    password: "GizliSifre123!",
    confirmPassword: "GizliSifre123!",
  },

  // Response data
  responseData: {
    success: true,
    message: "Kayıt başarılı. Lütfen giriş yapınız.",
    userId: "u4",
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Bu e-posta adresi zaten kullanılıyor.",
    errors: {
      email: "Bu e-posta adresi ile daha önce kayıt olunmuş.",
    },
  },
};

// HTTP Method: POST
export const registerApiEndpoint = "/api/auth/register";
