import React, { useState, useEffect, useCallback } from "react";
import { View, SafeAreaView, StyleSheet, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { EventDetailComponent } from "@/components/dashboard";
import { Alert } from "react-native";
import { eventsApi } from "../../../services/api/events";
import { useFocusEffect } from "@react-navigation/native";
import eventBus from "@/src/utils/EventBus";
import eventRatingService from "@/src/api/eventRatingService";

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
    name: string;
    profileImage: string;
  }[];
  averageRating: number;
}

// API'den gelen etkinlik yanıtı
interface EventApiResponse {
  id: number;
  sport_id: number;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  location_latitude: number;
  location_longitude: number;
  max_participants: number;
  status: string;
  created_at: string;
  updated_at: string;
  creator_id: string;
  creator_name: string;
  creator_role: string;
  current_participants: number;
  is_full: boolean;
  sport: {
    id: number;
    icon: string;
    name: string;
    description: string;
  };
  sport_category: string;
  user_joined?: boolean;
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

  // API'den gelen etkinlik detayları değiştiğinde component'i güncelle
  useEffect(() => {
    if (eventDetail) {
      console.log("Etkinlik katılım durumu güncellendi:", eventDetail.isJoined);
    }
  }, [eventDetail?.isJoined]);

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
      const apiEvent = await eventsApi.getEventDetail(eventId);

