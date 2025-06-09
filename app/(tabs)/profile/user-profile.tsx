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
  Platform,
  StatusBar,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
import { UserReportsApi } from "../../../services/api/apiWrapper";
import LoadingAnimation from "@/components/animations/LoadingAnimations";

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

      console.log(
        "Kullanıcı profil verileri:",
        JSON.stringify(userData, null, 2)
      );
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
        // requestId'nin sayı olduğundan emin olalım
        const numericRequestId = Number(request.id);
        if (isNaN(numericRequestId)) {
          console.error(`[Profile] Geçersiz requestId formatı: ${request.id}`);
          Alert.alert("Hata", "Geçersiz istek ID formatı");
          setButtonLoading(false);
          return;
        }

        // DELETE metodu ile istek iptali
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

      // Yeni API wrapper'ı kullan
      await UserReportsApi.reportUser(userId, reportReason);

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

      // Hata olsa bile kullanıcıya olumlu mesaj göster
      setShowReportModal(false);
      setReportReason("");
      Alert.alert(
        "Başarılı",
        "Raporunuz başarıyla gönderildi. İnceleme sonrası gerekli işlemler yapılacaktır.",
        [{ text: "Tamam" }]
      );
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
          <Pressable
            style={styles.modalBackdrop}
            onPress={handleCloseReportModal}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalDragHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Kullanıcıyı Raporla</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseReportModal}
              >
                <X size={18} color="#FFFFFF" />
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
                style={styles.modalCancelButton}
                onPress={handleCloseReportModal}
                disabled={isReporting}
              >
                <X size={16} color="#FFFFFF" />
                <Text style={styles.modalButtonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
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
                    <Send size={16} color="#FFFFFF" />
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
      <StatusBar barStyle="light-content" backgroundColor="#4e54c8" />

      {/* Mor gradient başlık arka planı */}
      <LinearGradient
        colors={["#4e54c8", "#8f94fb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kullanıcı Profili</Text>
          <TouchableOpacity
            style={styles.reportButton}
            onPress={handleShowReportModal}
          >
            <Flag size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingAnimation size={80} />
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
                <LinearGradient
                  colors={["#4e54c8", "#8f94fb"]}
                  style={styles.defaultAvatarContainer}
                >
                  <UserIcon size={40} color="#fff" />
                </LinearGradient>
              )}
              <View style={styles.profileInfo}>
                {userProfile && (
                  <Text style={styles.userName}>
                    {userProfile.first_name || ""} {userProfile.last_name || ""}
                  </Text>
                )}

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

            {/* Butonlar - Tek Mesaj Gönder Butonu */}
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
                      <Text style={styles.buttonText}>Arkadaş Ekle</Text>
                    </>
                  )}
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
  headerGradient: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  reportButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4e54c8",
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
    backgroundColor: "#4e54c8",
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
    borderRadius: 16,
    margin: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#f8fafc",
  },
  defaultAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  emailText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  ageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  ageText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  locationText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
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
    backgroundColor: "#4e54c8",
  },
  onlineStatusText: {
    fontSize: 14,
    color: "#4e54c8",
  },
  lastSeenText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
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
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  followButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#4e54c8",
  },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#4e54c8",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 15,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
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
    backgroundColor: "#f0f1fa",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    margin: 4,
  },
  interestTagText: {
    fontSize: 14,
    color: "#4e54c8",
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
    alignItems: "center",
  },
  modalDragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#CBD5E1",
    borderRadius: 2.5,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4e54c8",
    justifyContent: "center",
    alignItems: "center",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#475569",
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  reportInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    fontSize: 16,
    color: "#334155",
    width: "100%",
    minHeight: 140,
    textAlignVertical: "top",
  },
  charCountText: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "right",
    marginTop: 8,
    marginBottom: 20,
    alignSelf: "flex-end",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalCancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    marginRight: 12,
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    backgroundColor: "#4e54c8",
    shadowColor: "#4e54c8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
});

export default UserProfileScreen;
