/**
 * Şifremi unuttum sayfası için mock veriler
 */

// POST isteği için örnek veri (şifre sıfırlama e-postası gönderme)
export const forgotPasswordMockData = {
  // Request data
  requestData: {
    email: "deneme@sportlink.com",
  },

  // Response data
  responseData: {
    success: true,
    message:
      "Şifre sıfırlama e-postası gönderildi. Lütfen e-postanızı kontrol edin.",
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.",
  },
};

// POST isteği için örnek veri (şifre sıfırlama)
export const resetPasswordMockData = {
  // Request data
  requestData: {
    token: "abcdef123456",
    newPassword: "YeniSifre4321!",
    confirmPassword: "YeniSifre4321!",
  },

  // Response data
  responseData: {
    success: true,
    message: "Şifreniz başarıyla sıfırlandı. Şimdi giriş yapabilirsiniz.",
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Geçersiz veya süresi dolmuş token.",
    errors: {
      token:
        "Bu şifre sıfırlama bağlantısının süresi dolmuş veya zaten kullanılmış.",
      newPassword: "Şifre en az 8 karakter uzunluğunda olmalıdır.",
    },
  },
};

// HTTP Methods
export const forgotPasswordApiEndpoint = "/api/auth/forgot-password"; // POST (şifre sıfırlama e-postası gönderme)
export const resetPasswordApiEndpoint = "/api/auth/reset-password"; // POST (şifre sıfırlama)
