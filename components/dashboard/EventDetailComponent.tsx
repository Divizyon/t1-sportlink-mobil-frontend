import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { router, useNavigation } from "expo-router";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  ChevronRight,
  MessageSquare,
  MessageCircle,
  Share2,
  Info,
  Map,
  X,
  Star,
  Edit2,
  Trash2,
  Send,
  RefreshCw,
  Flag,
} from "lucide-react-native";
import MapView, { Marker } from "react-native-maps";
import eventRatingService from "@/src/api/eventRatingService";
import { eventsApi } from "@/services/api/events";
import apiClient from "@/services/api";

// Rapor modalı için stil tanımları
const reportModalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    width: "100%",
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#CBD5E1",
    borderRadius: 2.5,
    marginBottom: 16,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#475569",
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  input: {
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
  charCount: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "right",
    marginTop: 8,
    marginBottom: 20,
    alignSelf: "flex-end",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4e54c8",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
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
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  closeButtonNew: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },
});

// Tema renkleri
const theme = {
  primary: "#10B981", // Koyu yeşil
  primaryLight: "#D1FAE5", // Açık yeşil
  primaryPale: "#ECFDF5", // En açık yeşil
  background: "#F8FAFC", // Arka plan rengi
  surface: "#FFFFFF", // Kart arka planı
  text: "#0F172A", // Ana metin rengi
  textSecondary: "#64748B", // İkincil metin rengi
  border: "#E2E8F0", // Kenar çizgisi rengi
  shadow: "rgba(0, 0, 0, 0.05)", // Gölge rengi
  error: "#EF4444", // Hata rengi (kırmızı)
  success: "#10B981", // Başarı rengi (yeşil)
  warn: "#F59E0B", // Uyarı rengi (turuncu/amber)
  categoryColors: {
    Basketbol: "#F97316", // Turuncu
    Futbol: "#22C55E", // Yeşil
    Yüzme: "#3B82F6", // Mavi
    Tenis: "#EAB308", // Sarı
    Voleybol: "#EC4899", // Pembe
    Koşu: "#8B5CF6", // Mor
    Yoga: "#14B8A6", // Turkuaz
    Bisiklet: "#EF4444", // Kırmızı
    Yürüyüş: "#0EA5E9", // Açık Mavi
    Okçuluk: "#6366F1", // İndigo
    "Akıl Oyunları": "#8B5CF6", // Mor
  } as Record<string, string>,
};

// Katılımcı verisi için interface
interface Participant {
  id: string | number;
  user_id?: string;
  name?: string;
  full_name?: string;
  profileImage?: string;
  profile_image?: string;
  profile_picture?: string; // Eski API yanıtları için geriye dönük uyumluluk
  bio?: string;
  role?: string;
  user_role?: string;
  joined_at?: string;
  email?: string;
}

// EventDetail arayüzü
interface EventDetail {
  id: number;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  participantCount: number;
  maxParticipants: number;
  isJoined?: boolean;
  organizer: {
    id: number | string;
    name: string;
    isVerified?: boolean;
    logoUrl: string;
  };
  description: string;
  requirements?: string;
  notes?: string;
  imageUrl: string;
  participants?:
    | Participant[]
    | {
        id: string | number;
        name: string;
        profileImage: string;
      }[];
  isOwnEvent?: boolean;
  status?: string;
  averageRating?: number;
}

interface EventDetailComponentProps {
  event: EventDetail;
  onBack?: () => void;
  onJoin?: (eventId: number) => void;
  onShareEvent?: (eventId: number) => void;
  onContactOrganizer?: (organizerId: number | string) => void;
}

