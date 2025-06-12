import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Animated,
} from "react-native";
import { router } from "expo-router";

// Bileşenler
import Header from "@/components/dashboard/Header";
import CurrentEvents from "@/components/dashboard/CurrentEvents";
import CategoryGrid from "@/components/dashboard/CategoryGrid";
import SearchModal from "@/components/dashboard/SearchModal";
import CreateEventButton from "@/components/dashboard/CreateEventButton";
import NewsSection from "@/components/dashboard/NewsSection";

// API ve Servisler
import { eventsApi } from "@/services/api/events";
import { sportsApi } from "@/services/api/sports";
import { showToast } from "@/src/utils/toastHelper";
import { useAuth } from "@/src/store/AuthContext";
import { fetchNews, News } from "@/services/newsService";

// Tema renkleri
const theme = {
  primary: "#10B981", // Ana yeşil
  primaryLight: "#D1FAE5", // Açık yeşil
  background: "#F8FAFC", // Arka plan
  surface: "#FFFFFF", // Yüzey
  text: "#0F172A", // Ana metin
  textSecondary: "#64748B", // İkincil metin
  border: "#E2E8F0", // Kenar çizgisi
};

// Konya koordinatları - Sabit lokasyon olarak kullanılacak
const KONYA_COORDINATES = {
  latitude: 37.8746,
  longitude: 32.4932,
};

// Dashboard bölümlerini tanımlama
enum SectionTypes {
  NEARBY_EVENTS = "nearby_events",
  CATEGORIES = "categories",
  POPULAR_EVENTS = "popular_events",
  NEWS_SECTION = "news_section",
}

// Bölüm veri tipi tanımı
interface SectionItem {
  type: SectionTypes;
  data: any;
}

