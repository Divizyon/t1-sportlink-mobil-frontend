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
      console.log("Profil bilgileri getiriliyor...");

      // /api/profile endpoint'i kullanılıyor
      const response = await apiClient.get<ProfileResponse>("/api/profile");

      console.log("Profil bilgileri başarıyla alındı.");

      // response.data içinde data varsa onu, yoksa doğrudan response.data'yı kullan
      if (response.data && response.data.data) {
        return response.data.data;
      }

      // Eğer direkt UserProfile döndürüyorsa
      return response.data as unknown as UserProfile;
    } catch (error: any) {
      console.error("Profil bilgilerini getirme hatası:", error);
      throw error;
    }
  },

  // Profil bilgilerini güncelle
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // /api/profile endpoint'i kullanılıyor
      const response = await apiClient.put<ProfileUpdateResponse>(
        "/api/profile",
        data
      );

      console.log("Profil bilgileri başarıyla güncellendi.");

      // response.data içinde data varsa onu, yoksa doğrudan response.data'yı kullan
      if (response.data && response.data.data) {
        return response.data.data;
      }

      // Eğer direkt UserProfile döndürüyorsa
      return response.data as unknown as UserProfile;
    } catch (error: any) {
      console.error("Profil güncelleme hatası:", error);
      throw error;
    }
  },

  // Avatar yükleme
  async uploadAvatar(imageUri: string): Promise<string> {
    try {
      console.log("Avatar yükleniyor...");

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

      // POST /api/profile/avatar endpoint'i kullanılıyor (resimdeki endpointe göre)
      const response = await apiClient.post("/api/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Avatar başarıyla yüklendi.", response.data);

      // Avatar URL'sini döndür (response yapısına göre)
      if (response.data && response.data.data && response.data.data.avatarUrl) {
        return response.data.data.avatarUrl;
      }

      return response.data.avatarUrl || response.data.data?.avatarUrl || "";
    } catch (error: any) {
      console.error("Avatar yükleme hatası:", error);
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
      console.log("Avatar siliniyor...");

      // DELETE /api/profile/avatar endpoint'i kullanılıyor (resimdeki endpointe göre)
      const response = await apiClient.delete("/api/profile/avatar");

      console.log("Avatar başarıyla silindi.", response.data);

      // Varsayılan URL'i de döndür
      const defaultAvatarUrl =
        response.data?.data?.avatarUrl || response.data?.avatarUrl;

      return {
        success: true,
        message: response.data?.message || "Avatar başarıyla silindi.",
        defaultAvatarUrl: defaultAvatarUrl,
      };
    } catch (error: any) {
      console.error("Avatar silme hatası:", error);
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
      // /api/profile/password endpoint'i kullanılıyor
      await apiClient.put("/api/profile/password", data);
      console.log("Şifre başarıyla değiştirildi.");
    } catch (error: any) {
      console.error("Şifre değiştirme hatası:", error);
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
      console.log("İlgi alanları (sporlar) getiriliyor...");
      // /api/profile/sports endpoint'i kullanılıyor
      const response = await apiClient.get("/api/profile/sports");

      if (response.data && response.data.data) {
        return response.data.data;
      }

      return response.data || [];
    } catch (error: any) {
      console.error("İlgi alanlarını getirme hatası:", error);
      return [];
    }
  },

  // Kullanıcının favori sporlarına yeni spor ekle
  async addSport(sportId: number): Promise<boolean> {
    try {
      console.log(`Favori sporlara ${sportId} ID'li spor ekleniyor...`);
      // /api/profile/sports endpoint'i kullanılıyor
      const response = await apiClient.post("/api/profile/sports", {
        sport_id: sportId,
      });

      console.log("Spor başarıyla eklendi.");
      return true;
    } catch (error: any) {
      console.error("Spor ekleme hatası:", error);
      return false;
    }
  },

  // Kullanıcının favori sporlarından bir sporu kaldır
  async removeSport(sportId: number): Promise<boolean> {
    try {
      console.log(`Favori sporlardan ${sportId} ID'li spor kaldırılıyor...`);
      // /api/profile/sports/{sportId} endpoint'i kullanılıyor
      const response = await apiClient.delete(`/api/profile/sports/${sportId}`);

      console.log("Spor başarıyla kaldırıldı.");
      return true;
    } catch (error: any) {
      console.error("Spor kaldırma hatası:", error);
      return false;
    }
  },

  // Kullanıcının favori sporlarını toplu güncelle
  async updateSportsBatch(sportIds: number[]): Promise<boolean> {
    try {
      console.log("Favori sporlar toplu olarak güncelleniyor...");
      // /api/profile/sports/batch endpoint'i kullanılıyor
      const response = await apiClient.post("/api/profile/sports/batch", {
        sport_ids: sportIds,
      });

      console.log("Sporlar başarıyla güncellendi.");
      return true;
    } catch (error: any) {
      console.error("Sporları toplu güncelleme hatası:", error);
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
