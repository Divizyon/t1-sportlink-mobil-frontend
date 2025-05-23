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
import * as Location from "expo-location";

// Bileşenler
import Header from "@/components/dashboard/Header";
import CurrentEvents from "@/components/dashboard/CurrentEvents";
import CategoryGrid from "@/components/dashboard/CategoryGrid";
import SearchModal from "@/components/dashboard/SearchModal";
import CreateEventButton from "@/components/dashboard/CreateEventButton";

// API ve Servisler
import { eventsApi } from "@/services/api/events";
import { sportsApi } from "@/services/api/sports";
import { showToast } from "@/src/utils/toastHelper";
import { useAuth } from "@/src/store/AuthContext";

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

// Kullanıcı konumu için başlangıç değeri
const initialLocation = {
  latitude: 0,
  longitude: 0,
};

// Dashboard bölümlerini tanımlama
enum SectionTypes {
  NEARBY_EVENTS = "nearby_events",
  CATEGORIES = "categories",
  POPULAR_EVENTS = "popular_events",
}

// Bölüm veri tipi tanımı
interface SectionItem {
  type: SectionTypes;
  data: any;
}

export default function DashboardScreen() {
  // State tanımlamaları
  const [userCoordinates, setUserCoordinates] = useState(initialLocation);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Scroll pozisyonu için Animated.Value
  const scrollY = useRef(new Animated.Value(0)).current;

  // Etkinlik ve kategori state'leri
  const [nearbyEvents, setNearbyEvents] = useState<any[]>([]);
  const [popularEvents, setPopularEvents] = useState<any[]>([]);
  const [sportCategories, setSportCategories] = useState<any[]>([]);
  const [sportCategoriesLoading, setSportCategoriesLoading] = useState(true);

  // Bölüm verisi
  const [sections, setSections] = useState<SectionItem[]>([]);

  // Auth context'ten kullanıcı bilgisini al
  const { user } = useAuth();

  // Konum izinlerini kontrol et ve kullanıcı konumunu al
  useEffect(() => {
    const getLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.log("Konum izni reddedildi");
          setIsLocationLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserCoordinates({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error("Konum alınamadı:", error);
      } finally {
        setIsLocationLoading(false);
      }
    };

    getLocationPermission();
  }, []);

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

  // Etkinlikleri getir
  useEffect(() => {
    if (!isLocationLoading && userCoordinates.latitude !== 0) {
      fetchEvents();
    }
  }, [isLocationLoading, userCoordinates]);

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
    ];

    setSections(sectionsData);
  }, [nearbyEvents, popularEvents, sportCategories]);

  // Etkinlikleri getirme fonksiyonu
  const fetchEvents = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Yakındaki etkinlikleri getir
      const nearbyEventsData = await eventsApi.getNearbyEvents(
        userCoordinates.latitude,
        userCoordinates.longitude,
        10, // 10km mesafedeki etkinlikler
        1, // sayfa
        10 // limit
      );

      // Popüler etkinlikleri getir - sadece aktif olanları göster
      // Backend endpointi direkt olarak kullanıyoruz: /api/events/status/active
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
    } catch (error) {
      console.error("Etkinlikler getirilirken hata oluştu:", error);
      showToast("Etkinlikler yüklenemedi", "error");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // API etkinliklerini UI formatına dönüştürme
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
        userCoordinates.latitude,
        userCoordinates.longitude,
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
  };

  // Etkinlik detayına gitme
  const handleEventPress = (eventId: string) => {
    router.push({
      pathname: "/(tabs)/dashboard/event-details",
      params: { id: eventId },
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
    router.push({
      pathname: "/all-events",
      params: { type },
    });
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
            title="Yakınındaki Etkinlikler"
            events={item.data}
            onEventPress={handleEventPress}
            onSeeAllPress={() => handleSeeAllEvents("nearby")}
            loading={isLoading}
            emptyMessage={
              isLocationLoading
                ? "Konum bilgisi alınıyor..."
                : "Yakınınızda etkinlik bulunamadı"
            }
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
