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

      // URL düzeltildi
      const response = await apiClient.get<ProfileResponse>("/profile");

      console.log("URL düzeltildi: /profile");
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
      const response = await apiClient.put<ProfileUpdateResponse>(
        "/profile",
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

      // Özel headers ile istek gönder
      const response = await apiClient.post("/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Avatar başarıyla yüklendi.");

      // Avatar URL'sini döndür
      if (response.data && response.data.data && response.data.data.avatar) {
        return response.data.data.avatar;
      }

      return response.data.avatar || "";
    } catch (error: any) {
      console.error("Avatar yükleme hatası:", error);
      throw error;
    }
  },

  // Avatar silme
  async deleteAvatar(): Promise<void> {
    try {
      console.log("Avatar siliniyor...");

      await apiClient.delete("/profile/avatar");

      console.log("Avatar başarıyla silindi.");
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
      await apiClient.put("/profile/password", data);
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
      const response = await apiClient.get("/profile/sports");

      if (response.data && response.data.data) {
        return response.data.data;
      }

      return response.data || [];
    } catch (error: any) {
      console.error("İlgi alanlarını getirme hatası:", error);
      return [];
    }
  },

  // Hesabı dondurma
  async freezeAccount(): Promise<{success: boolean; message: string}> {
    try {
      console.log("Hesap dondurma işlemi başlatılıyor...");

      const response = await apiClient.post("/users/account/freeze");
      
      console.log("Hesap dondurma yanıtı:", response.data);
      
      return {
        success: true,
        message: response.data?.message || "Hesabınız başarıyla donduruldu."
      };
    } catch (error: any) {
      console.error("Hesap dondurma hatası:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Hesap dondurma işlemi sırasında bir hata oluştu."
      };
    }
  },

  // Hesabı silme
  async deleteAccount(): Promise<{success: boolean; message: string}> {
    try {
      console.log("Hesap silme işlemi başlatılıyor...");

      const response = await apiClient.post("/users/account/delete");
      
      console.log("Hesap silme yanıtı:", response.data);
      
      return {
        success: true,
        message: response.data?.message || "Hesabınız başarıyla silindi."
      };
    } catch (error: any) {
      console.error("Hesap silme hatası:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Hesap silme işlemi sırasında bir hata oluştu."
      };
    }
  }
};

export default profileService;
