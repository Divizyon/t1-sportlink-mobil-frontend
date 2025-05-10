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
} from "lucide-react-native";
import MapView, { Marker } from "react-native-maps";
import eventRatingService from "@/src/api/eventRatingService";

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
  id: number | string;
  name: string;
  profileImage: string;
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
  participants?: Participant[];
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
  const [activeTab, setActiveTab] = useState("info"); // 'info', 'map', 'yorumlar'
  const [isJoined, setIsJoined] = useState(event.isJoined || false);
  const [isParticipantsModalVisible, setIsParticipantsModalVisible] =
    useState(false);

  // Yorumlar ve puanlama için state'ler
  const [ratings, setRatings] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
  const [myRating, setMyRating] = useState<any>(null);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // event prop'u değiştiğinde isJoined state'ini güncelle
  useEffect(() => {
    if (event && event.isJoined !== undefined) {
      setIsJoined(event.isJoined);
      console.log(
        "EventDetailComponent: isJoined state güncellendi:",
        event.isJoined
      );
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

  // Kategori rengini belirle
  const categoryColor = theme.categoryColors[event.category] || theme.primary;

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
    if (onJoin) {
      onJoin(event.id);
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
    if (!event.participants || event.participants.length === 0) {
      Alert.alert("Bilgi", "Bu etkinlik için katılımcı listesi bulunamadı.");
      return;
    }
    setIsParticipantsModalVisible(true);
  };

  // Katılımcı Modalı
  const renderParticipantsModal = () => {
    if (!event.participants || event.participants.length === 0) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isParticipantsModalVisible}
        onRequestClose={() => setIsParticipantsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <HStack style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Katılımcılar</Text>
              <TouchableOpacity
                onPress={() => setIsParticipantsModalVisible(false)}
              >
                <X size={24} color="#0F172A" />
              </TouchableOpacity>
            </HStack>

            <ScrollView style={styles.participantsList}>
              {event.participants.map((participant) => (
                <HStack key={participant.id} style={styles.participantItem}>
                  <Image
                    source={{ uri: participant.profileImage }}
                    style={styles.participantImage}
                  />
                  <Text style={styles.participantName}>{participant.name}</Text>
                </HStack>
              ))}
            </ScrollView>
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

      // Kullanıcının kendi yorumunu getir
      const userRating = await eventRatingService.getMyRating(event.id);
      if (userRating && userRating.id) {
        console.log("Kullanıcının yorumu bulundu:", JSON.stringify(userRating));
        setMyRating(userRating);
        // Puan null olabilir, bu durumda 0 olarak ayarla
        setUserRating(userRating.rating || 0);
        setUserComment(userRating.review || ""); // review alanını kullan
        setIsEditMode(true);
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

  // Yorum gönderildikten sonra yorumları tekrar getir
  const refreshRatings = useCallback(() => {
    console.log("Yorumlar yenileniyor...");
    fetchRatings();
  }, [event.id]);

  // Yorum gönder
  const handleSubmitRating = async () => {
    if (!event.id) return;

    // Form doğrulama
    if (userRating === 0) {
      Alert.alert("Uyarı", "Lütfen bir puan seçin (1-5 arası).");
      return;
    }

    if (!userComment || userComment.trim() === "") {
      Alert.alert("Uyarı", "Lütfen bir yorum yazın.");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log(
        `Yorum gönderiliyor - Etkinlik: ${event.id}, Puan: ${userRating}, Yorum: ${userComment}`
      );

      if (isEditMode && myRating?.id) {
        // Yorumu güncelle
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
        // Yeni yorum ekle
        const added = await eventRatingService.addRating(
          event.id,
          userRating,
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
        } else {
          console.error("Yorum eklenirken bir hata oluştu, null yanıt döndü");
          Alert.alert(
            "Hata",
            "Yorumunuz eklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
          );
        }
      }

      // Biraz bekleyip yorumları yeniden yükle (backend'in güncellemeleri işlemesi için)
      setTimeout(() => {
        refreshRatings();
      }, 500);
    } catch (error: any) {
      // Backend'den gelen hata mesajı varsa onu göster
      const errorMessage = error.message || "Yorum eklenirken bir hata oluştu.";
      Alert.alert("Hata", errorMessage);
      console.error("Yorum gönderme hatası:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Yorumu sil
  const handleDeleteRating = async () => {
    if (!myRating?.id) return;

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
            const success = await eventRatingService.deleteRating(myRating.id);

            if (success) {
              // Yorumu ratings listesinden kaldır
              const deletedRatingId = myRating.id;
              setRatings((prevRatings) =>
                prevRatings.filter((r) => r.id !== deletedRatingId)
              );

              // Ortalama puanı güncelle
              const newRatings = ratings.filter(
                (r) => r.id !== deletedRatingId
              );
              const newAvg = calculateAverageRating(newRatings);
              setAverageRating(newAvg);

              // Form durumunu temizle
              setMyRating(null);
              setUserRating(0);
              setUserComment("");
              setIsEditMode(false);

              Alert.alert("Başarılı", "Yorumunuz silindi.");
            } else {
              Alert.alert(
                "Hata",
                "Yorumunuz silinirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin."
              );
            }
          } catch (error: any) {
            Alert.alert(
              "Hata",
              error.message || "Yorum silinirken bir hata oluştu."
            );
          } finally {
            setIsSubmitting(false);
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
          let userProfileImage =
            "https://randomuser.me/api/portraits/lego/1.jpg";

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
          const isOwnRating = myRating?.id === rating.id;

          return (
            <Box key={rating.id} style={styles.commentItem}>
              <HStack style={styles.commentHeader}>
                <Image
                  source={{ uri: userProfileImage }}
                  style={styles.userAvatar}
                />
                <VStack style={{ flex: 1 }}>
                  <Text style={styles.userName}>{userFullName}</Text>
                  <HStack>
                    <RatingStars
                      value={ratingValue}
                      size={16}
                      disabled={true}
                    />
                    <Text style={styles.commentDate}>
                      {new Date(rating.created_at).toLocaleDateString("tr-TR")}
                    </Text>
                  </HStack>
                </VStack>

                {isOwnRating && (
                  <TouchableOpacity
                    onPress={() => {
                      setUserRating(ratingValue);
                      setUserComment(commentText);
                      setIsEditMode(true);
                    }}
                  >
                    <Edit2 size={18} color="#64748B" />
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

            {event.requirements && (
              <VStack style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Gereksinimler</Text>
                <Text style={styles.description}>{event.requirements}</Text>
              </VStack>
            )}

            {event.notes && (
              <VStack style={styles.infoSection}>
                <Text style={styles.sectionTitle}>Notlar</Text>
                <Text style={styles.description}>{event.notes}</Text>
              </VStack>
            )}
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
            {/* Ortalama Puan */}
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
                <Text style={styles.averageRatingText}>
                  {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                </Text>
                <RatingStars
                  value={Math.round(averageRating)}
                  disabled={true}
                />
                <Text style={styles.ratingCountText}>
                  ({ratings.length} değerlendirme)
                </Text>
              </HStack>
            </VStack>

            {/* Kullanıcı Yorum Formu */}
            {isJoined && (
              <VStack style={styles.commentFormContainer}>
                <Text style={styles.sectionTitle}>
                  {isEditMode ? "Yorumunuzu Düzenleyin" : "Yorum Ekleyin"}
                </Text>

                <HStack style={styles.ratingInputContainer}>
                  <Text style={styles.ratingLabel}>Puanınız:</Text>
                  <RatingStars
                    value={userRating}
                    onValueChange={setUserRating}
                  />
                  {userRating > 0 && (
                    <Text style={styles.selectedRatingText}>
                      {userRating}/5
                    </Text>
                  )}
                </HStack>

                <TextInput
                  style={styles.commentInput}
                  placeholder="Etkinlik hakkında düşüncelerinizi paylaşın..."
                  value={userComment}
                  onChangeText={setUserComment}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor="#94A3B8"
                  maxLength={500}
                />
                <Text style={styles.charCountText}>
                  {userComment.length}/500
                </Text>

                <HStack style={styles.commentActionsContainer}>
                  {isEditMode && (
                    <TouchableOpacity
                      style={[
                        styles.commentActionButton,
                        { backgroundColor: "#EF4444" },
                      ]}
                      onPress={handleDeleteRating}
                      disabled={isSubmitting}
                    >
                      <Trash2 size={18} color="#FFFFFF" />
                      <Text style={styles.actionButtonText}>Sil</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.commentActionButton,
                      { backgroundColor: theme.primary },
                      (userRating === 0 ||
                        !userComment ||
                        userComment.trim() === "") && { opacity: 0.5 },
                    ]}
                    onPress={handleSubmitRating}
                    disabled={
                      isSubmitting ||
                      userRating === 0 ||
                      !userComment ||
                      userComment.trim() === ""
                    }
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Send size={18} color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>
                          {isEditMode ? "Güncelle" : "Gönder"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </HStack>
              </VStack>
            )}

            {/* Yorumlar Listesi */}
            {renderComments()}

            {!isJoined && (
              <VStack style={styles.joinToCommentContainer}>
                <TouchableOpacity
                  style={styles.joinToCommentButton}
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

  return (
    <SafeAreaView style={styles.container}>
      {renderParticipantsModal()}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Etkinlik Resmi */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.eventImage}
            resizeMode="cover"
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
              source={{ uri: event.organizer.logoUrl }}
              style={styles.organizerLogo}
            />
            <Text style={styles.organizerName}>{event.organizer.name}</Text>
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
              {typeof event.averageRating === "number" &&
              event.averageRating > 0 ? (
                <HStack style={styles.tabRatingBadge}>
                  <Star size={10} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.tabRatingText}>
                    {event.averageRating.toFixed(1)}
                  </Text>
                </HStack>
              ) : null}
            </HStack>
          </TouchableOpacity>
        </HStack>

        {/* Sekme İçeriği */}
        {renderTabContent()}
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
    alignItems: "center",
  },
  organizerLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  organizerName: {
    fontSize: 14,
    color: "#64748B",
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
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    padding: 24,
  },
  commentsText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    padding: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  participantsList: {
    maxHeight: 400,
  },
  participantItem: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  participantImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  participantName: {
    fontSize: 16,
    color: "#0F172A",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 12,
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  ratingInputContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#334155",
    marginRight: 8,
  },
  commentInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 100,
    textAlignVertical: "top",
  },
  commentActionsContainer: {
    justifyContent: "flex-end",
    marginTop: 12,
  },
  commentActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 6,
  },
  commentsList: {
    marginTop: 16,
  },
  commentItem: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  commentHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 12,
    color: "#94A3B8",
    marginLeft: 8,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
  },
  noCommentsText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    padding: 20,
  },
  noCommentsSubtext: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
  },
  joinToCommentContainer: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  joinToCommentButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 24,
    backgroundColor: "#10B981",
  },
  joinToCommentButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  joinToCommentText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    padding: 16,
  },
  emptyCommentsContainer: {
    alignItems: "center",
    padding: 20,
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
  selectedRatingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 8,
  },
  charCountText: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "right",
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
});

export default EventDetailComponent;
