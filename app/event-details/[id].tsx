import React, { useState, useEffect, useCallback } from "react";
import { View, SafeAreaView, StyleSheet, Text, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { EventDetailComponent } from "../../components/dashboard";
import { eventsApi } from "../../services/api/events";
import { useFocusEffect } from "@react-navigation/native";
import eventRatingService from "../../src/api/eventRatingService";
import { getSportImage } from "../../utils/imageUtils";

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
  isJoined: boolean;
  isOwnEvent: boolean; // Kullanıcının kendi etkinliği mi
  status: string; // Etkinlik durumu
  organizer: {
    id: number | string;
    name: string;
    isVerified: boolean;
    logoUrl: string;
  };
  description: string;
  requirements?: string;
  notes?: string;
  imageUrl: string;
  participants?: {
    id: number | string;
    user_id?: string;
    name: string;
    full_name?: string;
    profileImage: string;
    profile_image?: string;
    profile_picture?: string;
  }[];
  averageRating: number;
}

export default function EventDetailsScreen() {
  const params = useLocalSearchParams();
  const eventId = params.id as string;
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Etkinlik detaylarını API'den getir
    fetchEventDetails();
  }, [eventId]);

  // Sayfa focus olduğunda etkinlik detaylarını yenile
  useFocusEffect(
    useCallback(() => {
      console.log(
        "Etkinlik sayfası focus oldu, etkinlik detayları yenileniyor..."
      );
      fetchEventDetails();

      return () => {
        // Cleanup function
      };
    }, [eventId])
  );

  // API'den etkinlik detaylarını getiren fonksiyon
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Etkinlik ID:", eventId);

      if (!eventId) {
        setError("Etkinlik ID'si bulunamadı");
        setLoading(false);
        return;
      }

      // API'den etkinlik detaylarını al
      console.log(`Etkinlik detayı getiriliyor: ${eventId}`);
      const apiEvent = await eventsApi.getEventDetail(eventId);

      if (!apiEvent) {
        console.error("Etkinlik detayları alınamadı: null yanıt");
        setError("Etkinlik detayları bulunamadı");
        setLoading(false);
        return;
      }

      console.log("Etkinlik detayları başarıyla alındı:", apiEvent.id);

      // Kategori adını daha iyi tespit et
      let sportName = "";

      // Sport objesi varsa, name alanını kontrol et
      if (apiEvent.sport && apiEvent.sport.name) {
        sportName = apiEvent.sport.name;
      }
      // Sport_category varsa ve sport.name yoksa
      else if (apiEvent.sport_category) {
        sportName = apiEvent.sport_category;
      }

      // Kategori ismini standartlaştır
      const sportCategory = normalizeSportCategoryName(sportName || "Diğer");

      // Katılımcıları getir
      let participants: any[] = [];
      try {
        if (!eventId) {
          console.error("Katılımcılar için geçersiz eventId");
        } else {
          console.log(
            `${eventId} ID'li etkinlik için katılımcılar getiriliyor...`
          );
          participants = await eventsApi.getEventParticipants(eventId);
          console.log(`${participants.length} katılımcı başarıyla getirildi`);

          // Kullanıcının katılımcılar listesinde olup olmadığını kontrol et
          const currentUserId = await eventsApi.getCurrentUserId();

          if (currentUserId) {
            const isCurrentUserParticipant = participants.some(
              (p) => p.user_id === currentUserId || p.id === currentUserId
            );

            // Eğer kullanıcı katılımcı listesindeyse ve API'den user_joined false geldiyse, user_joined'ı true olarak ayarla
            if (isCurrentUserParticipant && !apiEvent.user_joined) {
              console.log(
                "Kullanıcı katılımcılar listesinde bulundu fakat API 'user_joined' değeri false, düzeltiliyor"
              );
              apiEvent.user_joined = true;
            }
          }
        }
      } catch (err) {
        console.error("Katılımcılar alınırken hata oluştu:", err);
        // Katılımcılarda hata olursa işlemi devam ettir, bu kritik bir hata değil
        participants = [];
      }

      // Mevcut kullanıcının ID'sini al
      const currentUserId = await eventsApi.getCurrentUserId();

      // Ortalama puanı getir
      let avgRating = 0;
      try {
        console.log(
          `${eventId} ID'li etkinlik için ortalama puan getiriliyor...`
        );

        if (!eventId) {
          console.error("getAverageRating için geçersiz eventId:", eventId);
        } else {
          avgRating = await eventRatingService.getAverageRating(eventId);
          console.log(`Ortalama puan başarıyla alındı: ${avgRating}`);
        }
      } catch (err) {
        console.error("Ortalama puan alınırken hata oluştu:", err);
        // Hata durumunda varsayılan değeri kullan
        avgRating = 0;
      }

      // Etkinlik resmini belirle - önce API'den gelen resim varsa onu kullan, yoksa kategori bazlı resim getir
      let eventImageUrl = "";
      if (
        apiEvent.image_url &&
        typeof apiEvent.image_url === "string" &&
        apiEvent.image_url.startsWith("http")
      ) {
        // API'den gelen resim var ve geçerli bir URL
        console.log(
          "Etkinlik için API'den resim kullanılıyor:",
          apiEvent.image_url
        );
        eventImageUrl = apiEvent.image_url;
      } else if (
        apiEvent.sport &&
        apiEvent.sport.image_url &&
        typeof apiEvent.sport.image_url === "string" &&
        apiEvent.sport.image_url.startsWith("http")
      ) {
        // Spor kategorisinin resmi var
        console.log(
          "Spor kategorisi resmi kullanılıyor:",
          apiEvent.sport.image_url
        );
        eventImageUrl = apiEvent.sport.image_url;
      } else {
        // Kategoriye göre resim getir
        console.log("Kategori bazlı resim kullanılıyor:", sportCategory);
        eventImageUrl = getSportImage(sportCategory);
      }

      // API'den gelen veriyi UI formatına dönüştür
      const formattedEvent: EventDetail = {
        id: Number(apiEvent.id),
        title: apiEvent.title || "İsimsiz Etkinlik",
        category: sportCategory,
        date: formatDate(apiEvent.event_date),
        time: formatTimeRange(apiEvent.start_time, apiEvent.end_time),
        location: apiEvent.location_name || "Belirtilmemiş",
        coordinates: {
          latitude: Number(apiEvent.location_latitude) || 0,
          longitude: Number(apiEvent.location_longitude) || 0,
        },
        participantCount: apiEvent.current_participants || 0,
        maxParticipants: apiEvent.max_participants || 10,
        isJoined: apiEvent.user_joined || false,
        isOwnEvent: apiEvent.creator_id === currentUserId, // Kendi etkinliği mi
        status: apiEvent.status || "ACTIVE", // Etkinlik durumu
        organizer: {
          id: apiEvent.creator_id || "1",
          name: apiEvent.creator_name || "Organizatör",
          isVerified: true,
          logoUrl: "https://randomuser.me/api/portraits/men/32.jpg",
        },
        description: apiEvent.description || "Açıklama bulunmuyor",
        requirements: sportCategory
          ? `Bu etkinlik için ${sportCategory} sporu kuralları geçerlidir.`
          : "Spor ayakkabı ve rahat kıyafet getirmeniz gerekli.",
        notes: "Etkinlik zamanında başlayacaktır, lütfen geç kalmayın.",
        imageUrl: eventImageUrl,
        participants: participants.map((p) => ({
          id: p.user_id || p.id || "",
          user_id: p.user_id || p.id,
          name: p.full_name || p.name || "İsimsiz Katılımcı",
          full_name: p.full_name || p.name || "İsimsiz Katılımcı",
          profileImage:
            p.profile_picture ||
            p.profile_image ||
            "https://randomuser.me/api/portraits/men/32.jpg",
          profile_image: p.profile_picture || p.profile_image,
          profile_picture: p.profile_picture,
        })),
        averageRating: avgRating,
      };

      setEventDetail(formattedEvent);
    } catch (err: any) {
      console.error("Etkinlik detayları alınırken hata:", err);
      setError(err?.message || "Etkinlik detayları yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Spor kategori ismini standartlaştır
  const normalizeSportCategoryName = (sportName: string): string => {
    const lowerName = sportName.toLowerCase().trim();

    if (lowerName.includes("futbol")) return "Futbol";
    if (lowerName.includes("basketbol") || lowerName.includes("basket"))
      return "Basketbol";
    if (lowerName.includes("voleybol") || lowerName.includes("voley"))
      return "Voleybol";
    if (lowerName.includes("tenis")) return "Tenis";
    if (lowerName.includes("yüzme") || lowerName.includes("swim"))
      return "Yüzme";
    if (lowerName.includes("koşu") || lowerName.includes("run")) return "Koşu";
    if (lowerName.includes("yoga")) return "Yoga";
    if (lowerName.includes("bisiklet") || lowerName.includes("cycling"))
      return "Bisiklet";
    if (lowerName.includes("yürüyüş") || lowerName.includes("hiking"))
      return "Yürüyüş";
    if (lowerName.includes("okçuluk")) return "Okçuluk";
    if (lowerName.includes("akıl") || lowerName.includes("zeka"))
      return "Akıl Oyunları";

    return sportName;
  };

  // Tarih formatla
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Geçersiz tarih";

      const day = date.getDate();
      const monthNames = [
        "Ocak",
        "Şubat",
        "Mart",
        "Nisan",
        "Mayıs",
        "Haziran",
        "Temmuz",
        "Ağustos",
        "Eylül",
        "Ekim",
        "Kasım",
        "Aralık",
      ];
      const month = monthNames[date.getMonth()];

      return `${day} ${month}`;
    } catch (error) {
      console.error("Tarih formatlanırken hata:", error);
      return "Geçersiz tarih";
    }
  };

  // Saat aralığı formatla
  const formatTimeRange = (startTime: string, endTime: string): string => {
    try {
      // Saat formatla
      const formatTime = (timeStr: string) => {
        const date = new Date(timeStr);
        if (isNaN(date.getTime())) {
          // Direk saat:dakika formatında gelmiş olabilir
          if (typeof timeStr === "string" && timeStr.includes(":")) {
            return timeStr;
          }
          return "00:00";
        }

        return date.toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      };

      return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    } catch (error) {
      console.error("Saat formatlanırken hata:", error);
      return "Geçersiz saat";
    }
  };

  // Etkinlik katılım/ayrılma işlemi
  const handleJoinEvent = async (eventId: number) => {
    try {
      // Etkinlik ID'si kontrol et
      if (!eventId) {
        Alert.alert("Hata", "Etkinlik ID'si belirtilmemiş");
        return;
      }

      // Etkinlik bilgilerini kontrol et
      if (!eventDetail) {
        Alert.alert("Hata", "Etkinlik bilgileri bulunamadı");
        return;
      }

      // Etkinlik dolu mu kontrol et
      if (
        eventDetail.participantCount >= eventDetail.maxParticipants &&
        !eventDetail.isJoined
      ) {
        Alert.alert(
          "Etkinlik Dolu",
          "Bu etkinlik maksimum katılımcı sayısına ulaştı."
        );
        return;
      }

      // Kullanıcı zaten katılmış mı kontrol et
      if (eventDetail.isJoined) {
        // Etkinlikten ayrılma işlemi
        await processLeaveEvent(eventId);
      } else {
        // Etkinliğe katılma işlemi
        await eventsApi.joinEvent(eventId.toString());

        // State'i güncelle
        setEventDetail({
          ...eventDetail,
          isJoined: true,
          participantCount: eventDetail.participantCount + 1,
        });

        // Başarı mesajı göster
        Alert.alert("Katılım Başarılı", "Etkinliğe başarıyla katıldınız!");
      }
    } catch (err: any) {
      console.error("Etkinliğe katılırken/ayrılırken hata:", err);
      Alert.alert(
        "Hata",
        err?.message || "Etkinliğe katılırken/ayrılırken bir hata oluştu"
      );
    }
  };

  // Etkinlikten ayrılma işlemini gerçekleştir
  const processLeaveEvent = async (eventId: number) => {
    try {
      await eventsApi.leaveEvent(eventId.toString());

      // State'i güncelle
      if (eventDetail) {
        setEventDetail({
          ...eventDetail,
          isJoined: false,
          participantCount: Math.max(0, eventDetail.participantCount - 1),
        });
      }

      // Başarı mesajı göster
      Alert.alert("Ayrılma Başarılı", "Etkinlikten başarıyla ayrıldınız");
    } catch (err: any) {
      console.error("Etkinlikten ayrılırken hata:", err);
      throw err;
    }
  };

  // Organizatörle iletişim
  const handleContactOrganizer = (organizerId: number | string) => {
    router.push(`/messages/${organizerId}`);
  };

  // Etkinliği paylaş
  const handleShareEvent = (eventId: number) => {
    Alert.alert(
      "Paylaş",
      `${eventDetail?.title} etkinliğini paylaşmak ister misiniz?`,
      [
        { text: "Vazgeç", style: "cancel" },
        { text: "Paylaş", onPress: () => console.log("Etkinlik paylaşıldı") },
      ]
    );
  };

  // Etkinlik henüz yüklenmediyse yükleniyor göster
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Etkinlik yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Hata durumunda hata mesajını göster
  if (error || !eventDetail) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error || "Etkinlik bulunamadı"}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Normal görünüm
  return (
    <SafeAreaView style={styles.container}>
      <EventDetailComponent
        event={eventDetail}
        onJoin={handleJoinEvent}
        onContactOrganizer={handleContactOrganizer}
        onShareEvent={handleShareEvent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#0F172A",
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
});
