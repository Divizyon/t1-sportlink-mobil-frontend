import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Cake,
  Mail,
  MessageCircle,
  User as UserIcon,
  Clock,
  MapPin,
  Flag,
  X,
  Send,
} from "lucide-react-native";
import { usersApi } from "@/services/api/users";
import { friendshipsApi, Friend } from "@/services/api/friendships";

// Default profil resmi
const DEFAULT_PROFILE_IMAGE = "https://randomuser.me/api/portraits/lego/1.jpg";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture?: string;
  birthday_date?: string;
  bio?: string;
  address?: string;
  sports?: Array<{
    sport_id: number;
    sport: {
      id: number;
      name: string;
      icon: string;
      description: string;
    };
  }>;
  is_online?: boolean;
  last_seen_at?: string;
}

const UserProfileScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.id as string;

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [isPendingRequest, setIsPendingRequest] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  // Profil bilgilerini getirme
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userId) {
        throw new Error("Kullanıcı kimliği belirtilmemiş");
      }

      // Kullanıcı detaylarını getir
      const userData = await usersApi.getUserDetails(userId);

      if (!userData) {
        throw new Error("Kullanıcı bulunamadı");
      }

      console.log("Kullanıcı profil verileri:", userData);
      setUserProfile(userData);

      // Arkadaş durumunu kontrol et
      checkFriendshipStatus();
    } catch (err: any) {
      console.error("Kullanıcı profili yüklenirken hata:", err);
      setError(err.message || "Kullanıcı bilgileri yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Arkadaşlık durumunu kontrol etme
  const checkFriendshipStatus = async () => {
    try {
      const friends = await friendshipsApi.getFriends();

      // Kullanıcı arkadaş mı kontrol et
      const isUserFriend = friends.some(
        (friend: Friend) => friend.id === userId
      );
      setIsFriend(isUserFriend);

      // Bekleyen istek var mı kontrol et
      const outgoingRequests = await friendshipsApi.getOutgoingRequests();
      const hasPendingRequest = outgoingRequests.some(
        (request: any) => request.receiver_id === userId
      );
      setIsPendingRequest(hasPendingRequest);
    } catch (error) {
      console.error("Arkadaşlık durumu kontrolünde hata:", error);
    }
  };

  // Arkadaşlık isteği gönderme
  const handleSendFriendRequest = async () => {
    try {
      setButtonLoading(true);
      await friendshipsApi.sendRequest(userId);
      setIsPendingRequest(true);
      Alert.alert("Başarılı", "Arkadaşlık isteği gönderildi");
    } catch (error: any) {
      console.error("Arkadaşlık isteği gönderilirken hata:", error);
      Alert.alert("Hata", error.message || "Arkadaşlık isteği gönderilemedi");
    } finally {
      setButtonLoading(false);
    }
  };

  // Arkadaşlık isteğini iptal etme
  const handleCancelFriendRequest = async () => {
    try {
      setButtonLoading(true);
      // Önce mevcut istekleri getir, sonra iptal et
      const outgoingRequests = await friendshipsApi.getOutgoingRequests();
      const request = outgoingRequests.find(
        (req: any) => req.receiver_id === userId
      );

      if (request) {
        await friendshipsApi.cancelRequest(request.id);
        setIsPendingRequest(false);
        Alert.alert("Başarılı", "Arkadaşlık isteği iptal edildi");
      } else {
        setIsPendingRequest(false);
        Alert.alert("Bilgi", "İptal edilecek istek bulunamadı");
      }
    } catch (error: any) {
      console.error("Arkadaşlık isteği iptal edilirken hata:", error);
      Alert.alert("Hata", error.message || "Arkadaşlık isteği iptal edilemedi");
    } finally {
      setButtonLoading(false);
    }
  };

  // Mesaj gönderme
  const handleSendMessage = () => {
    if (!userProfile) return;

    router.push({
      pathname: `/messages/${userProfile.id}`,
      params: {
        name: `${userProfile.first_name} ${userProfile.last_name}`,
        avatar: userProfile.profile_picture,
        email: userProfile.email,
      },
    });
  };

  // Geri butonu
  const handleGoBack = () => {
    router.back();
  };

  // Yaş hesaplama
  const calculateAge = (birthDateStr: string): number => {
    if (!birthDateStr) return 0;

    const birthDate = new Date(birthDateStr);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // Son görülme zamanını formatla
  const formatLastSeen = (lastSeenDate: string): string => {
    try {
      const date = new Date(lastSeenDate);
      const now = new Date();
      const diff = now.getTime() - date.getTime();

      // 1 saat içinde
      if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} dakika önce`;
      }

      // 1 gün içinde
      if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} saat önce`;
      }

      // 1 hafta içinde
      if (diff < 604800000) {
        const days = Math.floor(diff / 86400000);
        return `${days} gün önce`;
      }

      // Tarihi döndür
      return date.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Bilinmiyor";
    }
  };

  // Raporlama modalını göster
  const handleShowReportModal = () => {
    setShowReportModal(true);
  };

  // Raporlama modalını kapat
  const handleCloseReportModal = () => {
    setShowReportModal(false);
    setReportReason("");
  };

  // Kullanıcıyı raporla
  const handleSubmitReport = async () => {
    if (!reportReason || reportReason.trim() === "") {
      Alert.alert("Uyarı", "Lütfen raporlama sebebini belirtin.");
      return;
    }

    try {
      setIsReporting(true);

      await usersApi.reportUser(userId, reportReason);

      setIsReporting(false);
      setShowReportModal(false);
      setReportReason("");

      Alert.alert(
        "Başarılı",
        "Raporunuz başarıyla gönderildi. İnceleme sonrası gerekli işlemler yapılacaktır.",
        [{ text: "Tamam" }]
      );
    } catch (error: any) {
      console.error("Kullanıcı raporlama hatası:", error);
      setIsReporting(false);

      // Hata mesajını göster
      const errorMessage =
        error.message ||
        "Raporlama sırasında bir sorun oluştu. Lütfen daha sonra tekrar deneyin.";

      Alert.alert("Hata", errorMessage);
    }
  };

  // Sayfa yüklendiğinde profil bilgilerini getir
  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  // Raporlama modalı
  const renderReportModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showReportModal}
        onRequestClose={handleCloseReportModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kullanıcıyı Raporla</Text>
              <TouchableOpacity onPress={handleCloseReportModal}>
                <X size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>
              Lütfen raporlama sebebini belirtin:
            </Text>

            <TextInput
              style={styles.reportInput}
              placeholder="Raporlama sebebinizi açıklayın..."
              value={reportReason}
              onChangeText={setReportReason}
              multiline
              numberOfLines={4}
              placeholderTextColor="#94A3B8"
              maxLength={500}
            />
            <Text style={styles.charCountText}>{reportReason.length}/500</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={handleCloseReportModal}
                disabled={isReporting}
              >
                <X size={18} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  (!reportReason || reportReason.trim() === "") && {
                    opacity: 0.5,
                  },
                ]}
                onPress={handleSubmitReport}
                disabled={
                  isReporting || !reportReason || reportReason.trim() === ""
                }
              >
                {isReporting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Send size={18} color="#FFFFFF" />
                    <Text style={styles.modalButtonText}>Gönder</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Başlık */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kullanıcı Profili</Text>
        <TouchableOpacity
          style={styles.reportButton}
          onPress={handleShowReportModal}
        >
          <Flag size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Profil yükleniyor...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchUserProfile}
          >
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : userProfile ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profil Bilgileri */}
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              {userProfile.profile_picture ? (
                <Image
                  source={{ uri: userProfile.profile_picture }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.defaultAvatarContainer}>
                  <UserIcon size={40} color="#666" />
                </View>
              )}
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>
                  {userProfile.first_name} {userProfile.last_name}
                </Text>

                <View style={styles.emailContainer}>
                  <Mail size={14} color="#7f8c8d" />
                  <Text style={styles.emailText}>
                    {userProfile.email || "Belirtilmemiş"}
                  </Text>
                </View>

                {userProfile.birthday_date && (
                  <View style={styles.ageContainer}>
                    <Cake size={14} color="#7f8c8d" />
                    <Text style={styles.ageText}>
                      {calculateAge(userProfile.birthday_date)} Yaşında
                    </Text>
                  </View>
                )}

                {userProfile.address && (
                  <View style={styles.locationContainer}>
                    <MapPin size={14} color="#7f8c8d" />
                    <Text style={styles.locationText}>
                      {userProfile.address}
                    </Text>
                  </View>
                )}

                {userProfile.is_online ? (
                  <View style={styles.onlineStatusContainer}>
                    <View
                      style={[styles.statusIndicator, styles.onlineIndicator]}
                    />
                    <Text style={styles.onlineStatusText}>Çevrimiçi</Text>
                  </View>
                ) : userProfile.last_seen_at ? (
                  <View style={styles.onlineStatusContainer}>
                    <Clock size={14} color="#7f8c8d" />
                    <Text style={styles.lastSeenText}>
                      {formatLastSeen(userProfile.last_seen_at)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Biyografi */}
            {userProfile.bio && (
              <View style={styles.biographyContainer}>
                <Text style={styles.biographyTitle}>Hakkında</Text>
                <Text style={styles.biographyText}>{userProfile.bio}</Text>
              </View>
            )}

            {/* Butonlar */}
            <View style={styles.buttonsContainer}>
              {isFriend ? (
                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={handleSendMessage}
                >
                  <MessageCircle size={18} color="#fff" />
                  <Text style={styles.buttonText}>Mesaj Gönder</Text>
                </TouchableOpacity>
              ) : isPendingRequest ? (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelFriendRequest}
                  disabled={buttonLoading}
                >
                  {buttonLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <ArrowLeft size={18} color="#fff" />
                      <Text style={styles.buttonText}>İsteği İptal Et</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.followButton}
                  onPress={handleSendFriendRequest}
                  disabled={buttonLoading}
                >
                  {buttonLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <UserIcon size={18} color="#fff" />
                      <Text style={styles.buttonText}>Takip Et</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {isFriend && (
                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={handleSendMessage}
                >
                  <MessageCircle size={18} color="#fff" />
                  <Text style={styles.buttonText}>Mesaj Gönder</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* İlgi Alanları */}
          {userProfile.sports && userProfile.sports.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>İlgi Alanları</Text>
              <View style={styles.interestsContainer}>
                {userProfile.sports.map((sportItem) => (
                  <View key={sportItem.sport_id} style={styles.interestTag}>
                    <Text style={styles.interestTagText}>
                      {sportItem.sport.icon} {sportItem.sport.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      ) : null}

      {/* Raporlama Modalı */}
      {renderReportModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },
  reportButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  profileSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 5,
  },
  ageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ageText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 5,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 5,
  },
  onlineStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineIndicator: {
    backgroundColor: "#2ecc71",
  },
  onlineStatusText: {
    fontSize: 14,
    color: "#2ecc71",
  },
  lastSeenText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 6,
  },
  biographyContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  biographyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  biographyText: {
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  interestsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  interestTag: {
    backgroundColor: "#f1f5f9",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  interestTagText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0f172a",
  },
  modalLabel: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 12,
  },
  reportInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    fontSize: 16,
    color: "#334155",
    minHeight: 120,
    textAlignVertical: "top",
  },
  charCountText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "right",
    marginTop: 4,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  modalCancelButton: {
    backgroundColor: "#ef4444",
    marginRight: 8,
  },
  submitButton: {
    backgroundColor: "#3b82f6",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default UserProfileScreen;
