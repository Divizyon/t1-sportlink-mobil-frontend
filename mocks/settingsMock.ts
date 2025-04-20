/**
 * Ayarlar sayfası için mock veriler
 */

// GET isteği için örnek yanıt (kullanıcı ayarları)
export const settingsMockData = {
  // Response data
  responseData: {
    notifications: {
      eventReminders: true,
      eventUpdates: true,
      eventInvitations: true,
      friendRequests: true,
      messages: true,
      appUpdates: false,
    },
    privacy: {
      showLocation: true,
      showEmail: false,
      showPhone: false,
      allowFriendRequests: true,
      allowEventInvitations: true,
      publicProfile: true,
    },
    appearance: {
      theme: "light",
      language: "tr",
      fontSize: "medium",
    },
    account: {
      email: "deneme@sportlink.com",
      phone: "+90 555 123 4567",
      lastPasswordChange: "2023-12-01T10:30:00Z",
    },
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Ayarlar yüklenemedi.",
  },
};

// PUT isteği için örnek veri (bildirim ayarları güncelleme)
export const updateNotificationSettingsMockData = {
  // Request data
  requestData: {
    eventReminders: true,
    eventUpdates: false,
    eventInvitations: true,
    friendRequests: true,
    messages: true,
    appUpdates: true,
  },

  // Response data
  responseData: {
    success: true,
    message: "Bildirim ayarları güncellendi.",
    settings: {
      eventReminders: true,
      eventUpdates: false,
      eventInvitations: true,
      friendRequests: true,
      messages: true,
      appUpdates: true,
    },
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Bildirim ayarları güncellenemedi.",
  },
};

// PUT isteği için örnek veri (gizlilik ayarları güncelleme)
export const updatePrivacySettingsMockData = {
  // Request data
  requestData: {
    showLocation: false,
    showEmail: false,
    showPhone: false,
    allowFriendRequests: true,
    allowEventInvitations: true,
    publicProfile: false,
  },

  // Response data
  responseData: {
    success: true,
    message: "Gizlilik ayarları güncellendi.",
    settings: {
      showLocation: false,
      showEmail: false,
      showPhone: false,
      allowFriendRequests: true,
      allowEventInvitations: true,
      publicProfile: false,
    },
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Gizlilik ayarları güncellenemedi.",
  },
};

// PUT isteği için örnek veri (görünüm ayarları güncelleme)
export const updateAppearanceSettingsMockData = {
  // Request data
  requestData: {
    theme: "dark",
    language: "tr",
    fontSize: "large",
  },

  // Response data
  responseData: {
    success: true,
    message: "Görünüm ayarları güncellendi.",
    settings: {
      theme: "dark",
      language: "tr",
      fontSize: "large",
    },
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Görünüm ayarları güncellenemedi.",
  },
};

// PUT isteği için örnek veri (şifre değiştirme)
export const changePasswordMockData = {
  // Request data
  requestData: {
    currentPassword: "Deneme1234!",
    newPassword: "YeniSifre4321!",
    confirmPassword: "YeniSifre4321!",
  },

  // Response data
  responseData: {
    success: true,
    message: "Şifreniz başarıyla değiştirildi.",
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Şifre değiştirilemedi.",
    errors: {
      currentPassword: "Mevcut şifre yanlış.",
    },
  },
};

// DELETE isteği için örnek yanıt (hesap silme)
export const deleteAccountMockData = {
  // Request data
  requestData: {
    password: "Deneme1234!",
    reason: "Başka bir uygulamaya geçiyorum.",
  },

  // Response data
  responseData: {
    success: true,
    message: "Hesabınız başarıyla silindi.",
  },

  // Hata durumu için örnek yanıt
  errorResponse: {
    success: false,
    message: "Hesabınız silinemedi.",
    errors: {
      password: "Girdiğiniz şifre yanlış.",
    },
  },
};

// HTTP Methods
export const settingsApiEndpoint = "/api/settings"; // GET (ayarlar)
export const notificationSettingsApiEndpoint = "/api/settings/notifications"; // PUT (bildirim ayarları güncelleme)
export const privacySettingsApiEndpoint = "/api/settings/privacy"; // PUT (gizlilik ayarları güncelleme)
export const appearanceSettingsApiEndpoint = "/api/settings/appearance"; // PUT (görünüm ayarları güncelleme)
export const changePasswordApiEndpoint = "/api/settings/password"; // PUT (şifre değiştirme)
export const deleteAccountApiEndpoint = "/api/settings/account"; // DELETE (hesap silme)