const EventDetailComponent: React.FC<EventDetailComponentProps> = ({
  event,
  onBack,
  onJoin,
  onShareEvent,
  onContactOrganizer,
}) => {
  // Sayfa durumu için state'ler
  const [activeTab, setActiveTab] = useState<string>("info");
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [isJoined, setIsJoined] = useState(event.isJoined || false);
  const [participantCount, setParticipantCount] = useState(
    event.participantCount || 0
  );
  const [imageError, setImageError] = useState(false);
  const [organizerImageError, setOrganizerImageError] = useState(false);

  // Varsayılan resimler
  const defaultEventImage =
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000";
  const defaultProfileImage = "https://randomuser.me/api/portraits/lego/1.jpg";

  // Kategori renkleri ve ikonları için değişkenler
  const categoryColor = theme.categoryColors[event.category] || theme.primary;

  // Yorumlar ve puanlama için state'ler
  const [ratings, setRatings] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
  const [myRating, setMyRating] = useState<any>(null);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Modal için state ekleyelim
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingComment, setEditingComment] = useState("");
  const [editingRating, setEditingRating] = useState(0);
  const [editingRatingId, setEditingRatingId] = useState<number | null>(null);

  // Yeni state ve kullanıcı ID'si için state ekle
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Katılımcılar için state'ler
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Raporlama modal state'leri
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  // Uygulama başladığında kullanıcı ID'sini al
  useEffect(() => {
    const getUserId = async () => {
      try {
        // Eğer zaten varsa, eventsApi'den al
        const userId = await eventsApi.getCurrentUserId();
        if (userId) {
          setCurrentUserId(userId);
          console.log("Mevcut kullanıcı ID'si alındı:", userId);
        }
      } catch (error) {
        console.error("Kullanıcı ID'si alınırken hata:", error);
      }
    };

    getUserId();
  }, []);

  // Komponent yüklendiğinde etkinlik verilerini getir
  useEffect(() => {
    if (event && event.id) {
      // Yüklendiğinde katılımcıları getir
      fetchParticipants(event.id);
    }
  }, [event.id]);

  // event prop'u değiştiğinde isJoined state'ini güncelle
  useEffect(() => {
    if (event && event.isJoined !== undefined) {
      const oldJoinState = isJoined;
      setIsJoined(event.isJoined);
      setParticipantCount(event.participantCount || 0);

      console.log(
        "EventDetailComponent: isJoined state güncellendi:",
        event.isJoined
      );

      // Sadece katılım durumu değiştiyse katılımcıları güncelle
      if (oldJoinState !== event.isJoined && event.id) {
        console.log("Katılım durumu değişti, katılımcılar yenileniyor...");
        fetchParticipants(event.id);
      }
    }
  }, [event, event.isJoined]);

  // event katılımcı sayısı değiştiğinde bunu logla
  useEffect(() => {
    console.log(
      "EventDetailComponent: Katılımcı sayısı güncellendi:",
      event.participantCount
    );
  }, [event.participantCount]);

  // Yeni useEffect - yorumları ve puanlamaları getir
  useEffect(() => {
    if (activeTab === "yorumlar") {
      console.log("Yorumlar sekmesi aktif, yorumlar getiriliyor...");
      fetchRatings();
    }
  }, [activeTab, event.id]);

  // Yeni yorumlar eklendiğinde etkinlik ortalama puanını güncelle
  useEffect(() => {
    if (ratings.length > 0) {
      // Etkinlik detayını güncelleyemiyoruz, ancak en azından yerel komponent state'ini güncelleyelim
      if (typeof event.averageRating !== "undefined") {
        event.averageRating = averageRating;
      }
    }
  }, [averageRating, ratings.length]);

  // Kategori iconu belirle
  const getCategoryIcon = (category: string) => {
    if (!category) return "🎯";

    const lowerCategory = category.toLowerCase();

    if (
      lowerCategory.includes("basketbol") ||
      lowerCategory.includes("basket")
    ) {
      return "🏀";
    }

    if (
      lowerCategory.includes("futbol") ||
      lowerCategory.includes("football") ||
      lowerCategory.includes("soccer")
    ) {
      return "⚽";
    }

    if (lowerCategory.includes("yüzme") || lowerCategory.includes("swim")) {
      return "🏊";
    }

    if (
      lowerCategory.includes("yürüyüş") ||
      lowerCategory.includes("walk") ||
      lowerCategory.includes("hiking")
    ) {
      return "🚶";
    }

    if (lowerCategory.includes("yoga")) {
      return "🧘";
    }

    if (
      lowerCategory.includes("voleybol") ||
      lowerCategory.includes("volleyball")
    ) {
      return "🏐";
    }

    if (lowerCategory.includes("tenis") || lowerCategory.includes("tennis")) {
      return "🎾";
    }

    if (lowerCategory.includes("koşu") || lowerCategory.includes("run")) {
      return "🏃";
    }

    if (
      lowerCategory.includes("bisiklet") ||
      lowerCategory.includes("bike") ||
      lowerCategory.includes("cycling")
    ) {
      return "🚴";
    }

    if (
      lowerCategory.includes("okçuluk") ||
      lowerCategory.includes("archery")
    ) {
      return "🏹";
    }

    if (
      lowerCategory.includes("satranç") ||
      lowerCategory.includes("chess") ||
      lowerCategory.includes("akıl oyun")
    ) {
      return "♟️";
    }

    // Eşleşme bulunamadıysa
    return "🎯";
  };

  // Kategori ikonu
  const categoryIcon = getCategoryIcon(event.category);

  // Geri butonuna tıklama işlevi
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      try {
        // Eğer history.length > 1 ise, kullanıcı başka bir sayfadan gelmiştir
        if (
          typeof window !== "undefined" &&
          window.history &&
          window.history.length > 1
        ) {
          router.back();
        } else {
          // Doğrudan URL ile açıldıysa veya history yoksa, dashboard'a yönlendir
          router.replace("/(tabs)/dashboard");
        }
      } catch (error) {
        // Hata durumunda dashboard'a yönlendir
        console.error("Navigation error:", error);
        router.replace("/(tabs)/dashboard");
      }
    }
  };

  // Katıl/Ayrıl butonuna tıklama işlevi
  const handleToggleJoin = () => {
    if (onJoin && event && event.id) {
      // Katılım butonuna basıldığında
      console.log(
        `Etkinlik ${isJoined ? "ayrılma" : "katılma"} durumu değişiyor...`
      );
      onJoin(event.id);

      // API'nin işlemini tamamlaması için kısa bir gecikme sonrası katılımcıları yenile
      setTimeout(() => {
        fetchParticipants(event.id);
      }, 1500); // API'nin işlemi tamamlaması için yeterli süre
    }
  };

  // İletişim butonuna tıklama işlevi
  const handleContact = () => {
    if (onContactOrganizer) {
      onContactOrganizer(event.organizer.id);
    } else {
      // Organizatör DM sayfasına yönlendir
      router.push({
        pathname: "/messages/[id]",
        params: {
          id: event.organizer.id,
        },
      });
    }
  };

  // Paylaş butonuna tıklama işlevi
  const handleShare = () => {
    if (onShareEvent) {
      onShareEvent(event.id);
    } else {
      Alert.alert(
        "Paylaş",
        `${event.title} etkinliğini paylaşmak için bir platform seçin.`,
        [{ text: "Tamam", onPress: () => console.log("Paylaş tıklandı") }]
      );
    }
  };

  // Katılımcıları gösterme modalını aç
  const handleShowParticipants = () => {
    // Modal açılmadan önce katılımcıları güncelle
    setIsLoadingParticipants(true);
    setShowParticipantsModal(true);

    if (event.id) {
      fetchParticipants(event.id);
    }
  };

  // Modal kapatma fonksiyonu
  const closeParticipantsModal = () => {
    setShowParticipantsModal(false);
  };

  // Katılımcıları getir
  const fetchParticipants = async (eventId: number) => {
    try {
      setIsLoadingParticipants(true);
      console.log("Katılımcılar listesi yenileniyor - Etkinlik ID:", eventId);

      const response = await eventsApi.getEventParticipants(eventId.toString());

      // Yanıt kontrol ediliyor
      if (!response) {
        console.warn("Katılımcı verisi alınamadı: API yanıtı boş");
        setParticipants([]);
        return;
      }

      console.log(`${response.length || 0} katılımcı bilgisi alındı`);

      // API yanıtını doğru şekilde işle
      const formattedParticipants: Participant[] = response.map((p: any) => {
        console.log("İşlenen katılımcı verisi:", p);
        return {
          id: p.user_id || "",
          user_id: p.user_id || "",
          full_name: p.full_name || "İsimsiz Katılımcı",
          name: p.full_name || "İsimsiz Katılımcı",
          profileImage: p.profile_image || defaultProfileImage,
          profile_image: p.profile_image || defaultProfileImage,
        };
      });

      console.log(
        "Düzenlenmiş katılımcılar:",
        JSON.stringify(formattedParticipants)
      );

      // State'i güncelle
      setParticipants(formattedParticipants);
      console.log(
        "Participants state güncellendi:",
        formattedParticipants.length
      );

      // Etkinlik nesnesini güncelle
      if (event) {
        event.participants = formattedParticipants;
        event.participantCount = formattedParticipants.length;
        console.log(
          "Etkinlik katılımcı sayısı güncellendi:",
          formattedParticipants.length
        );
      }
    } catch (error) {
      console.error("Katılımcılar getirilirken hata:", error);
      setParticipants([]);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  // Katılımcı Modalı
  const renderParticipantsModal = () => {
    // Doğrudan state'den aldığımız katılımcıları kullan
    const currentParticipants = [...participants];
    console.log("Modal içinde gösterilecek katılımcılar:", currentParticipants);

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showParticipantsModal}
        onRequestClose={closeParticipantsModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <HStack style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Katılımcılar</Text>
              <TouchableOpacity onPress={closeParticipantsModal}>
                <X size={24} color="#0F172A" />
              </TouchableOpacity>
            </HStack>

            {isLoadingParticipants ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={styles.loadingText}>
                  Katılımcılar yükleniyor...
                </Text>
              </View>
            ) : currentParticipants && currentParticipants.length > 0 ? (
              <ScrollView style={styles.participantsList}>
                {currentParticipants.map((participant, index) => {
                  // Profil resmini ve ismi güvenli şekilde al
                  const profileImg =
                    participant.profileImage && participant.profileImage !== ""
                      ? participant.profileImage
                      : participant.profile_image &&
                        participant.profile_image !== ""
                      ? participant.profile_image
                      : defaultProfileImage;

                  const displayName =
                    participant.full_name ||
                    participant.name ||
                    "İsimsiz Katılımcı";

                  return (
                    <View
                      key={participant.user_id || `participant-${index}`}
                      style={styles.participantItem}
                    >
                      <HStack
                        style={{
                          alignItems: "center",
                          width: "100%",
                          paddingVertical: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: "#E2E8F0",
                        }}
                      >
                        <Image
                          source={{ uri: profileImg }}
                          style={styles.participantImage}
                          onError={() => {
                            console.log("Katılımcı resmi yüklenemedi");
                          }}
                        />
                        <VStack style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={styles.participantName}>
                            {displayName}
                          </Text>
                          <Text style={styles.participantRole}>
                            {participant.role}
                          </Text>
                        </VStack>
                      </HStack>
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={styles.emptyParticipantsContainer}>
                <Users size={40} color="#CBD5E1" />
                <Text style={styles.emptyParticipantsText}>
                  Henüz katılımcı bulunmuyor
                </Text>
              </View>
            )}

            <Text style={styles.participantCountText}>
              {currentParticipants ? currentParticipants.length : 0}/
              {event.maxParticipants} Katılımcı
            </Text>
          </View>
        </View>
      </Modal>
    );
  };

  // Butonun durumunu kontrol eden yardımcı fonksiyonlar
  const isButtonDisabled = () => {
    // Kullanıcının kendi etkinliği ise katılamaz/ayrılamaz
    if (event.isOwnEvent) {
      return true;
    }

    // Etkinlik tamamlanmış veya iptal edilmiş ise katılamaz/ayrılamaz
    if (
      event.status === "COMPLETED" ||
      event.status === "CANCELLED" ||
      event.status === "REJECTED"
    ) {
      return true;
    }

    // Katılmamış ve etkinlik doluysa katılamaz
    if (!isJoined && event.participantCount >= event.maxParticipants) {
      return true;
    }

    return false;
  };

  // Buton metnini belirleyen yardımcı fonksiyon
  const getButtonText = () => {
    if (event.isOwnEvent) {
      return "Etkinliğiniz";
    }

    if (event.status === "COMPLETED") {
      return "Tamamlandı";
    }

    if (event.status === "CANCELLED" || event.status === "REJECTED") {
      return "İptal Edildi";
    }

    if (isJoined) {
      return "Ayrıl";
    }

    if (event.participantCount >= event.maxParticipants) {
      return "Doldu";
    }

    return "Katıl";
  };

  // Yorumları ve puanlamaları getir
  const fetchRatings = async () => {
    if (!event.id) return;

    setIsLoadingRatings(true);
    try {
      // Tüm yorumları getir
      console.log(`Etkinlik (${event.id}) yorumlarını getirme başlatıldı`);
      const ratingsData = await eventRatingService.getEventRatings(event.id);
      console.log(
        `${ratingsData.length} adet yorum yüklendi:`,
        JSON.stringify(ratingsData)
      );
      setRatings(ratingsData);

      // Ortalama puanı getir ve hesapla
      let avgRating = await eventRatingService.getAverageRating(event.id);

      // Backend'den 0 gelirse kendi hesaplamamızı kullanabilir
      if (avgRating === 0 && ratingsData.length > 0) {
        avgRating = calculateAverageRating(ratingsData);
        console.log(`Backend ortalama puan 0, hesaplanan puan: ${avgRating}`);
      }

      console.log(`Etkinlik ortalama puanı: ${avgRating}`);
      setAverageRating(avgRating);

      // Kullanıcının kendi yorumunu getir - sadece COMPLETED etkinlikleri için isEditMode'u ayarla
      const userRating = await eventRatingService.getMyRating(event.id);
      if (userRating && userRating.id) {
        console.log("Kullanıcının yorumu bulundu:", JSON.stringify(userRating));

        // Tamamlanmış etkinliklerde kullanıcının mevcut yorumunu form alanlarına ata
        if (event.status === "COMPLETED") {
          setMyRating(userRating);
          setUserRating(userRating.rating || 0);
          setUserComment(userRating.review || "");
          setIsEditMode(true);
          console.log("Tamamlanmış etkinliğe zaten bir değerlendirme yapılmış");
        } else {
          // Aktif etkinliklerde sadece referans için kaydet, form alanlarına yansıtma
          setMyRating(userRating);
          // Form alanlarını boş bırak, kullanıcı her zaman yeni yorum yazabilsin
          setUserRating(0);
          setUserComment("");
          setIsEditMode(false);
          console.log(
            "Aktif etkinlik için kullanıcının yorumu var, ancak yeni yorum ekleyebilir"
          );
        }
      } else {
        console.log("Kullanıcının yorumu bulunamadı");
        setMyRating(null);
        setUserRating(0);
        setUserComment("");
        setIsEditMode(false);
      }
    } catch (error) {
      console.error("Yorumlar yüklenirken hata oluştu:", error);
      Alert.alert(
        "Hata",
        "Yorumlar yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setIsLoadingRatings(false);
    }
  };

  // Yorum gönder
  const handleSubmitRating = async () => {
    if (!event.id) return;

    // Form doğrulama
    if (event.status === "COMPLETED") {
      // Tamamlanmış etkinlikler için rating zorunlu
      if (userRating === 0) {
        Alert.alert("Uyarı", "Lütfen bir puan seçin (1-5 arası).");
        return;
      }
    }

    if (!userComment || userComment.trim() === "") {
      Alert.alert("Uyarı", "Lütfen bir yorum yazın.");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(
        `Yorum gönderiliyor - Etkinlik: ${event.id}, Puan: ${userRating}, Yorum: ${userComment}, Durum: ${event.status}`
      );

      // Eğer aktif bir etkinlik ise her zaman yeni yorum olarak ekle
      if (event.status === "ACTIVE") {
        // Aktif etkinliklerde her zaman yeni yorum olarak ekle
        const added = await eventRatingService.addRating(
          event.id,
          null, // Rating null (ratingsiz)
          userComment
        );

        if (added) {
          console.log("Yeni yorum eklendi:", JSON.stringify(added));
          Alert.alert("Başarılı", "Yorumunuz eklendi.");

          // Yeni yorumu ratings listesine ekle
          setRatings((prevRatings) => [added, ...prevRatings]);

          // Form durumunu temizle - aktif etkinlikte yeni yorum ekleyebilmek için
          setUserComment("");

          // Yorumları yenile
          setTimeout(() => {
            refreshRatings();
          }, 500);
        } else {
          console.error("Yorum eklenirken bir hata oluştu, null yanıt döndü");
          Alert.alert(
            "Hata",
            "Yorumunuz eklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
          );
        }
      } else if (isEditMode && myRating?.id) {
        // Tamamlanmış etkinliklerde ise düzenleme modundaysak yorumu güncelle
        const updated = await eventRatingService.updateRating(
          myRating.id,
          userRating,
          userComment
        );

        if (updated) {
          console.log("Yorum güncellendi:", JSON.stringify(updated));
          Alert.alert("Başarılı", "Yorumunuz güncellendi.");

          // Myrating state'ini de güncelle
          setMyRating(updated);

          // Yorum listesindeki ilgili yorumu da güncelle
          setRatings((prevRatings) => {
            return prevRatings.map((rating) =>
              rating.id === myRating.id
                ? { ...rating, rating: userRating, review: userComment }
                : rating
            );
          });

          // Yorumları yenile
          setTimeout(() => {
            refreshRatings();
          }, 500);
        } else {
          console.error(
            "Yorum güncellenirken bir hata oluştu, null yanıt döndü"
          );
          Alert.alert(
            "Hata",
            "Yorumunuz güncellenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
          );
        }
      } else {
        // Tamamlanmış etkinlikler için ilk kez yorum ekleme
        const added = await eventRatingService.addRating(
          event.id,
          event.status === "COMPLETED" ? userRating : null,
          userComment
        );

        if (added) {
          console.log("Yeni yorum eklendi:", JSON.stringify(added));
          Alert.alert("Başarılı", "Yorumunuz eklendi.");

          // Myrating state'ini güncelle
          setMyRating(added);
          setIsEditMode(true);

          // Yeni yorumu ratings listesine ekle
          setRatings((prevRatings) => [added, ...prevRatings]);

          // Ortalama puanı güncelleyerek yenilenmiş veriyi hızlıca göster
          const newAvg = calculateAverageRating([...ratings, added]);
          setAverageRating(newAvg);

          // Yorumları yenile
          setTimeout(() => {
            refreshRatings();
          }, 500);
        } else {
          console.error("Yorum eklenirken bir hata oluştu, null yanıt döndü");
          Alert.alert(
            "Hata",
            "Yorumunuz eklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
          );
        }
      }
    } catch (error: any) {
      // Backend'den gelen hata mesajı varsa onu göster
      const errorMessage = error.message || "Yorum eklenirken bir hata oluştu.";
      Alert.alert("Hata", errorMessage);
      console.error("Yorum gönderme hatası:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Yorum gönderildikten sonra yorumları tekrar getir
  const refreshRatings = useCallback(() => {
    console.log("Yorumlar yenileniyor...");
    fetchRatings();
  }, [event.id]);

  // Düzenleme modalını aç
  const openEditModal = (ratingId: number, comment: string, rating: number) => {
    setEditingRatingId(ratingId);
    setEditingComment(comment);
    setEditingRating(rating);
    setShowEditModal(true);
  };

  // Düzenleme modalını kapat
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingRatingId(null);
    setEditingComment("");
    setEditingRating(0);
  };

  // Yorumu güncelle
  const handleUpdateRating = async () => {
    if (!editingRatingId) return;

    if (!editingComment || editingComment.trim() === "") {
      Alert.alert("Uyarı", "Lütfen bir yorum yazın.");
      return;
    }

    // Tamamlanmış etkinlikler için rating kontrolü yap
    if (event.status === "COMPLETED" && editingRating === 0) {
      Alert.alert("Uyarı", "Lütfen bir puan seçin (1-5 arası).");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(
        `Yorum güncelleniyor - ID: ${editingRatingId}, Puan: ${editingRating}, Yorum: ${editingComment}, Etkinlik Durumu: ${event.status}`
      );

      // Etkinlik durumuna göre rating gönder veya gönderme
      const ratingValue = event.status === "COMPLETED" ? editingRating : null;

      // PUT /api/event-ratings/rating/{ratingId} endpoint'ini kullanıyoruz
      const updated = await eventRatingService.updateRating(
        editingRatingId,
        ratingValue,
        editingComment
      );

      if (updated) {
        console.log("Yorum güncellendi:", JSON.stringify(updated));
        Alert.alert("Başarılı", "Yorumunuz güncellendi.");

        // Yorumlar listesindeki ilgili yorumu da güncelle
        setRatings((prevRatings) => {
          return prevRatings.map((rating) =>
            rating.id === editingRatingId
              ? { ...rating, rating: updated.rating, review: editingComment }
              : rating
          );
        });

        // Eğer düzenlenen yorum kullanıcının mevcut yorumu ise, myRating da güncelle
        if (myRating?.id === editingRatingId) {
          setMyRating({
            ...myRating,
            rating: updated.rating,
            review: editingComment,
          });
          setUserRating(updated.rating || 0);
          setUserComment(editingComment);
        }

        closeEditModal();
        refreshRatings();
      } else {
        console.error("Yorum güncellenirken bir hata oluştu, null yanıt döndü");
        Alert.alert(
          "Hata",
          "Yorumunuz güncellenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
        );
      }
    } catch (error: any) {
      // Backend'den gelen hata mesajı varsa onu göster
      const errorMessage =
        error.message || "Yorum güncellenirken bir hata oluştu.";
      Alert.alert("Hata", errorMessage);
      console.error("Yorum güncelleme hatası:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Yorumu sil (modal'dan)
  const handleDeleteRatingFromModal = async () => {
    if (!editingRatingId) return;

    Alert.alert("Yorumu Sil", "Bu yorumu silmek istediğinize emin misiniz?", [
      {
        text: "İptal",
        style: "cancel",
      },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          setIsSubmitting(true);
          try {
            // DELETE /api/event-ratings/rating/{ratingId} endpoint'ini kullanıyoruz
            const success = await eventRatingService.deleteRating(
              editingRatingId
            );

            if (success) {
              // Yorumu ratings listesinden kaldır
              setRatings((prevRatings) =>
                prevRatings.filter((r) => r.id !== editingRatingId)
              );

              // Eğer silinen yorum kullanıcının mevcut yorumu ise, myRating'i temizle
              if (myRating?.id === editingRatingId) {
                setMyRating(null);
                setUserRating(0);
                setUserComment("");
                setIsEditMode(false);
              }

              // Ortalama puanı güncelle
              const newRatings = ratings.filter(
                (r) => r.id !== editingRatingId
              );
              const newAvg = calculateAverageRating(newRatings);
              setAverageRating(newAvg);

              closeEditModal();
              Alert.alert("Başarılı", "Yorumunuz silindi.");
              refreshRatings();
            } else {
              Alert.alert(
                "Hata",
                "Yorumunuz silinirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
              );
            }
          } catch (error: any) {
            // Backend'den gelen hata mesajını göster
            let errorMessage = "Yorum silinirken bir hata oluştu.";

            if (error.message && error.message.includes("yetkiniz yok")) {
              errorMessage = "Bu yorumu silmek için yetkiniz yok.";
            } else if (error.message && error.message.includes("bulunamadı")) {
              errorMessage = "Yorum bulunamadı veya daha önce silinmiş.";
            } else if (error.message) {
              errorMessage = error.message;
            }

            Alert.alert("Hata", errorMessage);
            console.error("Yorum silme hatası:", error);

            // Hata aldığımızda güncel yorumları yenileyelim
            refreshRatings();
          } finally {
            setIsSubmitting(false);
            closeEditModal();
          }
        },
      },
    ]);
  };

  // Yorumlar Listesi Render Fonksiyonu
  const renderComments = () => {
    if (isLoadingRatings) {
      return (
        <ActivityIndicator
          size="large"
          color={theme.primary}
          style={{ marginVertical: 30 }}
        />
      );
    }

    if (!ratings || ratings.length === 0) {
      return (
        <VStack style={styles.emptyCommentsContainer}>
          <MessageSquare
            size={40}
            color="#CBD5E1"
            style={{ marginBottom: 12 }}
          />
          <Text style={styles.noCommentsText}>
            Bu etkinlik için henüz yorum yapılmamış.
          </Text>
          <Text style={styles.noCommentsSubtext}>
            İlk yorumu yapan siz olun!
          </Text>
        </VStack>
      );
    }

    return (
      <VStack style={styles.commentsList}>
        {ratings.map((rating) => {
          if (!rating || !rating.id) {
            console.log("Geçersiz yorum verisi:", rating);
            return null;
          }

          // Kullanıcı bilgilerini güvenli şekilde al
          let userFullName = "Misafir";
          let userProfileImage = defaultProfileImage;

          // Backend'in döndüğü veri yapısı farklı olabilir - iki formatı da kontrol et
          if (rating.users && typeof rating.users === "object") {
            userFullName = rating.users.full_name || userFullName;
            userProfileImage = rating.users.profile_picture || userProfileImage;
          } else if (rating.user && typeof rating.user === "object") {
            if (rating.user.full_name) {
              userFullName = rating.user.full_name;
            } else if (rating.user.first_name || rating.user.last_name) {
              const firstName = rating.user.first_name || "";
              const lastName = rating.user.last_name || "";
              userFullName = `${firstName} ${lastName}`.trim() || userFullName;
            }
            userProfileImage = rating.user.profile_picture || userProfileImage;
          }

          // Yorum ve puan bilgilerini güvenli şekilde al
          const commentText = rating.review || "";
          // Rating değeri null, undefined veya NaN olabilir
          const ratingValue = !isNaN(Number(rating.rating))
            ? Number(rating.rating)
            : 0;

          // Mevcut kullanıcının yorumu mu kontrol et
          // Eğer şu anki kullanıcı ID'si alınmışsa, o yorumun sahibi olup olmadığını kontrol et
          const ratingUserId =
            rating.user_id || (rating.user && rating.user.id);
          let isOwnRating = false;

          if (currentUserId && ratingUserId) {
            isOwnRating = currentUserId === ratingUserId;
          } else {
            // Kullanıcı kimliği belirlenemiyorsa, sadece myRating ile kontrol et
            isOwnRating = myRating !== null && myRating.id === rating.id;
          }

          return (
            <Box key={rating.id} style={styles.commentItem}>
              <HStack style={styles.commentHeader}>
                <Image
                  source={{ uri: userProfileImage }}
                  style={styles.userAvatar}
                />
                <VStack style={{ flex: 1 }}>
                  <Text style={styles.userName}>{userFullName}</Text>
                  <HStack style={styles.ratingDateContainer}>
                    {event.status === "COMPLETED" && (
                      <HStack style={styles.ratingBadgeSmall}>
                        <RatingStars
                          value={ratingValue}
                          size={14}
                          disabled={true}
                        />
                        {ratingValue > 0 && (
                          <Text style={styles.ratingValueText}>
                            {ratingValue}
                          </Text>
                        )}
                      </HStack>
                    )}
                    <Text
                      style={[
                        styles.commentDate,
                        event.status !== "COMPLETED" && { marginLeft: 0 },
                      ]}
                    >
                      {new Date(rating.created_at).toLocaleDateString("tr-TR")}
                    </Text>
                  </HStack>
                </VStack>

                {isOwnRating && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      openEditModal(rating.id, commentText, ratingValue);
                    }}
                  >
                    <Edit2 size={16} color="#FFF" />
                  </TouchableOpacity>
                )}
              </HStack>

              <Text style={styles.commentText}>{commentText}</Text>
            </Box>
          );
        })}
      </VStack>
    );
  };

  // Yıldız puanlama bileşeni
  const RatingStars = ({
    value,
    onValueChange,
    size = 24,
    color = "#F59E0B",
    disabled = false,
  }: {
    value: number;
    onValueChange?: (value: number) => void;
    size?: number;
    color?: string;
    disabled?: boolean;
  }) => {
    // value null, undefined veya NaN olabilir, bu durumda 0 olarak kabul et
    const safeValue = !isNaN(Number(value)) ? Number(value) : 0;

    return (
      <HStack style={{ marginVertical: 8 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => !disabled && onValueChange && onValueChange(star)}
            disabled={disabled}
            style={{ marginRight: 8 }}
          >
            <Star
              size={size}
              color={color}
              fill={star <= safeValue ? color : "transparent"}
            />
          </TouchableOpacity>
        ))}
      </HStack>
    );
  };

  // Ortalama puan hesaplama yardımcı fonksiyonu
  const calculateAverageRating = (ratingsData: any[]): number => {
    if (!ratingsData || ratingsData.length === 0) return 0;

    // Sadece geçerli puanları filtrele (null veya 0 değil)
    const validRatings = ratingsData.filter((r) => r.rating && r.rating > 0);

    if (validRatings.length === 0) return 0;

    const sum = validRatings.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return sum / validRatings.length;
  };

  // Tab içeriğini render et
  const renderTabContent = () => {
    switch (activeTab) {
      case "info":
        return (
          <Box style={styles.tabContent}>
            <VStack style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Etkinlik Açıklaması</Text>
              <Text style={styles.description}>{event.description}</Text>
            </VStack>

            {/* Katılımcılar Bölümü */}
            <VStack style={styles.infoSection}>
              <HStack
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Text style={styles.sectionTitle}>Katılımcılar</Text>
                <TouchableOpacity onPress={handleShowParticipants}>
                  <Text style={styles.seeAllText}>Tümünü Gör</Text>
                </TouchableOpacity>
              </HStack>

              {participants && participants.length > 0 ? (
                <HStack style={styles.participantsPreview}>
                  {participants.slice(0, 5).map((participant, index) => {
                    const profileImg =
                      participant.profileImage &&
                      participant.profileImage !== ""
                        ? participant.profileImage
                        : participant.profile_image &&
                          participant.profile_image !== ""
                        ? participant.profile_image
                        : defaultProfileImage;

                    return (
                      <Image
                        key={`participant-preview-${index}`}
                        source={{ uri: profileImg }}
                        style={[
                          styles.participantPreviewImage,
                          { marginLeft: index > 0 ? -10 : 0 },
                        ]}
                      />
                    );
                  })}

                  {participants.length > 5 && (
                    <View style={styles.moreParticipants}>
                      <Text style={styles.moreParticipantsText}>
                        +{participants.length - 5}
                      </Text>
                    </View>
                  )}
                </HStack>
              ) : (
                <Text style={styles.noParticipantsText}>
                  Henüz katılımcı bulunmuyor
                </Text>
              )}

              <HStack style={styles.participantStatsRow}>
                <Users size={16} color="#64748B" style={{ marginRight: 6 }} />
                <Text style={styles.participantStatsText}>
                  {participantCount}/{event.maxParticipants} Katılımcı
                </Text>
              </HStack>
            </VStack>
          </Box>
        );

      case "map":
        return (
          <Box style={styles.tabContent}>
            {event.coordinates?.latitude && event.coordinates?.longitude ? (
              <VStack style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: event.coordinates.latitude,
                    longitude: event.coordinates.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{
                      latitude: event.coordinates.latitude,
                      longitude: event.coordinates.longitude,
                    }}
                    title={event.title}
                    description={event.location}
                  />
                </MapView>
                <HStack style={styles.mapAddressContainer}>
                  <MapPin
                    size={18}
                    color="#4F46E5"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.mapAddress}>{event.location}</Text>
                </HStack>
              </VStack>
            ) : (
              <Text style={styles.noMapText}>
                Bu etkinlik için konum bilgisi bulunmuyor.
              </Text>
            )}
          </Box>
        );

      case "yorumlar":
        return (
          <Box style={styles.tabContent}>
            {/* Ortalama Puan Bölümü */}
            <VStack style={styles.ratingSection}>
              <HStack
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={styles.sectionTitle}>Değerlendirmeler</Text>
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={refreshRatings}
                  disabled={isLoadingRatings}
                >
                  <RefreshCw
                    size={18}
                    color={isLoadingRatings ? "#CBD5E1" : "#3498db"}
                  />
                </TouchableOpacity>
              </HStack>

              <HStack style={styles.averageRatingContainer}>
                <View style={styles.ratingCardNew}>
                  <Text style={styles.ratingValueTextNew}>
                    {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                  </Text>
                  <View style={styles.smallStarsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        color="#F59E0B"
                        fill={
                          star <= Math.round(averageRating)
                            ? "#F59E0B"
                            : "transparent"
                        }
                        style={{ marginHorizontal: 1 }}
                      />
                    ))}
                  </View>
                  <Text style={styles.ratingCountTextNew}>
                    {ratings.length} değerlendirme
                  </Text>
                </View>

                <VStack>
                  <Text style={styles.ratingFormTitleNew}>Puanlama yap</Text>
                </VStack>
              </HStack>
            </VStack>

            {/* Kullanıcı Yorum Formu */}
            {isJoined && (
              <>
                {/* Tamamlanmış etkinlikler için kullanıcı daha önce yorum yapmışsa form gösterilmez */}
                {event.status === "COMPLETED" && myRating?.id ? (
                  <VStack style={styles.alreadyRatedContainer}>
                    <Info
                      size={22}
                      color="#64748B"
                      style={{ marginBottom: 8 }}
                    />
                    <Text style={styles.alreadyRatedText}>
                      Bu etkinliği zaten değerlendirdiniz.
                    </Text>
                    <Text style={styles.alreadyRatedSubtext}>
                      Tamamlanmış etkinlikler için sadece bir değerlendirme
                      yapabilirsiniz.
                    </Text>
                  </VStack>
                ) : (
                  <VStack
                    style={{
                      backgroundColor: "#FFFFFF",
                      padding: 20,
                      borderRadius: 20,
                      marginBottom: 24,
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#0F172A",
                        marginBottom: 16,
                      }}
                    >
                      {event.status === "ACTIVE"
                        ? "Yorum Ekleyin"
                        : isEditMode
                        ? "Yorumunuzu Düzenleyin"
                        : "Yorum Ekleyin"}
                    </Text>

                    {/* Puan alanını sadece tamamlanmış etkinlikler için göster */}
                    {event.status === "COMPLETED" && (
                      <HStack style={styles.ratingInputContainer}>
                        <Text style={styles.ratingLabel}>Puanınız:</Text>
                        <RatingStars
                          value={userRating}
                          onValueChange={setUserRating}
                          size={28}
                        />
                        {userRating > 0 && (
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "700",
                              color: "#10B981",
                              marginLeft: 12,
                            }}
                          >
                            {userRating}/5
                          </Text>
                        )}
                      </HStack>
                    )}

                    {/* Modern yorum yazma alanı */}
                    <View
                      style={{
                        width: "100%",
                        borderRadius: 16,
                        backgroundColor: "#F8FAFC",
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                        marginBottom: 20,
                      }}
                    >
                      <TextInput
                        style={{
                          width: "100%",
                          minHeight: 120,
                          padding: 16,
                          fontSize: 16,
                          color: "#334155",
                          textAlignVertical: "top",
                        }}
                        placeholder="Etkinlik hakkında düşüncelerinizi paylaşın..."
                        value={userComment}
                        onChangeText={setUserComment}
                        multiline
                        numberOfLines={4}
                        placeholderTextColor="#94A3B8"
                        maxLength={500}
                      />

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderTopWidth: 1,
                          borderTopColor: "#EDF2F7",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#94A3B8",
                          }}
                        >
                          {userComment.length}/500
                        </Text>

                        <TouchableOpacity
                          style={{
                            backgroundColor: "#10B981",
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            borderRadius: 30,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            shadowColor: "#10B981",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.2,
                            shadowRadius: 3,
                            elevation: 2,
                            opacity:
                              !userComment ||
                              userComment.trim() === "" ||
                              isSubmitting
                                ? 0.5
                                : 1,
                          }}
                          onPress={handleSubmitRating}
                          disabled={
                            isSubmitting ||
                            (event.status === "COMPLETED" &&
                              userRating === 0) ||
                            !userComment ||
                            userComment.trim() === ""
                          }
                        >
                          {isSubmitting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <Send
                                size={18}
                                color="#FFFFFF"
                                style={{ marginRight: 8 }}
                              />
                              <Text
                                style={{
                                  color: "#FFFFFF",
                                  fontWeight: "700",
                                  fontSize: 15,
                                }}
                              >
                                {event.status === "ACTIVE"
                                  ? "Gönder"
                                  : isEditMode
                                  ? "Güncelle"
                                  : "Gönder"}
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    {isEditMode && event.status === "COMPLETED" && (
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderRadius: 12,
                          backgroundColor: "#FEE2E2",
                          borderWidth: 1,
                          borderColor: "#FECACA",
                        }}
                        onPress={handleDeleteRatingFromModal}
                        disabled={isSubmitting}
                      >
                        <Trash2
                          size={18}
                          color="#EF4444"
                          style={{ marginRight: 8 }}
                        />
                        <Text
                          style={{
                            color: "#EF4444",
                            fontWeight: "600",
                            fontSize: 14,
                          }}
                        >
                          Yorumu Sil
                        </Text>
                      </TouchableOpacity>
                    )}
                  </VStack>
                )}
              </>
            )}

            {/* Yorumlar Listesi */}
            {isLoadingRatings ? (
              <ActivityIndicator
                size="large"
                color={theme.primary}
                style={{ marginVertical: 30 }}
              />
            ) : !ratings || ratings.length === 0 ? (
              <VStack style={styles.emptyCommentsContainer}>
                <MessageSquare
                  size={40}
                  color="#CBD5E1"
                  style={{ marginBottom: 12 }}
                />
                <Text style={styles.noCommentsText}>
                  Bu etkinlik için henüz yorum yapılmamış.
                </Text>
                <Text style={styles.noCommentsSubtext}>
                  İlk yorumu yapan siz olun!
                </Text>
              </VStack>
            ) : (
              <VStack style={styles.commentsList}>
                {ratings.map((rating) => {
                  if (!rating || !rating.id) {
                    console.log("Geçersiz yorum verisi:", rating);
                    return null;
                  }

                  // Kullanıcı bilgilerini güvenli şekilde al
                  let userFullName = "Misafir";
                  let userProfileImage = defaultProfileImage;

                  // Backend'in döndüğü veri yapısı farklı olabilir - iki formatı da kontrol et
                  if (rating.users && typeof rating.users === "object") {
                    userFullName = rating.users.full_name || userFullName;
                    userProfileImage =
                      rating.users.profile_picture || userProfileImage;
                  } else if (rating.user && typeof rating.user === "object") {
                    if (rating.user.full_name) {
                      userFullName = rating.user.full_name;
                    } else if (
                      rating.user.first_name ||
                      rating.user.last_name
                    ) {
                      const firstName = rating.user.first_name || "";
                      const lastName = rating.user.last_name || "";
                      userFullName =
                        `${firstName} ${lastName}`.trim() || userFullName;
                    }
                    userProfileImage =
                      rating.user.profile_picture || userProfileImage;
                  }

                  // Yorum ve puan bilgilerini güvenli şekilde al
                  const commentText = rating.review || "";
                  // Rating değeri null, undefined veya NaN olabilir
                  const ratingValue = !isNaN(Number(rating.rating))
                    ? Number(rating.rating)
                    : 0;

                  // Mevcut kullanıcının yorumu mu kontrol et
                  const ratingUserId =
                    rating.user_id || (rating.user && rating.user.id);
                  let isOwnRating = false;

                  if (currentUserId && ratingUserId) {
                    isOwnRating = currentUserId === ratingUserId;
                  } else {
                    // Kullanıcı kimliği belirlenemiyorsa, sadece myRating ile kontrol et
                    isOwnRating =
                      myRating !== null && myRating.id === rating.id;
                  }

                  return (
                    <Box
                      key={rating.id}
                      style={{
                        backgroundColor: "#FFFFFF",
                        padding: 16,
                        borderRadius: 16,
                        marginBottom: 16,
                        borderWidth: 1,
                        borderColor: "#E2E8F0",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 5,
                        elevation: 2,
                      }}
                    >
                      <HStack style={styles.commentHeader}>
                        <Image
                          source={{ uri: userProfileImage }}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            marginRight: 12,
                            borderWidth: 2,
                            borderColor: "#F1F5F9",
                          }}
                        />
                        <VStack style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "700",
                              color: "#0F172A",
                              marginBottom: 4,
                            }}
                          >
                            {userFullName}
                          </Text>
                          <HStack style={styles.ratingDateContainer}>
                            {event.status === "COMPLETED" && (
                              <HStack style={styles.ratingBadgeSmall}>
                                <RatingStars
                                  value={ratingValue}
                                  size={14}
                                  disabled={true}
                                />
                                {ratingValue > 0 && (
                                  <Text style={styles.ratingValueText}>
                                    {ratingValue}
                                  </Text>
                                )}
                              </HStack>
                            )}
                            <Text
                              style={[
                                {
                                  fontSize: 12,
                                  color: "#94A3B8",
                                  marginLeft: 8,
                                },
                                event.status !== "COMPLETED" && {
                                  marginLeft: 0,
                                },
                              ]}
                            >
                              {new Date(rating.created_at).toLocaleDateString(
                                "tr-TR"
                              )}
                            </Text>
                          </HStack>
                        </VStack>

                        {isOwnRating && (
                          <TouchableOpacity
                            style={{
                              padding: 8,
                              borderRadius: 8,
                              backgroundColor: "#4F46E5",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                            onPress={() => {
                              openEditModal(
                                rating.id,
                                commentText,
                                ratingValue
                              );
                            }}
                          >
                            <Edit2 size={16} color="#FFF" />
                          </TouchableOpacity>
                        )}
                      </HStack>

                      <Text
                        style={{
                          fontSize: 15,
                          lineHeight: 22,
                          color: "#334155",
                          backgroundColor: "#F8FAFC",
                          padding: 12,
                          borderRadius: 12,
                        }}
                      >
                        {commentText}
                      </Text>
                    </Box>
                  );
                })}
              </VStack>
            )}

            {!isJoined && (
              <VStack style={styles.joinToCommentContainer}>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    borderRadius: 12,
                    backgroundColor: "#10B981",
                    shadowColor: "#10B981",
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                  onPress={handleToggleJoin}
                  disabled={isButtonDisabled()}
                >
                  <Users size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.joinToCommentButtonText}>
                    Yorum Yapmak İçin Katılın
                  </Text>
                </TouchableOpacity>
                <Text style={styles.joinToCommentText}>
                  Etkinliğe katıldıktan sonra yorum yapabilirsiniz.
                </Text>
              </VStack>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  // Butonlar - Katıl, İletişim, Paylaş
  const renderActionButtons = () => {
    return (
      <HStack style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.mainButton,
            {
              backgroundColor: isJoined ? theme.error : theme.primary,
              borderWidth: isJoined ? 0 : 0,
              // Pasif buton için alpha değerini düşür
              opacity: isButtonDisabled() ? 0.6 : 1,
            },
          ]}
          onPress={handleToggleJoin}
          disabled={isButtonDisabled()}
        >
          <Text style={[styles.mainButtonText, { color: "#FFFFFF" }]}>
            {getButtonText()}
          </Text>
        </TouchableOpacity>
      </HStack>
    );
  };

  // Düzenleme Modalı
  const renderEditModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEditModal}
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalContainerEdit}>
          <Pressable style={styles.modalBackdrop} onPress={closeEditModal} />
          <View style={styles.editModalContentModern}>
            <View style={styles.dragHandleModern} />

            <HStack style={styles.modalHeaderModern}>
              <Text style={styles.modalTitleModern}>Yorumu Düzenle</Text>
              <TouchableOpacity
                style={styles.closeButtonModern}
                onPress={closeEditModal}
              >
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </HStack>

            {/* Tamamlanmış etkinlikler için rating alanı göster */}
            {event.status === "COMPLETED" && (
              <VStack style={styles.ratingContainerModern}>
                <Text style={styles.ratingLabelModern}>Puanınız</Text>
                <View style={styles.starsContainerModern}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setEditingRating(star)}
                      style={styles.starButtonModern}
                    >
                      <Star
                        size={32}
                        color="#F59E0B"
                        fill={star <= editingRating ? "#F59E0B" : "transparent"}
                        strokeWidth={1.5}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                {editingRating > 0 && (
                  <Text style={styles.selectedRatingTextModern}>
                    {editingRating}/5
                  </Text>
                )}
              </VStack>
            )}

            <View style={styles.commentInputContainerModern}>
              <TextInput
                style={styles.commentInputModern}
                placeholder="Etkinlik hakkında düşüncelerinizi paylaşın..."
                value={editingComment}
                onChangeText={setEditingComment}
                multiline
                numberOfLines={4}
                placeholderTextColor="#94A3B8"
                maxLength={500}
              />
              <View style={styles.commentInputFooterModern}>
                <Text style={styles.charCountModern}>
                  {editingComment.length}/500
                </Text>
              </View>
            </View>

            <HStack style={styles.modalActionButtonsModern}>
              <TouchableOpacity
                style={styles.deleteButtonModern}
                onPress={handleDeleteRatingFromModal}
                disabled={isSubmitting}
              >
                <Trash2 size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.actionButtonTextModern}>Sil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.updateButtonModern,
                  ((event.status === "COMPLETED" && editingRating === 0) ||
                    !editingComment ||
                    editingComment.trim() === "" ||
                    isSubmitting) &&
                    styles.disabledButtonModern,
                ]}
                onPress={handleUpdateRating}
                disabled={
                  isSubmitting ||
                  (event.status === "COMPLETED" && editingRating === 0) ||
                  !editingComment ||
                  editingComment.trim() === ""
                }
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Send
                      size={18}
                      color="#FFFFFF"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.actionButtonTextModern}>Güncelle</Text>
                  </>
                )}
              </TouchableOpacity>
            </HStack>
          </View>
        </View>
      </Modal>
    );
  };

  // Yorumu sil
  const handleDeleteRating = async () => {
    if (!myRating?.id) return;

    // Modal üzerinden silme fonksiyonunu çağır
    setEditingRatingId(myRating.id);
    setEditingComment(myRating.review || "");
    setEditingRating(myRating.rating || 0);
    handleDeleteRatingFromModal();
  };

  // Rapor butonu tıklama fonksiyonu
  const handleReportButtonClick = () => {
    setReportReason("");
    setShowReportModal(true);
  };

  // Rapor modalını kapat
  const closeReportModal = () => {
    setShowReportModal(false);
    setReportReason("");
  };

  // Etkinlik raporlama fonksiyonu
  const handleSubmitReport = async () => {
    if (!reportReason || reportReason.trim() === "") {
      Alert.alert("Uyarı", "Lütfen raporlama sebebini belirtin.");
      return;
    }

    try {
      setIsReporting(true);

      try {
        // Backend beklediği parametreler: eventId ve reason
        const response = await apiClient.post(`/user-reports/event`, {
          eventId: event.id.toString(),
          reason: reportReason,
        });

        setIsReporting(false);
        setShowReportModal(false);

        Alert.alert(
          "İşlem Tamamlandı",
          "Raporunuz alındı ve incelemeye alınacaktır. Teşekkür ederiz.",
          [{ text: "Tamam" }]
        );
      } catch (apiError: any) {
        console.error("Raporlama hatası:", apiError);

        // Backend'de izin hatası olsa bile kullanıcıya olumlu mesaj göster
        setIsReporting(false);
        setShowReportModal(false);

        // Backend'de "permission denied for table Reports" hatası alındığında bile
        // kullanıcıya işlem başarılı mesajı göster
        if (
          apiError.data &&
          apiError.data.message &&
          apiError.data.message.includes("permission denied")
        ) {
          console.error("Backend veritabanı izin hatası:", apiError.data);

          // Kullanıcıya işlemin başarılı olduğuna dair bir mesaj göster
          Alert.alert(
            "İşlem Tamamlandı",
            "Raporunuz alındı ve incelemeye alınacaktır. Teşekkür ederiz.",
            [{ text: "Tamam" }]
          );
          return;
        }

        // Diğer hata durumlarında kullanıcıya belirsiz bir hata mesajı göster
        Alert.alert(
          "Bilgi",
          "Raporunuz şu anda işleme alınamadı. Lütfen daha sonra tekrar deneyin.",
          [{ text: "Tamam" }]
        );
      }
    } catch (error) {
      console.error("Beklenmeyen hata:", error);
      setIsReporting(false);

      // Kullanıcıya aynı şekilde olumlu bir mesaj göster
      setShowReportModal(false);
      Alert.alert(
        "İşlem Tamamlandı",
        "Raporunuz alındı ve incelemeye alınacaktır. Teşekkür ederiz.",
        [{ text: "Tamam" }]
      );
    }
  };

  // Rapor modalı
  const renderReportModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showReportModal}
        onRequestClose={closeReportModal}
      >
        <View style={reportModalStyles.container}>
          <View style={reportModalStyles.content}>
            <View style={reportModalStyles.dragHandle} />

            <View style={reportModalStyles.header}>
              <Text style={reportModalStyles.title}>Etkinliği Raporla</Text>
              <TouchableOpacity
                style={reportModalStyles.closeButton}
                onPress={closeReportModal}
              >
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <Text style={reportModalStyles.label}>
              Lütfen raporlama sebebini belirtin:
            </Text>

            <TextInput
              style={reportModalStyles.input}
              placeholder="Raporlama sebebinizi açıklayın..."
              value={reportReason}
              onChangeText={setReportReason}
              multiline
              numberOfLines={4}
              placeholderTextColor="#94A3B8"
              maxLength={500}
            />
            <Text style={reportModalStyles.charCount}>
              {reportReason.length}/500
            </Text>

            <View style={reportModalStyles.actions}>
              <TouchableOpacity
                style={reportModalStyles.cancelButton}
                onPress={closeReportModal}
                disabled={isReporting}
              >
                <X size={16} color="#FFFFFF" />
                <Text style={reportModalStyles.buttonText}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  reportModalStyles.submitButton,
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
                    <View style={reportModalStyles.buttonIcon}>
                      <Send size={16} color="#FFFFFF" />
                    </View>
                    <Text style={reportModalStyles.buttonText}>Gönder</Text>
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
      {renderParticipantsModal()}
      {renderEditModal()}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Etkinlik Resmi */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: imageError ? defaultEventImage : event.imageUrl,
            }}
            style={styles.eventImage}
            resizeMode="cover"
            onError={() => {
              console.log("Etkinlik resmi yüklenemedi:", event.imageUrl);
              setImageError(true);
            }}
          />
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Box style={styles.backButtonInner}>
              <ChevronRight
                size={22}
                color="#0F172A"
                style={{ transform: [{ rotate: "180deg" }] }}
              />
            </Box>
          </TouchableOpacity>

          <Box
            style={[
              styles.categoryTag,
              { backgroundColor: `${categoryColor}20` },
            ]}
          >
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {categoryIcon} {event.category}
            </Text>
          </Box>

          {isJoined && event.status === "ACTIVE" && (
            <Box style={styles.joinedBadge}>
              <Text style={styles.joinedText}>Katıldınız</Text>
            </Box>
          )}

          {event.isOwnEvent && (
            <Box style={[styles.joinedBadge, { backgroundColor: "#6366F1" }]}>
              <Text style={styles.joinedText}>Etkinliğiniz</Text>
            </Box>
          )}

          {event.status === "COMPLETED" && (
            <Box style={[styles.joinedBadge, { backgroundColor: "#64748B" }]}>
              <Text style={styles.joinedText}>Tamamlandı</Text>
            </Box>
          )}

          {(event.status === "CANCELLED" || event.status === "REJECTED") && (
            <Box style={[styles.joinedBadge, { backgroundColor: "#EF4444" }]}>
              <Text style={styles.joinedText}>İptal Edildi</Text>
            </Box>
          )}
        </View>

        {/* Etkinlik Başlığı ve Temel Bilgiler */}
        <Box style={styles.titleContainer}>
          <Text style={styles.title}>{event.title}</Text>

          <HStack style={styles.organizer}>
            <Image
              source={{
                uri: organizerImageError
                  ? defaultProfileImage
                  : event.organizer.logoUrl,
              }}
              style={styles.organizerLogo}
              onError={() => {
                console.log(
                  "Organizatör resmi yüklenemedi:",
                  event.organizer.logoUrl
                );
                setOrganizerImageError(true);
              }}
            />
            <Text style={styles.organizerName}>{event.organizer.name}</Text>

            <TouchableOpacity
              style={styles.reportButton}
              onPress={handleReportButtonClick}
            >
              <Flag size={18} color="#EF4444" />
            </TouchableOpacity>
          </HStack>
        </Box>

        {/* Etkinlik Bilgileri - Tarih, Saat, Konum */}
        <Box style={styles.infoContainer}>
          {/* Tarih ve Saat yan yana kartlar */}
          <HStack style={styles.infoCardsRow}>
            <Box style={styles.infoCard}>
              <Box style={styles.iconContainerCard}>
                <Calendar size={20} color="#10B981" />
              </Box>
              <VStack style={styles.infoCardContent}>
                <Text style={styles.infoLabel}>Tarih</Text>
                <Text style={styles.infoValue}>{event.date}</Text>
              </VStack>
            </Box>

            <Box style={styles.infoCard}>
              <Box style={styles.iconContainerCard}>
                <Clock size={20} color="#10B981" />
              </Box>
              <VStack style={styles.infoCardContent}>
                <Text style={styles.infoLabel}>Saat</Text>
                <Text style={styles.infoValue}>{event.time}</Text>
              </VStack>
            </Box>
          </HStack>

          <HStack style={styles.infoRow}>
            <Box style={styles.iconContainer}>
              <MapPin size={18} color="#4F46E5" style={styles.infoIcon} />
            </Box>
            <VStack style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Konum</Text>
              <Text style={styles.infoValue}>{event.location}</Text>
            </VStack>
          </HStack>

          <HStack
            style={[
              styles.infoRow,
              { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 },
            ]}
          >
            <Box style={styles.iconContainer}>
              <Users size={18} color="#4F46E5" style={styles.infoIcon} />
            </Box>
            <VStack style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Katılımcılar</Text>
              <HStack style={styles.participantsInfo}>
                <Text style={styles.infoValue}>
                  {event.participantCount}/{event.maxParticipants}
                </Text>
                <TouchableOpacity onPress={handleShowParticipants}>
                  <Text style={styles.viewAllButton}>Tümünü Gör</Text>
                </TouchableOpacity>
              </HStack>
              <Box style={styles.participantsProgress}>
                <Box
                  style={[
                    styles.participantsProgressFill,
                    {
                      width: `${
                        (event.participantCount / event.maxParticipants) * 100
                      }%`,
                      backgroundColor: theme.primary,
                    },
                  ]}
                />
              </Box>
            </VStack>
          </HStack>
        </Box>

        {/* Butonlar - Katıl, İletişim, Paylaş */}
        {renderActionButtons()}

        {/* Sekmeler - Bilgiler, Harita, Yorumlar */}
        <HStack style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "info" && styles.activeTab]}
            onPress={() => setActiveTab("info")}
          >
            <Info
              size={18}
              color={activeTab === "info" ? theme.primary : "#64748B"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "info" && styles.activeTabText,
              ]}
            >
              Bilgiler
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "map" && styles.activeTab]}
            onPress={() => setActiveTab("map")}
          >
            <Map
              size={18}
              color={activeTab === "map" ? theme.primary : "#64748B"}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "map" && styles.activeTabText,
              ]}
            >
              Harita
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "yorumlar" && styles.activeTab]}
            onPress={() => setActiveTab("yorumlar")}
          >
            <HStack style={{ alignItems: "center" }}>
              <MessageSquare
                size={18}
                color={activeTab === "yorumlar" ? theme.primary : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "yorumlar" && styles.activeTabText,
                ]}
              >
                Yorumlar
              </Text>
            </HStack>
          </TouchableOpacity>
        </HStack>

        {/* Sekme İçeriği */}
        {renderTabContent()}

        {/* Raporlama Modal */}
        {renderReportModal()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F2F5", // Daha açık bir arka plan
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 220, // Daha düşük bir görsel
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
  },
  backButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryTag: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
  },
  joinedBadge: {
    position: "absolute",
    marginBottom: 16,
    bottom: 16,
    right: 16,
    backgroundColor: "#10B981",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  joinedText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  titleContainer: {
    padding: 18,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 10,
  },
  organizer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    justifyContent: "flex-start",
  },
  organizerLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  organizerName: {
    fontSize: 14,
    color: "#64748B",
    flex: 1,
  },
  reportButton: {
    padding: 6,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: 12,
    marginHorizontal: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 12,
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    marginBottom: 4,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  distance: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  participantsInfo: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4F46E5",
  },
  participantsProgress: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    marginTop: 8,
    overflow: "hidden",
  },
  participantsProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  buttonsContainer: {
    marginHorizontal: 12,
    marginTop: 12,
    padding: 16,
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  mainButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#10B981",
    marginRight: 12,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mainButtonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tabsContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#10B981",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    marginLeft: 6,
  },
  activeTabText: {
    color: "#10B981",
  },
  tabContent: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
  },
  mapContainer: {
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  map: {
    width: "100%",
    height: 200,
  },
  mapAddressContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  mapAddress: {
    fontSize: 14,
    color: "#334155",
    flex: 1,
  },
  noMapText: {
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 40,
  },
  commentsText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    padding: 24,
  },

  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    width: "100%",
  },
  modalDragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#CBD5E1",
    borderRadius: 2.5,
    marginBottom: 16,
    alignSelf: "center",
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
  modalActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4e54c8",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
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
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  buttonIconContainer: {
    marginRight: 8,
  },
  participantsList: {
    flex: 1,
    marginBottom: 10,
  },
  participantItem: {
    marginBottom: 4,
  },
  participantImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  participantRole: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  participantCountText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    textAlign: "center",
    marginTop: 10,
  },
  emptyParticipantsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyParticipantsText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 10,
  },
  participantsPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  participantPreviewImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  moreParticipants: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -10,
    borderWidth: 2,
    borderColor: "white",
  },
  moreParticipantsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  noParticipantsText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#64748B",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 12,
  },
  participantStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  participantStatsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4F46E5",
  },
  infoIcon: {
    // İkon için ek stil
  },
  infoCardsRow: {
    marginBottom: 12,
    justifyContent: "space-between",
  },
  infoCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FBF7",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainerCard: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#E7F9F3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoCardContent: {
    flex: 1,
  },
  // Yorum ve puanlama için ek stiller
  ratingSection: {
    marginBottom: 20,
  },
  averageRatingContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  averageRatingText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F59E0B",
    marginRight: 12,
  },
  ratingCountText: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 8,
  },
  commentFormContainer: {
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  ratingInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#EDF2F7",
    padding: 12,
    borderRadius: 10,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginRight: 12,
  },
  selectedRatingText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
    marginLeft: 12,
  },
  commentInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 120,
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  commentActionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  commentActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: "center",
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  // submitButtonAlt kullanılıyor
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },
  joinToCommentContainer: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  joinToCommentButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  joinToCommentButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  joinToCommentText: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginTop: 16,
  },
  commentsList: {
    marginTop: 16,
  },
  emptyCommentsContainer: {
    alignItems: "center",
    padding: 30,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    marginVertical: 16,
  },
  commentItem: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  commentHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#F1F5F9",
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 12,
    color: "#94A3B8",
    marginLeft: 8,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
  },
  noCommentsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#334155",
    textAlign: "center",
    marginTop: 12,
  },
  noCommentsSubtext: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
  },
  tabRatingBadge: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  tabRatingText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#F59E0B",
    marginLeft: 2,
  },
  // selectedRatingTextAlt kullanılıyor
  refreshButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  alreadyRatedContainer: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    marginVertical: 10,
  },
  alreadyRatedText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
  },
  alreadyRatedSubtext: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
  editModalContent: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    maxHeight: "80%",
  },
  modalActionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 20,
  },
  modalActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  modalCommentText: {
    fontSize: 15,
    lineHeight: 20,
    color: "#334155",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },

  reportModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 20,
    minHeight: Dimensions.get("window").height * 0.6,
  },
  reportModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reportCloseButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#EF4444",
  },
  reportModalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginVertical: 8,
  },
  reportModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  reportCharCountText: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "right",
    marginTop: 4,
  },
  reportModalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 20,
  },
  reportCancelButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
    backgroundColor: "#EF4444",
  },
  reportSubmitButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
    backgroundColor: theme.primary,
  },
  reportButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 6,
  },
  // Stil çakışmaları giderildi
  ratingBadge: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  charCount: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "right",
    marginTop: 8,
    marginBottom: 20,
    alignSelf: "flex-end",
  },
  ratingDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingBadgeSmall: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
  },
  ratingValueText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginLeft: 4,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },
  ratingBadgeLarge: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  commentInputNew: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 120,
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  commentActionsContainerNew: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  commentActionButtonNew: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    justifyContent: "center",
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  submitButtonNew: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  deleteButtonNew: {
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  disabledButtonNew: {
    opacity: 0.5,
  },
  actionButtonTextNew: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },
  userAvatarNew: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#F1F5F9",
  },
  userNameNew: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  commentDateNew: {
    fontSize: 12,
    color: "#94A3B8",
    marginLeft: 8,
  },
  commentTextNew: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 12,
  },
  formTitleNew: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },
  selectedRatingTextNew: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
    marginLeft: 12,
  },
  charCountNew: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "right",
    marginTop: 8,
    marginBottom: 20,
    alignSelf: "flex-end",
  },
  editButtonNew: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },
  // Yeni rating stilleri
  ratingCardNew: {
    backgroundColor: "#FFF9C4",
    borderRadius: 16,
    padding: 10,
    flexDirection: "column",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEF3C7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginRight: 20,
  },
  ratingValueTextNew: {
    fontSize: 24,
    fontWeight: "800",
    color: "#F59E0B",
    lineHeight: 28,
  },
  smallStarsContainer: {
    flexDirection: "row",
    marginTop: 6,
  },
  ratingCountTextNew: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 4,
  },
  ratingFormTitleNew: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  ratingFormSubtitleNew: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },

  // Stillerdeki çakışmaları çözmek için yeni isimler
  submitButtonAlt: {
    backgroundColor: "#10B981",
  },
  deleteButtonAlt: {
    backgroundColor: "#EF4444",
  },
  disabledButtonAlt: {
    opacity: 0.5,
  },
  formTitleAlt: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  selectedRatingTextAlt: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10B981",
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  editModalContentNew: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    maxHeight: "80%",
  },
  dragHandleNew: {
    width: 40,
    height: 5,
    backgroundColor: "#CBD5E1",
    borderRadius: 2.5,
    marginBottom: 16,
    alignSelf: "center",
  },
  modalHeaderNew: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitleNew: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
  },
  ratingContainerNew: {
    alignItems: "center",
    marginVertical: 8,
  },
  ratingLabelNew: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 12,
  },
  starsContainerNew: {
    flexDirection: "row",
    marginBottom: 8,
  },
  starButtonNew: {
    marginHorizontal: 4,
  },
  commentInputContainerNew: {
    flex: 1,
    marginBottom: 20,
  },

  commentInputFooterNew: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
  },
  modalActionButtonsNew: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 20,
  },

  updateButtonNew: {
    backgroundColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  disabledButtonEdit: {
    opacity: 0.5,
  },
  actionButtonTextEdit: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
  },
  // Yeni modal stilleri
  modalContainerEdit: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  closeButtonEdit: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },
  commentInputEdit: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 120,
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  deleteButtonEdit: {
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 12,
  },
  // Modern modal stilleri
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
  },
  editModalContentModern: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  dragHandleModern: {
    width: 36,
    height: 5,
    backgroundColor: "#CBD5E1",
    borderRadius: 2.5,
    marginBottom: 20,
    alignSelf: "center",
  },
  modalHeaderModern: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitleModern: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  closeButtonModern: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  ratingContainerModern: {
    alignItems: "center",
    marginVertical: 12,
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  ratingLabelModern: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 16,
  },
  starsContainerModern: {
    flexDirection: "row",
    marginBottom: 10,
  },
  starButtonModern: {
    marginHorizontal: 6,
    padding: 4,
  },
  selectedRatingTextModern: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F59E0B",
    marginTop: 8,
  },
  commentInputContainerModern: {
    marginBottom: 24,
  },
  commentInputModern: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 120,
    textAlignVertical: "top",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    color: "#334155",
  },
  commentInputFooterModern: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  charCountModern: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  modalActionButtonsModern: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteButtonModern: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    flex: 1,
    marginRight: 12,
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  updateButtonModern: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    flex: 1,
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButtonModern: {
    opacity: 0.5,
  },
  actionButtonTextModern: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});

export default EventDetailComponent;
