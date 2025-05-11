import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Clock, X } from "lucide-react-native";
import profileService from "@/src/api/profileService";
import { useAuth } from "@/src/store/AuthContext";

interface AccountSettingsProps {
  onClose: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ onClose }) => {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Hesabı dondurma işlemi
  const handleFreezeAccount = async () => {
    // Kullanıcıya onay soruluyor
    Alert.alert(
      "Hesabı Dondurma",
      "Hesabınızı dondurmak istediğinize emin misiniz? Hesabınız 30 gün içinde giriş yapmazsanız devre dışı bırakılacaktır.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Evet, Dondur",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              const result = await profileService.freezeAccount();
              
              setIsLoading(false);
              
              if (result.success) {
                Alert.alert(
                  "Başarılı",
                  result.message,
                  [
                    {
                      text: "Tamam",
                      onPress: () => {
                        logout();
                        onClose();
                      },
                    },
                  ]
                );
              } else {
                Alert.alert("Hata", result.message);
              }
            } catch (error: any) {
              setIsLoading(false);
              Alert.alert(
                "Hata",
                "Hesap dondurma işlemi sırasında bir hata oluştu."
              );
              console.error("Hesap dondurma hatası:", error);
            }
          },
        },
      ]
    );
  };

  // Hesabı silme işlemi
  const handleDeleteAccount = async () => {
    // Kullanıcıya onay soruluyor
    Alert.alert(
      "Hesabı Silme",
      "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve tüm verileriniz kaybolabilir.",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Evet, Sil",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              const result = await profileService.deleteAccount();
              
              setIsLoading(false);
              
              if (result.success) {
                Alert.alert(
                  "Başarılı",
                  result.message,
                  [
                    {
                      text: "Tamam",
                      onPress: () => {
                        logout();
                        onClose();
                      },
                    },
                  ]
                );
              } else {
                Alert.alert("Hata", result.message);
              }
            } catch (error: any) {
              setIsLoading(false);
              Alert.alert(
                "Hata",
                "Hesap silme işlemi sırasında bir hata oluştu."
              );
              console.error("Hesap silme hatası:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hesap Ayarları</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2ecc71" />
          <Text style={styles.loadingText}>İşlem gerçekleştiriliyor...</Text>
        </View>
      ) : (
        <View style={styles.settingsContainer}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleFreezeAccount}
          >
            <View style={styles.settingIconContainer}>
              <Clock size={22} color="#f39c12" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Hesabı Dondurma</Text>
              <Text style={styles.settingDescription}>
                Hesabınızı geçici olarak askıya alın
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleDeleteAccount}
          >
            <View style={[styles.settingIconContainer, styles.deleteIcon]}>
              <X size={22} color="#e74c3c" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingTitle, styles.deleteText]}>
                Hesabı Silme
              </Text>
              <Text style={styles.settingDescription}>
                Hesabınızı ve tüm verilerinizi kalıcı olarak silin
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  settingsContainer: {
    padding: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 16,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff3cd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  deleteIcon: {
    backgroundColor: "#fee2e2",
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  deleteText: {
    color: "#e74c3c",
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});

export default AccountSettings; 