export default function DashboardScreen() {
  // State tanımlamaları - Konya koordinatlarını başlangıç değeri olarak ayarla
  const [userCoordinates, setUserCoordinates] = useState(KONYA_COORDINATES);
  const [isLocationLoading, setIsLocationLoading] = useState(false); // Artık konum yüklenmeyeceği için false
  const [isLoading, setIsLoading] = useState(false);
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Scroll pozisyonu için Animated.Value
  const scrollY = useRef(new Animated.Value(0)).current;

  // Etkinlik ve kategori state'leri
  const [nearbyEvents, setNearbyEvents] = useState<any[]>([]);
  const [popularEvents, setPopularEvents] = useState<any[]>([]);
  const [sportCategories, setSportCategories] = useState<any[]>([]);
  const [sportCategoriesLoading, setSportCategoriesLoading] = useState(true);

  // Haberler state'i
  const [latestNews, setLatestNews] = useState<News[]>([]);

  // Bölüm verisi
  const [sections, setSections] = useState<SectionItem[]>([]);

  // Auth context'ten kullanıcı bilgisini al
  const { user } = useAuth();

  // Spor kategorilerini getir
  useEffect(() => {
    const fetchSportCategories = async () => {
      setSportCategoriesLoading(true);
      try {
        const sports = await sportsApi.getAllSports();

        if (Array.isArray(sports)) {
          // "Tümü" kategorisini ekle
          const allCategories = [
            { id: 0, name: "Tümü", icon: "🏆" },
            ...sports,
          ];

          setSportCategories(allCategories);
        } else {
          console.error(
            "API geçersiz spor kategorisi verisi döndürdü:",
            sports
          );
        }
      } catch (error) {
        console.error("Spor kategorileri getirilirken hata oluştu:", error);
        showToast("Spor kategorileri yüklenemedi", "error");
      } finally {
        setSportCategoriesLoading(false);
      }
    };

    fetchSportCategories();
  }, []);

  // Konya koordinatları ile etkinlikleri direkt yükle
  useEffect(() => {
    console.log(
      "Konya koordinatları ile etkinlikler yükleniyor:",
      KONYA_COORDINATES
    );
    fetchEvents();
  }, []);

  // Haberleri getir
  useEffect(() => {
    fetchLatestNews();
  }, []);

  // Sections verisini güncelle
  useEffect(() => {
    const sectionsData: SectionItem[] = [
      {
        type: SectionTypes.NEARBY_EVENTS,
        data: nearbyEvents,
      },
      {
        type: SectionTypes.CATEGORIES,
        data: sportCategories.slice(1, 9),
      },
      {
        type: SectionTypes.POPULAR_EVENTS,
        data: popularEvents,
      },
      {
        type: SectionTypes.NEWS_SECTION,
        data: latestNews,
      },
    ];

    setSections(sectionsData);
  }, [nearbyEvents, popularEvents, sportCategories, latestNews]);

  // Etkinlikleri getirme fonksiyonu - Konya koordinatları ile
  const fetchEvents = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      console.log("Konya'daki etkinlikler getiriliyor...");

      // Konya'daki etkinlikleri getir (10km çapında)
      const nearbyEventsData = await eventsApi.getNearbyEvents(
        KONYA_COORDINATES.latitude,
        KONYA_COORDINATES.longitude,
        10, // 10km mesafedeki etkinlikler
        1, // sayfa
        10 // limit
      );

      console.log(`Konya'da ${nearbyEventsData?.length || 0} etkinlik bulundu`);

      // Popüler etkinlikleri getir - sadece aktif olanları göster
      const popularEventsData = await eventsApi.getAllEvents(
        1, // sayfa
        10, // limit
        "events/status/active" // doğrudan aktif etkinlikler endpointi
      );

      // API yanıtlarını UI için dönüştür
      const mappedNearbyEvents = mapApiEventsToUIEvents(nearbyEventsData);
      const mappedPopularEvents = mapApiEventsToUIEvents(popularEventsData);

      setNearbyEvents(mappedNearbyEvents);
      setPopularEvents(mappedPopularEvents);

      // Başarı mesajı göster
      if (mappedNearbyEvents.length > 0) {
        console.log(
          `Konya'da ${mappedNearbyEvents.length} etkinlik listelendi`
        );
      }
    } catch (error) {
      console.error("Etkinlikler getirilirken hata oluştu:", error);
      showToast("Etkinlikler yüklenemedi", "error");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Haberleri getir
  const fetchLatestNews = async () => {
    setIsNewsLoading(true);

    try {
      const response = await fetchNews(0, 10); // İlk sayfa, 10 haber

      if (response.success && Array.isArray(response.data)) {
        console.log(`${response.data.length} haber başarıyla yüklendi`);
        setLatestNews(response.data);
      } else {
        console.error("Haberler başarısız yanıt:", response);
        setLatestNews([]);
      }
    } catch (error) {
      console.error("Haberler yüklenirken hata oluştu:", error);
      showToast("Haberler yüklenemedi", "error");
      setLatestNews([]);
    } finally {
      setIsNewsLoading(false);
    }
  };

  // API etkinliklerini UI formatına dönüştürme - Konya referanslı mesafe hesaplama
  const mapApiEventsToUIEvents = (apiEvents: any[]) => {
    if (!Array.isArray(apiEvents)) {
      console.error("API etkinlikleri bir dizi değil:", apiEvents);
      return [];
    }

    return apiEvents.map((event) => ({
      id: event.id.toString(),
      title: event.title,
      type: event.sport?.name || "Diğer",
      category: event.sport?.name || "Diğer",
      date: formatDateString(event.event_date),
      time: `${event.start_time} - ${event.end_time}`,
      location: event.location_name || "Konum belirtilmemiş",
      coordinates: {
        latitude: event.location_lat || 0,
        longitude: event.location_lng || 0,
      },
      distance: calculateDistance(
        KONYA_COORDINATES.latitude,
        KONYA_COORDINATES.longitude,
        event.location_lat,
        event.location_lng
      ),
      participantCount: event.current_participants || 0,
      maxParticipants: event.max_participants || 10,
      isJoined: event.is_joined || false,
      organizer: {
        id: event.creator_id,
        name: event.creator_name || "Bilinmeyen",
        isVerified: false,
      },
      description: event.description || "",
      image_url: event.image_url,
    }));
  };

  // Tarih formatını düzenleme
  const formatDateString = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  // Mesafe hesaplama (Haversine formülü)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): string => {
    // Geçersiz koordinat kontrolü
    if (
      !lat1 ||
      !lon1 ||
      !lat2 ||
      !lon2 ||
      isNaN(lat1) ||
      isNaN(lon1) ||
      isNaN(lat2) ||
      isNaN(lon2)
    ) {
      return "";
    }

    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance.toFixed(1);
  };

  // Yenileme işlemi
  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
    fetchLatestNews();
  };

  // Etkinlik detayına gitme
  const handleEventPress = (eventId: string) => {
    router.push({
      pathname: "/(tabs)/dashboard/event-details",
      params: { id: eventId },
    });
  };

  // Haber detayına gitme
  const handleNewsPress = (newsId: number) => {
    router.push({
      pathname: "/news-detail",
      params: { id: newsId.toString() },
    });
  };

  // Kategori seçimi
  const handleCategoryPress = (category: any) => {
    // Kategori ID'si ile etkinlik sayfasına yönlendir
    router.push({
      pathname: "/all-events",
      params: {
        categoryId: category.id.toString(),
        categoryName: category.name,
        categoryIcon: category.icon,
      },
    });
  };

  // Tüm etkinlikleri görme
  const handleSeeAllEvents = (type: string) => {
    if (type === "nearby") {
      // Yakınımdaki etkinlikleri göster
      router.push({
        pathname: "/all-events",
        params: {
          type: "nearby",
        },
      });
    } else if (type === "popular") {
      // Popüler etkinlikleri göster
      router.push({
        pathname: "/all-events",
        params: {
          type: "popular",
        },
      });
    } else {
      // Tüm etkinlikleri göster
      router.push({
        pathname: "/all-events",
      });
    }
  };

  // Tüm haberleri görme
  const handleSeeAllNews = () => {
    router.push("/news");
  };

  // Etkinlik oluşturma
  const handleCreateEvent = () => {
    router.push("/(tabs)/dashboard/create-event");
  };

  // Arama modalını açma
  const handleSearchPress = () => {
    setShowSearchModal(true);
  };

  // Scroll olayını işleme
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  // Bölümleri render etme
  const renderSectionItem = ({ item }: { item: SectionItem }) => {
    switch (item.type) {
      case SectionTypes.NEARBY_EVENTS:
        return (
          <CurrentEvents
            title="Yakınımdaki Etkinlikler"
            events={item.data}
            onEventPress={handleEventPress}
            onSeeAllPress={() => handleSeeAllEvents("nearby")}
            loading={isLoading}
            emptyMessage="Konya'da etkinlik bulunamadı"
          />
        );
      case SectionTypes.CATEGORIES:
        return (
          <CategoryGrid
            title="Popüler Kategoriler"
            categories={item.data}
            onCategoryPress={handleCategoryPress}
            onSeeAllPress={() => router.push("/categories")}
            columns={4}
          />
        );
      case SectionTypes.POPULAR_EVENTS:
        return (
          <CurrentEvents
            title="Popüler Etkinlikler"
            events={item.data}
            onEventPress={handleEventPress}
            onSeeAllPress={() => handleSeeAllEvents("popular")}
            loading={isLoading}
            emptyMessage="Henüz popüler etkinlik yok"
          />
        );
      case SectionTypes.NEWS_SECTION:
        return (
          <NewsSection
            title="Güncel Haberler"
            news={item.data}
            onNewsPress={handleNewsPress}
            onSeeAllPress={handleSeeAllNews}
            loading={isNewsLoading}
            emptyMessage="Henüz haber yok"
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      {/* Header - scrollY değerini geçiyoruz */}
      <Header
        userName={user?.first_name}
        onSearchPress={handleSearchPress}
        scrollY={scrollY}
      />

      {/* Ana içerik - onScroll ile scroll pozisyonunu takip ediyoruz */}
      <FlatList
        data={sections}
        renderItem={renderSectionItem}
        keyExtractor={(item, index) => `section-${item.type}-${index}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16} // 60fps için optimize edilmiş değer
      />

      {/* Etkinlik oluşturma butonu */}
      <CreateEventButton onPress={handleCreateEvent} />

      {/* Arama modalı */}
      <SearchModal
        visible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  listContent: {
    paddingBottom: 80, // CreateEventButton için alt boşluk
  },
});