      if (apiEvent) {
        console.log("Etkinlik detayları başarıyla alındı:", apiEvent.id);

        // Kategori adını daha iyi tespit et
        let sportName = "";

        // Sport objesi varsa, name alanını kontrol et
        if (apiEvent.sport && apiEvent.sport.name) {
          sportName = apiEvent.sport.name;
          console.log("Spor kategorisi (sport.name):", sportName);
        }
        // Sport_category varsa ve sport.name yoksa
        else if (apiEvent.sport_category) {
          sportName = apiEvent.sport_category;
          console.log("Spor kategorisi (sport_category):", sportName);
        }
        // Sport_name varsa ve diğerleri yoksa
        else if (apiEvent.sport_name) {
          sportName = apiEvent.sport_name;
          console.log("Spor kategorisi (sport_name):", sportName);
        }

        // Kategori ismini standartlaştır
        const sportCategory = normalizeSportCategoryName(sportName || "Diğer");
        console.log("Normalize edilmiş spor kategorisi:", sportCategory);

        // Katılımcıları getir
        let participants: any[] = [];
        try {
          participants = await eventsApi.getEventParticipants(eventId);
          console.log(`${participants.length} katılımcı bilgisi alındı`);

          // Kullanıcının katılımcılar listesinde olup olmadığını kontrol et
          const currentUserId = await eventsApi.getCurrentUserId();
          console.log("Mevcut kullanıcı ID:", currentUserId);

          if (currentUserId) {
            const isCurrentUserParticipant = participants.some(
              (p) => p.user_id === currentUserId || p.id === currentUserId
            );

            // Eğer kullanıcı katılımcı listesindeyse ve API'den user_joined false geldiyse, user_joined'ı true olarak ayarla
            if (isCurrentUserParticipant && !apiEvent.user_joined) {
              console.log(
                "Kullanıcı katılımcı listesinde bulundu, isJoined true olarak ayarlanıyor"
              );
              apiEvent.user_joined = true;
            }

            // Etkinliğin yaratıcısı mı kontrol et
            const isCreator = apiEvent.creator_id === currentUserId;
            console.log("Kullanıcı etkinliğin yaratıcısı mı:", isCreator);
          }
        } catch (err) {
          console.log("Katılımcılar alınırken hata oluştu:", err);
        }

        // Mevcut kullanıcının ID'sini al
        const currentUserId = await eventsApi.getCurrentUserId();

        // Ortalama puanı getir
        let avgRating = 0;
        try {
          avgRating = await eventRatingService.getAverageRating(eventId);
          console.log("Etkinlik ortalama puanı:", avgRating);
        } catch (err) {
          console.error("Ortalama puan alınırken hata:", err);
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
          imageUrl: getSportImage(sportCategory),
          participants: participants.map((p) => ({
            id: p.user_id || p.id,
            name: p.full_name || p.name,
            profileImage:
              p.profile_picture ||
              "https://randomuser.me/api/portraits/men/32.jpg",
          })),
          averageRating: avgRating,
        };

        setEventDetail(formattedEvent);
        console.log(
          "Etkinlik detayları başarıyla güncellendi, isJoined:",
          formattedEvent.isJoined
        );
        console.log("Etkinlik durumu:", formattedEvent.status);
        console.log(
          "Kullanıcının kendi etkinliği mi:",
          formattedEvent.isOwnEvent
        );
      } else {
        setError("Etkinlik bulunamadı");
      }
    } catch (err: any) {
      console.error("Etkinlik detayları alınırken hata:", err);
      setError(err?.message || "Etkinlik detayları yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Kategori ismini standartlaştır (büyük/küçük harf farklılıklarını gider)
  const normalizeSportCategoryName = (sportName: string): string => {
    if (!sportName) return "Diğer";

    // Tüm kategorileri küçük harfe çevirip kontrol et
    const normalizedName = sportName.trim().toLowerCase();

    // Standart kategori isimleri - tam eşleşmeler
    const standardCategories: Record<string, string> = {
      yüzme: "Yüzme",
      yürüyüş: "Yürüyüş",
      yoga: "Yoga",
      voleybol: "Voleybol",
      tenis: "Tenis",
      koşu: "Koşu",
      futbol: "Futbol",
      bisiklet: "Bisiklet",
      basketbol: "Basketbol",
      yuzme: "Yüzme", // Türkçe karakter olmadan
      yuruyu: "Yürüyüş", // Türkçe karakter olmadan
      yuruyus: "Yürüyüş", // Türkçe karakter olmadan
      kosu: "Koşu", // Türkçe karakter olmadan
      kosma: "Koşu", // Alternatif isim
      "dağ bisikleti": "Bisiklet", // Alt kategoriler
      mtb: "Bisiklet", // Mountain bike
      "yol bisikleti": "Bisiklet",
      "yüzme yarışı": "Yüzme",
      "halı saha": "Futbol",
      "salon futbolu": "Futbol",
      "5 vs 5": "Futbol",
    };

    // Eğer tam eşleşme varsa, standart kategoriyi döndür
    if (standardCategories[normalizedName]) {
      return standardCategories[normalizedName];
    }

    // Tam eşleşme yoksa içerik analizi yap
    for (const [key, value] of Object.entries(standardCategories)) {
      if (normalizedName.includes(key)) {
        return value;
      }
    }

    // Özel kontroller
    if (
      normalizedName.includes("bike") ||
      normalizedName.includes("bisiklet") ||
      normalizedName.includes("cycling") ||
      normalizedName.includes("bicycle")
    ) {
      return "Bisiklet";
    }

    if (normalizedName.includes("yüz") || normalizedName.includes("swim")) {
      return "Yüzme";
    }

    if (normalizedName.includes("koş") || normalizedName.includes("run")) {
      return "Koşu";
    }

    if (
      normalizedName.includes("futbol") ||
      normalizedName.includes("soccer") ||
      normalizedName.includes("football")
    ) {
      return "Futbol";
    }

    if (
      normalizedName.includes("basketbol") ||
      normalizedName.includes("basket") ||
      normalizedName.includes("basketball")
    ) {
      return "Basketbol";
    }

    if (normalizedName.includes("tenis") || normalizedName.includes("tennis")) {
      return "Tenis";
    }

    if (
      normalizedName.includes("voleybol") ||
      normalizedName.includes("volleyball")
    ) {
      return "Voleybol";
    }

    if (normalizedName.includes("yoga")) {
      return "Yoga";
    }

    if (
      normalizedName.includes("yürü") ||
      normalizedName.includes("walk") ||
      normalizedName.includes("hiking") ||
      normalizedName.includes("dağ yürüyüşü")
    ) {
      return "Yürüyüş";
    }

    // Eğer hala eşleşme bulunamadıysa, ilk harfi büyük yap ve döndür
    return sportName.charAt(0).toUpperCase() + sportName.slice(1);
  };

  // Tarih formatını düzenle: 2023-05-15 -> 15 Mayıs
  const formatDate = (dateStr: string): string => {
    try {
      if (!dateStr) return "Belirtilmemiş";

      // "T" karakterini içeriyorsa, sadece tarih kısmını al
      if (dateStr.includes("T")) {
        dateStr = dateStr.split("T")[0];
      }

      const date = new Date(dateStr);

      // Geçerli bir tarih kontrolü
      if (isNaN(date.getTime())) {
        return dateStr || "Belirtilmemiş";
      }

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
    } catch (e) {
      console.error("Tarih formatlanırken hata:", e);
      return dateStr || "Belirtilmemiş";
    }
  };

  // Zaman aralığını formatla: 14:00:00 - 16:00:00 -> 14:00-16:00
  const formatTimeRange = (startTime: string, endTime: string): string => {
    try {
      if (!startTime || !endTime) return "Belirtilmemiş";

      const formatTime = (timeStr: string) => {
        // Zaman formatını kontrol et ve düzelt
        if (!timeStr) return "00:00";

        // Sadece zaman kısmını al (eğer tarih-zaman formatındaysa)
        if (timeStr.includes("T")) {
          timeStr = timeStr.split("T")[1];
        }

        // İlk 5 karakteri al (HH:MM)
        if (timeStr.length >= 5) {
          return timeStr.substring(0, 5);
        }

        return timeStr;
      };

      return `${formatTime(startTime)}-${formatTime(endTime)}`;
    } catch (e) {
      console.error("Zaman formatlanırken hata:", e);
      return "Belirtilmemiş";
    }
  };

  // Spor kategorisine göre uygun bir görsel URL'si döndür
  const getSportImage = (sportName: string): string => {
    console.log("getSportImage fonksiyonu çağrıldı, kategori:", sportName);

    // Kategori görselleri
    const sportImages: Record<string, string> = {
      Basketbol:
        "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=2069&auto=format&fit=crop",
      Futbol:
        "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=2071&auto=format&fit=crop",
      Yüzme:
        "https://images.unsplash.com/photo-1560089000-7433a4ebbd64?q=80&w=2066&auto=format&fit=crop",
      Tenis:
        "https://images.unsplash.com/photo-1595435934949-5df7ed86e1c0?q=80&w=1974&auto=format&fit=crop",
      Voleybol:
        "https://images.unsplash.com/photo-1588492069485-d05b56b2831d?q=80&w=1974&auto=format&fit=crop",
      Koşu: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop",
      Yoga: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop",
      Bisiklet:
        "https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=2070&auto=format&fit=crop",
      Yürüyüş:
        "https://images.unsplash.com/photo-1501554728187-ce583db33af7?q=80&w=1935&auto=format&fit=crop",

      Diğer:
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070&auto=format&fit=crop",
    };

    if (sportImages[sportName]) {
      console.log("Kategori için spesifik görsel bulundu:", sportName);
      return sportImages[sportName];
    }

    // Kategori ismi içerisinde kelime arıyoruz
    const lowerCaseName = sportName.toLowerCase();

    if (
      lowerCaseName.includes("bisiklet") ||
      lowerCaseName.includes("bike") ||
      lowerCaseName.includes("cycling")
    ) {
      console.log("Bisiklet kategorisi tespit edildi:", sportName);
      return sportImages["Bisiklet"];
    }

    if (
      lowerCaseName.includes("basket") ||
      lowerCaseName.includes("basketball")
    ) {
      console.log("Basketbol kategorisi tespit edildi:", sportName);
      return sportImages["Basketbol"];
    }

    if (
      lowerCaseName.includes("futbol") ||
      lowerCaseName.includes("football") ||
      lowerCaseName.includes("soccer")
    ) {
      console.log("Futbol kategorisi tespit edildi:", sportName);
      return sportImages["Futbol"];
    }

    if (lowerCaseName.includes("yüz") || lowerCaseName.includes("swim")) {
      console.log("Yüzme kategorisi tespit edildi:", sportName);
      return sportImages["Yüzme"];
    }

    if (lowerCaseName.includes("koş") || lowerCaseName.includes("run")) {
      console.log("Koşu kategorisi tespit edildi:", sportName);
      return sportImages["Koşu"];
    }

    if (lowerCaseName.includes("tenis") || lowerCaseName.includes("tennis")) {
      console.log("Tenis kategorisi tespit edildi:", sportName);
      return sportImages["Tenis"];
    }

    if (
      lowerCaseName.includes("voleybol") ||
      lowerCaseName.includes("volleyball")
    ) {
      console.log("Voleybol kategorisi tespit edildi:", sportName);
      return sportImages["Voleybol"];
    }

    if (lowerCaseName.includes("yoga")) {
      console.log("Yoga kategorisi tespit edildi:", sportName);
      return sportImages["Yoga"];
    }

    if (
      lowerCaseName.includes("yürüyüş") ||
      lowerCaseName.includes("walk") ||
      lowerCaseName.includes("hiking")
    ) {
      console.log("Yürüyüş kategorisi tespit edildi:", sportName);
      return sportImages["Yürüyüş"];
    }

    console.log(
      "Kategoriye uygun görsel bulunamadı, varsayılan görsel kullanılıyor:",
      sportName
    );
    return sportImages["Diğer"];
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

  const handleBack = () => {
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
  };

  const handleJoinEvent = async (eventId: number) => {
    try {
      // Eğer etkinlik kullanıcının kendisine aitsse, işlemi engelle
      if (eventDetail.isOwnEvent) {
        Alert.alert(
          "Bilgi",
          "Kendi etkinliğinize katılamazsınız veya ayrılamazsınız."
        );
        return;
      }

      // Eğer etkinlik tamamlanmış, iptal edilmiş veya reddedilmişse işlemi engelle
      if (["COMPLETED", "CANCELLED", "REJECTED"].includes(eventDetail.status)) {
        Alert.alert(
          "Bilgi",
          `Bu etkinliğe katılamazsınız. Etkinlik durumu: ${eventDetail.status}`
        );
        return;
      }

      // Önce mevcut durumu kontrol et - katılmış mı yoksa ayrılacak mı?
      if (eventDetail.isJoined) {
        // Direkt olarak ayrılma onay fonksiyonunu çağır
        handleLeaveEvent(eventId);
        return;
      } else {
        // Yükleniyor durumunu göster
        setLoading(true);

        console.log(
          `Etkinliğe katılma işlemi başlatılıyor. Etkinlik ID: ${eventId}`
        );

        try {
          // Katılma işlemi - POST /api/events/{id}/join
          console.log(
            `POST /api/events/${eventId}/join endpoint'ine istek gönderiliyor...`
          );
          const result = await eventsApi.joinEvent(String(eventId));
          console.log("Katılma işlemi sonucu:", result);

          // "Zaten katıldınız" hatası için kontrol - önce bu kontrolü yapalım
          if (
            result.status === "error" &&
            (result.message?.includes("zaten katıl") ||
              result.data?.message?.includes("zaten katıl") ||
              (typeof result.data === "object" &&
                result.data?.message?.includes("zaten katıl")))
          ) {
            console.log("Kullanıcı zaten etkinliğe katılmış (1. kontrol)");
            // Etkinlik durumunu direkt güncelle
            const updatedEventDetail = {
              ...eventDetail,
              isJoined: true,
            };
            setEventDetail(updatedEventDetail);

            // Etkinlik listesinin güncellenmesi için bildirim yayınla
            eventBus.publish("EVENT_PARTICIPATION_CHANGED", eventId);
            console.log("Katılım değişikliği bildirimi yayınlandı");

            Alert.alert("Bilgi", "Bu etkinliğe zaten katılmışsınız.", [
              {
                text: "Tamam",
                onPress: () => console.log("Kullanıcı bilgiyi onayladı"),
              },
            ]);

            setLoading(false);
            return;
          }
          // İşlem başarılıysa
          else if (result.status === "success") {
            // Etkinlik durumunu direkt güncelle
            const updatedEventDetail = {
              ...eventDetail,
              isJoined: true,
              participantCount: eventDetail.participantCount + 1,
            };
            setEventDetail(updatedEventDetail);

            // Etkinlik listesinin güncellenmesi için bildirim yayınla
            eventBus.publish("EVENT_PARTICIPATION_CHANGED", eventId);
            console.log("Katılım değişikliği bildirimi yayınlandı");

            Alert.alert(
              "Etkinliğe Katıldınız",
              "Etkinliğe başarıyla katıldınız. Etkinlik saati yaklaştığında bildirim alacaksınız.",
              [
                {
                  text: "Tamam",
                  onPress: () => console.log("Kullanıcı bilgiyi onayladı"),
                },
              ]
            );

            setLoading(false);
            return;
          }
        } catch (apiError: any) {
          console.log("API isteği hatası:", apiError);

          // Axios hata yanıtından veri çıkarma
          const errorResponse = apiError?.response?.data;
          console.log("Hata yanıtı:", errorResponse);

          // "Zaten katıldınız" hatası işleme
          if (
            errorResponse?.data?.message?.includes("zaten katıl") ||
            errorResponse?.message?.includes("zaten katıl") ||
            apiError.message?.includes("zaten katıl") ||
            (typeof errorResponse?.data === "object" &&
              errorResponse?.data?.message?.includes("zaten katıl"))
          ) {
            console.log("Kullanıcı zaten etkinliğe katılmış (2. kontrol)");

            // Etkinlik durumunu direkt güncelle
            const updatedEventDetail = {
              ...eventDetail,
              isJoined: true,
            };
            setEventDetail(updatedEventDetail);

            Alert.alert("Bilgi", "Bu etkinliğe zaten katılmışsınız.", [
              {
                text: "Tamam",
                onPress: () => console.log("Kullanıcı bilgiyi onayladı"),
              },
            ]);

            setLoading(false);
            return;
          }

          // Etkinlik durumu hatası (iptal edilmiş, reddedilmiş vb.)
          if (
            errorResponse?.data?.message?.includes("Etkinlik durumu") ||
            errorResponse?.message?.includes("Etkinlik durumu")
          ) {
            Alert.alert(
              "Bilgi",
              errorResponse?.data?.message || errorResponse?.message,
              [
                {
                  text: "Tamam",
                  onPress: () => console.log("Kullanıcı bilgiyi onayladı"),
                },
              ]
            );

            setLoading(false);
            return;
          }

          // Diğer API hataları için yeniden throw et
          throw apiError;
        }

        // Diğer tüm başarılı durumlar için etkinlik detaylarını yeniden yükle
        await fetchEventDetails();
      }
    } catch (err: any) {
      console.error("Etkinliğe katılırken hata oluştu:", err);
      console.log("API çağrısı sırasında hata:", err.message);

      // Hata mesajını daha anlaşılır hale getir
      let errorMessage = "İşlem gerçekleştirilemedi. Lütfen tekrar deneyin.";

      // Hatayı kullanıcı tarafından anlaşılabilir hale getir
      if (err.message?.includes("limit")) {
        errorMessage = "Bu etkinlik için katılımcı limiti dolmuş.";
      } else if (err.message?.includes("zaten katıl")) {
        // "Zaten katıldınız" hatası için UI'ı güncelle ve kullanıcıya bildir
        const updatedEventDetail = {
          ...eventDetail,
          isJoined: true,
        };
        setEventDetail(updatedEventDetail);

        errorMessage = "Bu etkinliğe zaten katılmışsınız.";
      } else if (err.message?.includes("katılmadığınız için")) {
        errorMessage = "Bu etkinliğe katılmadığınız için ayrılamazsınız.";
      } else if (err.message?.includes("permission")) {
        errorMessage = "Bu işlemi gerçekleştirmek için yetkiniz yok.";
      } else if (
        err.message?.includes("network") ||
        err.message?.includes("internet")
      ) {
        errorMessage = "İnternet bağlantınızı kontrol edin ve tekrar deneyin.";
      }

      Alert.alert("Bilgi", errorMessage, [
        {
          text: "Tamam",
          onPress: () => console.log("Kullanıcı hata bildirimini onayladı"),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Etkinlikten ayrılma işlemi
  const handleLeaveEvent = async (eventId: number) => {
    try {
      // Eğer etkinlik kullanıcının kendisine aitsse, işlemi engelle
      if (eventDetail.isOwnEvent) {
        Alert.alert("Bilgi", "Kendi etkinliğinizden ayrılamazsınız.");
        return;
      }

      // Eğer etkinlik tamamlanmış, iptal edilmiş veya reddedilmişse işlemi engelle
      if (["COMPLETED", "CANCELLED", "REJECTED"].includes(eventDetail.status)) {
        Alert.alert(
          "Bilgi",
          `Bu etkinlikten ayrılamazsınız. Etkinlik durumu: ${eventDetail.status}`
        );
        return;
      }

      // Ayrılmayı onaylat - confirm() yerine Alert.alert() kullan
      Alert.alert(
        "Etkinlikten Ayrılma",
        "Etkinlikten ayrılmak istediğinize emin misiniz?",
        [
          {
            text: "Vazgeç",
            style: "cancel",
            onPress: () => {
              console.log("Kullanıcı etkinlikten ayrılmayı iptal etti");
            },
          },
          {
            text: "Ayrıl",
            style: "destructive",
            onPress: async () => {
              // Ayrılma işlemine devam et
              await processLeaveEvent(eventId);
            },
          },
        ]
      );
    } catch (err: any) {
      console.error("Etkinlikten ayrılma onayı sırasında hata:", err);
      Alert.alert(
        "Hata",
        "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin."
      );
    }
  };

  // Ayrılma işlemini gerçekleştiren fonksiyon
  const processLeaveEvent = async (eventId: number) => {
    try {
      // Yükleniyor durumunu göster
      setLoading(true);

      console.log(
        `Etkinlikten ayrılma işlemi başlatılıyor. Etkinlik ID: ${eventId}`
      );

      // Ayrılma işlemi - POST /api/events/{id}/leave
      console.log(
        `POST /api/events/${eventId}/leave endpoint'ine istek gönderiliyor...`
      );
      const result = await eventsApi.leaveEvent(String(eventId));
      console.log("Ayrılma işlemi sonucu:", result);

      // İşlem başarılıysa veya "zaten ayrılmışsınız" hatası geldiyse
      if (
        result.status === "success" ||
        (result.status === "error" &&
          result.message?.includes("katılmadığınız için"))
      ) {
        // Etkinlik durumunu direkt güncelle
        const updatedEventDetail = {
          ...eventDetail,
          isJoined: false,
          participantCount: Math.max(0, eventDetail.participantCount - 1),
        };
        setEventDetail(updatedEventDetail);

        // Etkinlik listesinin güncellenmesi için bildirim yayınla
        eventBus.publish("EVENT_PARTICIPATION_CHANGED", eventId);
        console.log("Katılım değişikliği bildirimi yayınlandı");

        Alert.alert(
          "Etkinlikten Ayrıldınız",
          "Etkinlikten başarıyla ayrıldınız.",
          [
            {
              text: "Tamam",
              onPress: () => console.log("Kullanıcı bilgiyi onayladı"),
            },
          ]
        );

        setLoading(false);
        return;
      }
    } catch (apiError: any) {
      console.log("API isteği hatası:", apiError);

      // Axios hata yanıtından veri çıkarma
      const errorResponse = apiError?.response?.data;
      console.log("Hata yanıtı:", errorResponse);

      // "Katılmadığınız için ayrılamazsınız" hatası işleme
      if (
        errorResponse?.data?.message?.includes("katılmadığınız için") ||
        errorResponse?.message?.includes("katılmadığınız için")
      ) {
        console.log("Kullanıcı etkinliğe katılmamış");

        // Etkinlik durumunu direkt güncelle
        const updatedEventDetail = {
          ...eventDetail,
          isJoined: false,
        };
        setEventDetail(updatedEventDetail);

        Alert.alert(
          "Bilgi",
          "Bu etkinliğe katılmadığınız için ayrılamazsınız.",
          [
            {
              text: "Tamam",
              onPress: () => console.log("Kullanıcı bilgiyi onayladı"),
            },
          ]
        );

        setLoading(false);
        return;
      }

      // Etkinlik durumu hatası (iptal edilmiş, reddedilmiş vb.)
      if (
        errorResponse?.data?.message?.includes("Etkinlik durumu") ||
        errorResponse?.message?.includes("Etkinlik durumu")
      ) {
        Alert.alert(
          "Bilgi",
          errorResponse?.data?.message || errorResponse?.message,
          [
            {
              text: "Tamam",
              onPress: () => console.log("Kullanıcı bilgiyi onayladı"),
            },
          ]
        );

        setLoading(false);
        return;
      }

      // Diğer genel hatalar için
      let errorMessage = "İşlem gerçekleştirilemedi. Lütfen tekrar deneyin.";

      // Hatayı kullanıcı tarafından anlaşılabilir hale getir
      if (apiError.message?.includes("permission")) {
        errorMessage = "Bu işlemi gerçekleştirmek için yetkiniz yok.";
      } else if (
        apiError.message?.includes("network") ||
        apiError.message?.includes("internet")
      ) {
        errorMessage = "İnternet bağlantınızı kontrol edin ve tekrar deneyin.";
      }

      Alert.alert("Bilgi", errorMessage, [
        {
          text: "Tamam",
          onPress: () => console.log("Kullanıcı hata bildirimini onayladı"),
        },
      ]);

      setLoading(false);
      return;
    }

    // Diğer tüm başarılı durumlar için etkinlik detaylarını yeniden yükle
    await fetchEventDetails();
    setLoading(false);
  };

  const handleContactOrganizer = (organizerId: number | string) => {
    // Organizatör DM sayfasına yönlendir
    router.push({
      pathname: "/messages/[id]",
      params: { id: organizerId },
    });
  };

  const handleShareEvent = (eventId: number) => {
    Alert.alert(
      "Paylaş",
      `${eventDetail.title} etkinliğini paylaşmak için bir platform seçin.`,
      [{ text: "Tamam", onPress: () => console.log("OK") }]
    );
  };

  return (
    <EventDetailComponent
      event={eventDetail}
      onBack={handleBack}
      onJoin={handleJoinEvent}
      onContactOrganizer={handleContactOrganizer}
      onShareEvent={handleShareEvent}
    />
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
  },
  loadingText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    marginTop: 12,
  },
});
