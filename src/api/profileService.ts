import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "@/src/api";
import { UserProfile } from "../types";

interface ProfileResponse {
  status: string;
  data: UserProfile;
}

interface ProfileUpdateResponse {
  status: string;
  message: string;
  data: UserProfile;
}

// Profil servisi
export const profileService = {
  // Profil bilgilerini getir
  async getProfile(): Promise<UserProfile> {
    try {
      console.log("[Profile API] Profil bilgileri getiriliyor...");

      // Profile endpoint'i kullanılıyor - /api/ prefix'i olmadan
      const response = await apiClient.get<ProfileResponse>("/profile");

      console.log(
        "[Profile API] Profil bilgileri başarıyla alındı:",
        JSON.stringify(response.data, null, 2)
      );

      // response.data içinde data varsa onu, yoksa doğrudan response.data'yı kullan
      if (response.data && response.data.data) {
        return response.data.data;
      }

      // Eğer direkt UserProfile döndürüyorsa
      return response.data as unknown as UserProfile;
    } catch (error: any) {
      console.error("[Profile API] Profil bilgilerini getirme hatası:", error);

      // Daha detaylı hata bilgisi
      if (error.response) {
        console.error(
          "[Profile API] Hata detayları:",
          JSON.stringify(
            {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            },
            null,
            2
          )
        );
      }

      throw error;
    }
  },

  // Profil bilgilerini güncelle
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      console.log("[Profile API] Profil güncelleme isteği gönderiliyor...");
      console.log(
        "[Profile API] Gönderilen veriler:",
        JSON.stringify(data, null, 2)
      );

      // Doğru endpoint: Direkt olarak /profile endpoint'ini kullan
      const response = await apiClient.put<ProfileUpdateResponse>(
        "/profile",
        data
      );

      console.log(
        "[Profile API] Profil bilgileri güncelleme yanıtı:",
        JSON.stringify(response.data, null, 2)
      );

      // response.data içinde data varsa onu, yoksa doğrudan response.data'yı kullan
      if (response.data && response.data.data) {
        console.log(
          "[Profile API] Güncelleme başarılı! Alınan veri:",
          JSON.stringify(response.data.data, null, 2)
        );
        return response.data.data;
      }

      // Eğer direkt UserProfile döndürüyorsa
      console.log("[Profile API] Alternatif yanıt formatı kullanıldı.");
      return response.data as unknown as UserProfile;
    } catch (error: any) {
      console.error("[Profile API] Profil güncelleme hatası:", error);

      // Daha detaylı hata bilgisi
      if (error.response) {
        console.error(
          "[Profile API] Hata detayları:",
          JSON.stringify(
            {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            },
            null,
            2
          )
        );
      }

      throw error;
    }
  },

  // Avatar yükleme
  async uploadAvatar(imageUri: string): Promise<string> {
    try {
      console.log("[Profile API] Avatar yükleniyor...");

      // FormData oluştur
      const formData = new FormData();

      // URI'den dosya adını çıkart
      const uriParts = imageUri.split("/");
      const fileName = uriParts[uriParts.length - 1];

      // Dosya tipi tespiti
      const fileType = fileName.split(".").pop()?.toLowerCase();
      let mimeType = "image/jpeg"; // varsayılan

      if (fileType === "png") {
        mimeType = "image/png";
      } else if (fileType === "gif") {
        mimeType = "image/gif";
      }

      // Resmi ekle
      formData.append("avatar", {
        uri: imageUri,
        type: mimeType,
        name: fileName,
      } as any);

      // POST /profile/avatar endpoint'i kullanılıyor (doğru endpoint)
      const response = await apiClient.post("/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(
        "[Profile API] Avatar başarıyla yüklendi:",
        JSON.stringify(response.data, null, 2)
      );

      // Avatar URL'sini döndür (response yapısına göre)
      if (response.data && response.data.data && response.data.data.avatarUrl) {
        return response.data.data.avatarUrl;
      }

      return response.data.avatarUrl || response.data.data?.avatarUrl || "";
    } catch (error: any) {
      console.error("[Profile API] Avatar yükleme hatası:", error);

      // Daha detaylı hata bilgisi
      if (error.response) {
        console.error(
          "[Profile API] Hata detayları:",
          JSON.stringify(
            {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            },
            null,
            2
          )
        );
      }

      throw error;
    }
  },

  // Avatar silme
  async deleteAvatar(): Promise<{
    success: boolean;
    message?: string;
    defaultAvatarUrl?: string;
  }> {
    try {
      console.log("[Profile API] Avatar siliniyor...");

      // DELETE /profile/avatar endpoint'i kullanılıyor
      const response = await apiClient.delete("/profile/avatar");

      console.log(
        "[Profile API] Avatar başarıyla silindi:",
        JSON.stringify(response.data, null, 2)
      );

      // Varsayılan URL'i de döndür
      const defaultAvatarUrl =
        response.data?.data?.avatarUrl || response.data?.avatarUrl;

      return {
        success: true,
        message: response.data?.message || "Avatar başarıyla silindi.",
        defaultAvatarUrl: defaultAvatarUrl,
      };
    } catch (error: any) {
      console.error("[Profile API] Avatar silme hatası:", error);

      // Daha detaylı hata bilgisi
      if (error.response) {
        console.error(
          "[Profile API] Hata detayları:",
          JSON.stringify(
            {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            },
            null,
            2
          )
        );
      }

      throw error;
    }
  },

  // Şifre değiştirme
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }): Promise<void> {
    try {
      console.log("[Profile API] Şifre değiştirme isteği gönderiliyor...");

      // /profile/password endpoint'i kullanılıyor
      const response = await apiClient.put("/profile/password", data);

      console.log(
        "[Profile API] Şifre başarıyla değiştirildi:",
        JSON.stringify(response.data, null, 2)
      );
    } catch (error: any) {
      console.error("[Profile API] Şifre değiştirme hatası:", error);

      // Daha detaylı hata bilgisi
      if (error.response) {
        console.error(
          "[Profile API] Hata detayları:",
          JSON.stringify(
            {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            },
            null,
            2
          )
        );
      }

      throw error;
    }
  },

  // İlgi alanlarını (sporları) getir
  async getSports(): Promise<
    Array<{
      sport_id: number;
      sport: { id: number; name: string; icon: string; description: string };
    }>
  > {
    try {
      console.log("[Profile API] İlgi alanları (sporlar) getiriliyor...");
      // /profile/sports endpoint'i kullanılıyor - /api prefix'i olmadan
      const response = await apiClient.get("/profile/sports");

      console.log(
        "[Profile API] İlgi alanları başarıyla alındı:",
        JSON.stringify(response.data, null, 2)
      );

      if (response.data && response.data.data) {
        return response.data.data;
      }

      return response.data || [];
    } catch (error: any) {
      console.error("[Profile API] İlgi alanlarını getirme hatası:", error);

      // Daha detaylı hata bilgisi
      if (error.response) {
        console.error(
          "[Profile API] Hata detayları:",
          JSON.stringify(
            {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            },
            null,
            2
          )
        );
      }

      return [];
    }
  },

  // Kullanıcının favori sporlarına yeni spor ekle
  async addSport(sportId: number): Promise<boolean> {
    try {
      console.log(
        `[Profile API] Favori sporlara ${sportId} ID'li spor ekleniyor...`
      );
      // /profile/sports endpoint'i kullanılıyor - /api prefix'i olmadan
      const response = await apiClient.post("/profile/sports", {
        sport_id: sportId,
      });

      console.log(
        "[Profile API] Spor başarıyla eklendi:",
        JSON.stringify(response.data, null, 2)
      );
      return true;
    } catch (error: any) {
      console.error("[Profile API] Spor ekleme hatası:", error);

      // Daha detaylı hata bilgisi
      if (error.response) {
        console.error(
          "[Profile API] Hata detayları:",
          JSON.stringify(
            {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            },
            null,
            2
          )
        );
      }

      return false;
    }
  },

  // Kullanıcının favori sporlarından bir sporu kaldır
  async removeSport(sportId: number): Promise<boolean> {
    try {
      console.log(
        `[Profile API] Favori sporlardan ${sportId} ID'li spor kaldırılıyor...`
      );
      // /profile/sports/{sportId} endpoint'i kullanılıyor - /api prefix'i olmadan
      const response = await apiClient.delete(`/profile/sports/${sportId}`);

      console.log(
        "[Profile API] Spor başarıyla kaldırıldı:",
        JSON.stringify(response.data, null, 2)
      );
      return true;
    } catch (error: any) {
      console.error("[Profile API] Spor kaldırma hatası:", error);

      // Daha detaylı hata bilgisi
      if (error.response) {
        console.error(
          "[Profile API] Hata detayları:",
          JSON.stringify(
            {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            },
            null,
            2
          )
        );
      }

      return false;
    }
  },

  // Kullanıcının favori sporlarını toplu güncelle
  async updateSportsBatch(sportIds: number[]): Promise<boolean> {
    try {
      console.log("[Profile API] Favori sporlar toplu olarak güncelleniyor...");
      // /profile/sports/batch endpoint'i kullanılıyor - /api prefix'i olmadan
      const response = await apiClient.post("/profile/sports/batch", {
        sport_ids: sportIds,
      });

      console.log(
        "[Profile API] Sporlar başarıyla güncellendi:",
        JSON.stringify(response.data, null, 2)
      );
      return true;
    } catch (error: any) {
      console.error("[Profile API] Sporları toplu güncelleme hatası:", error);

      // Daha detaylı hata bilgisi
      if (error.response) {
        console.error(
          "[Profile API] Hata detayları:",
          JSON.stringify(
            {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            },
            null,
            2
          )
        );
      }

      return false;
    }
  },

  // Tüm mevcut spor dalları listesini getir
  async getAllSports(): Promise<
    Array<{ id: number; name: string; icon: string; description: string }>
  > {
    try {
      console.log("Tüm spor dalları getiriliyor...");
      const response = await apiClient.get("/sports");

      if (response.data && response.data.data) {
        return response.data.data;
      }

      return response.data || [];
    } catch (error: any) {
      console.error("Spor dallarını getirme hatası:", error);
      return [];
    }
  },

  // Hesabı dondurma
  async freezeAccount(): Promise<{ success: boolean; message: string }> {
    try {
      console.log("Hesap dondurma işlemi başlatılıyor...");

      const response = await apiClient.post("/users/account/freeze");

      console.log("Hesap dondurma yanıtı:", response.data);

      return {
        success: true,
        message: response.data?.message || "Hesabınız başarıyla donduruldu.",
      };
    } catch (error: any) {
      console.error("Hesap dondurma hatası:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Hesap dondurma işlemi sırasında bir hata oluştu.",
      };
    }
  },

  // Hesabı silme
  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    try {
      console.log("Hesap silme işlemi başlatılıyor...");

      const response = await apiClient.post("/users/account/delete");

      console.log("Hesap silme yanıtı:", response.data);

      return {
        success: true,
        message: response.data?.message || "Hesabınız başarıyla silindi.",
      };
    } catch (error: any) {
      console.error("Hesap silme hatası:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Hesap silme işlemi sırasında bir hata oluştu.",
      };
    }
  },
};

export default profileService;
