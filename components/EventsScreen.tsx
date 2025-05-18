import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TextInput,
} from "react-native";
import { router } from "expo-router";

// Icons
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";

// Services
import { eventsApi } from "../services/api/events";

// Utils
import { formatEventDate, formatEventTime } from "../utils/eventDateUtils";

// Components
import { EventCard } from "../components/EventCard";
import { SearchBar } from "../components/SearchBar";
import { SportFilter } from "../components/SportFilter";
import { TimeFilter } from "../components/TimeFilter";
import colors from "@/constants/colors";

// Interface tanımlamaları
interface Event {
  id: string;
  title: string;
  description: string;
  sport_id: number;
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
}

// UI Event interface - Backend modelden UI gösterimine dönüştürmek için
interface UIEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  organizer: string;
  category: string;
  sport?: {
    icon: string;
    name: string;
  };
  status?: string;
}

interface Props {
  initialTab?: string;
  onEventPress?: (eventId: string) => void;
}

const EventsScreen: React.FC<Props> = ({
  initialTab = "active",
  onEventPress,
}) => {
  // State variables
  const [activeTab, setActiveTab] = useState(initialTab);
  const [events, setEvents] = useState<UIEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<UIEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("Tümü");
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("Tümü");

  // Spor kategorileri
  const sports = [
    { id: "all", name: "Tümü", icon: "🏆" },
    { id: "football", name: "Futbol", icon: "⚽" },
    { id: "basketball", name: "Basketbol", icon: "🏀" },
    { id: "tennis", name: "Tenis", icon: "🎾" },
    { id: "swimming", name: "Yüzme", icon: "🏊" },
    { id: "volleyball", name: "Voleybol", icon: "🏐" },
  ];

  // Zaman filtreleri
  const timeFilters = [
    { id: "all", name: "Tümü" },
    { id: "today", name: "Bugün" },
    { id: "week", name: "Bu Hafta" },
    { id: "month", name: "Bu Ay" },
  ];

  // API modelini UI modeline dönüştür
  const mapEventToUIEvent = (apiEvent: Event): UIEvent => {
    return {
      id: apiEvent.id.toString(),
      title: apiEvent.title,
      date: formatEventDate(apiEvent.event_date),
      time: formatEventTime(apiEvent.start_time, apiEvent.end_time),
      location: apiEvent.location_name,
      participants: apiEvent.current_participants,
      maxParticipants: apiEvent.max_participants,
      organizer: apiEvent.creator_name,
      category: apiEvent.sport?.name || "Diğer",
      sport: {
        icon: apiEvent.sport?.icon || "🏆",
        name: apiEvent.sport?.name || "Diğer",
      },
      status: apiEvent.status,
    };
  };

  // Etkinlikleri yükle
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      let apiEvents = [];

      switch (activeTab) {
        case "active":
          // Kullanıcının katıldığı ACTIVE durumundaki etkinlikler
          apiEvents = await eventsApi.getUserParticipatedEvents(
            1,
            10,
            "ACTIVE"
          );
          break;
        case "past":
          apiEvents = await eventsApi.getUserParticipatedEvents(
            1,
            10,
            "COMPLETED"
          );
          break;
        case "created":
          // Oluşturduğum etkinlikleri status parametresi olmadan çağırıyoruz
          // Böylece tüm etkinlikler (aktif ve tamamlanmış) gelecek
          apiEvents = await eventsApi.getUserCreatedEvents(1, 10);
          break;
      }

      const uiEvents = apiEvents.map(mapEventToUIEvent);
      setEvents(uiEvents);
      setFilteredEvents(uiEvents);
    } catch (err: any) {
      console.error("Etkinlikler yüklenirken hata:", err);
      setError(err?.message || "Etkinlikler yüklenemedi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filtreleme işlevi
  const filterEvents = () => {
    if (!events.length) {
      setFilteredEvents([]);
      return;
    }

    let filtered = [...events];

    // Arama filtrelemesi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    // Spor filtrelemesi
    if (selectedSport !== "Tümü") {
      filtered = filtered.filter(
        (event) => event.sport?.name === selectedSport
      );
    }

    // Zaman filtrelemesi
    if (selectedTimeFilter !== "Tümü") {
      const today = new Date();
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + 7);
      const endOfMonth = new Date(today);
      endOfMonth.setMonth(today.getMonth() + 1);

      filtered = filtered.filter((event) => {
        const dateParts = event.date.split(" ");
        if (dateParts.length < 2) return false;

        const day = parseInt(dateParts[0]);
        const monthName = dateParts[1];

        const months = [
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

        const month = months.indexOf(monthName);
        if (month === -1) return false;

        const eventDate = new Date();
        eventDate.setDate(day);
        eventDate.setMonth(month);

        switch (selectedTimeFilter) {
          case "Bugün":
            return (
              eventDate.getDate() === today.getDate() &&
              eventDate.getMonth() === today.getMonth()
            );
          case "Bu Hafta":
            return eventDate >= today && eventDate <= endOfWeek;
          case "Bu Ay":
            return eventDate >= today && eventDate <= endOfMonth;
          default:
            return true;
        }
      });
    }

    setFilteredEvents(filtered);
  };

  // Tab değişimi
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Yenileme işlevi
  const handleRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  // Arama temizleme
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Etkinlik detayına gitme
  const handleEventPress = (eventId: string) => {
    if (onEventPress) {
      onEventPress(eventId);
    } else {
      router.push(`/event-details/${eventId}`);
    }
  };

  // İlk yükleme ve tab değişiminde etkinlikleri getir
  useEffect(() => {
    fetchEvents();
  }, [activeTab]);

  // Filtre değişiminde filtreleme yap
  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, selectedSport, selectedTimeFilter]);

  // Görünüm bileşeni
  return (
    <View style={styles.container}>
      {/* Başlık ve Arama Bölümü */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Etkinlikler</Text>
          <View style={styles.headerSeparator} />
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowSearch((prevState) => !prevState)}
            >
              <Ionicons name="search" size={22} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Arama Bölümü */}
        {showSearch && (
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={handleClearSearch}
            placeholder="Etkinlik ara..."
          />
        )}

        {/* Tab Seçimi */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "active" && styles.activeTab]}
            onPress={() => handleTabChange("active")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "active" && styles.activeTabText,
              ]}
            >
              Aktif Etkinlikler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "past" && styles.activeTab]}
            onPress={() => handleTabChange("past")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "past" && styles.activeTabText,
              ]}
            >
              Geçmiş
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "created" && styles.activeTab]}
            onPress={() => handleTabChange("created")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "created" && styles.activeTabText,
              ]}
            >
              Oluşturduğum
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtre Bölümü */}
      <View style={styles.filtersContainer}>
        {/* Spor Filtreleri */}
        <SportFilter
          sports={sports}
          selectedSport={selectedSport}
          onSelectSport={setSelectedSport}
        />

        {/* Zaman Filtreleri */}
        <TimeFilter
          filters={timeFilters}
          selectedFilter={selectedTimeFilter}
          onSelectFilter={setSelectedTimeFilter}
        />
      </View>

      {/* Etkinlik Listesi */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={50}
            color="#F44336"
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="calendar-blank"
            size={80}
            color="#BDBDBD"
          />
          <Text style={styles.emptyTitle}>Etkinlik Bulunamadı</Text>
          <Text style={styles.emptyText}>
            {activeTab === "active"
              ? "Şu anda katıldığınız aktif etkinlik bulunmuyor."
              : activeTab === "past"
              ? "Geçmiş etkinlik kaydınız bulunmuyor."
              : "Henüz oluşturduğunuz etkinlik bulunmuyor."}
          </Text>
          {activeTab !== "active" && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push("/create-event")}
            >
              <Text style={styles.createButtonText}>Etkinlik Oluştur</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <EventCard
              event={item}
              onPress={() => handleEventPress(item.id)}
              style={index === 0 ? { marginTop: 10 } : {}}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#4CAF50"]}
              tintColor="#4CAF50"
            />
          }
        />
      )}
    </View>
  );
};

// Ana bileşen stilleri
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
    marginTop: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 8,

    marginTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
  },
  headerActions: {
    flexDirection: "row",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#4CAF50",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#757575",
  },
  activeTabText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  filtersContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#616161",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
    marginBottom: 24,
  },
  createButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  floatingButton: {
    position: "absolute",
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerSeparator: {
    width: 1,
    height: 24,
    backgroundColor: colors.lightGray,
    marginHorizontal: 12,
  },
});

export default EventsScreen;
