import { Text } from "@/components/ui/text";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Calendar,
  ChevronLeft,
  Clock,
  Filter,
  MapPin,
  Users,
  Search,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import CreateEventButton from "@/components/dashboard/CreateEventButton";
import { eventsApi } from "@/services/api/events";
import { getSportImage } from "@/utils/imageUtils";
import { formatEventDate, formatEventTime } from "@/utils/eventDateUtils";
import { LinearGradient } from "expo-linear-gradient";
import FootballAnimation from "@/components/animations/FootballAnimation";
import BasketballAnimation from "@/components/animations/BasketballAnimation";
import TennisAnimation from "@/components/animations/TennisAnimation";
import YogaAnimation from "@/components/animations/YogaAnimation";
import RunningAnimation from "@/components/animations/RunningAnimation";
import BicycleAnimation from "@/components/animations/BicycleAnimation";
import WalkingAnimation from "@/components/animations/WalkingAnimation";

export default function AllEventsScreen() {
  const params = useLocalSearchParams();
  const categoryId = params.categoryId ? Number(params.categoryId) : null;
  const categoryName = (params.categoryName as string) || "Aktif Etkinlikler";
  const categoryIcon = (params.categoryIcon as string) || "🏆";

  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "popularity">("date");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Filtreleme kategorileri

  useEffect(() => {
    // Kategori ID'si varsa, o kategoriye ait etkinlikleri getir
    if (categoryId) {
      fetchEventsByCategory(categoryId);
    } else {
      // Aktif etkinlikleri getir
      fetchAllEvents();
    }
  }, [categoryId]);

  const fetchEventsByCategory = async (sportId: number) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Kategoriye göre aktif etkinlikler getiriliyor: ${sportId}`);
      // Önce aktif etkinlikleri getir
      const activeEvents = await eventsApi.getEventsByStatus(
        "ACTIVE",
        page,
        50
      );

      if (activeEvents && Array.isArray(activeEvents)) {
        // Sonra spor kategorisine göre filtrele
        const filteredBySport = activeEvents.filter(
          (event) => event.sport_id === sportId
        );
        console.log(
          `${filteredBySport.length} aktif etkinlik bulundu (${sportId} kategorisinde)`
        );
        setEvents(filteredBySport);
        setFilteredEvents(filteredBySport);

        // Daha fazla etkinlik olup olmadığını kontrol et
        // 50 etkinlik getirip filtrele, sonuç 50'den az ise daha fazla etkinlik yok demektir
        setHasMoreEvents(activeEvents.length === 50);
      } else {
        console.log(
          "Aktif etkinlik bulunamadı veya API yanıtı beklenmeyen formatta"
        );
        setEvents([]);
        setFilteredEvents([]);
        setHasMoreEvents(false);
      }
    } catch (err) {
      console.error("Kategoriye göre aktif etkinlikleri getirirken hata:", err);
      setError("Aktif etkinlikler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Aktif etkinlikler getiriliyor");
      const eventsData = await eventsApi.getEventsByStatus("ACTIVE", page, 10);

      if (eventsData && Array.isArray(eventsData)) {
        console.log(`${eventsData.length} aktif etkinlik bulundu`);

        // İlk etkinliği detaylı logla (debug için)
        if (eventsData.length > 0) {
          console.log(
            "Örnek etkinlik verisi:",
            JSON.stringify(eventsData[0], null, 2)
          );
        }

        setEvents(eventsData);
        setFilteredEvents(eventsData);

        // Daha fazla etkinlik olup olmadığını kontrol et
        setHasMoreEvents(eventsData.length === 10);
      } else {
        console.log(
          "Aktif etkinlik bulunamadı veya API yanıtı beklenmeyen formatta"
        );
        setEvents([]);
        setFilteredEvents([]);
        setHasMoreEvents(false);
      }
    } catch (err) {
      console.error("Aktif etkinlikleri getirirken hata:", err);
      setError("Aktif etkinlikler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Arama işlemi için filtreleme
    if (searchQuery.trim() === "") {
      setFilteredEvents(events);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = events.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          (event.location_name &&
            event.location_name.toLowerCase().includes(query)) ||
          (event.sport?.name && event.sport.name.toLowerCase().includes(query))
      );
      setFilteredEvents(filtered);
    }
  }, [searchQuery, events]);

  useEffect(() => {
    let result = [...events];

    // Kategori filtrelemesi
    if (selectedCategory) {
      result = result.filter(
        (event) =>
          event.sport?.name === selectedCategory ||
          event.category === selectedCategory
      );
    }

    // Sıralama
    if (sortBy === "date") {
      result.sort((a, b) => {
        const dateA = new Date(a.event_date || a.date).getTime();
        const dateB = new Date(b.event_date || b.date).getTime();
        return dateA - dateB;
      });
    } else if (sortBy === "popularity") {
      result.sort((a, b) => {
        const ratioA =
          (a.current_participants || a.participants) /
          (a.max_participants || a.maxParticipants);
        const ratioB =
          (b.current_participants || b.participants) /
          (b.max_participants || b.maxParticipants);
        return ratioB - ratioA;
      });
    }

    if (searchQuery.trim() === "") {
      setFilteredEvents(result);
    }
  }, [selectedCategory, sortBy, events]);

  const handleBackPress = () => {
    router.back();
  };

  const handleEventPress = (eventId: string | number) => {
    router.push({
      pathname: "/(tabs)/dashboard/event-details",
      params: { id: eventId.toString() },
    });
  };

  const handleCategoryPress = (category: string) => {
    setSelectedCategory((currentCategory) =>
      currentCategory === category ? null : category
    );
  };

  const toggleSortBy = () => {
    setSortBy((currentSort) =>
      currentSort === "date" ? "popularity" : "date"
    );
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleCreateEvent = () => {
    router.push("/(tabs)/dashboard/create-event");
  };

  const loadMore = async () => {
    if (!hasMoreEvents || loading) return;

    try {
      const nextPage = page + 1;
      setLoading(true);

      let newEvents;
      if (categoryId) {
        // Kategoriye göre aktif etkinlikleri getir
        const activeEvents = await eventsApi.getEventsByStatus(
          "ACTIVE",
          nextPage,
          50
        );
        if (activeEvents && Array.isArray(activeEvents)) {
          newEvents = activeEvents.filter(
            (event) => event.sport_id === categoryId
          );
        }
      } else {
        // Tüm aktif etkinlikleri getir
        newEvents = await eventsApi.getEventsByStatus("ACTIVE", nextPage, 10);
      }

      if (newEvents && Array.isArray(newEvents) && newEvents.length > 0) {
        console.log(
          `${newEvents.length} yeni aktif etkinlik yüklendi (sayfa ${nextPage})`
        );
        setEvents((prevEvents) => [...prevEvents, ...newEvents]);
        setPage(nextPage);
      } else {
        // Daha fazla etkinlik yok
        console.log("Daha fazla etkinlik bulunamadı");
        setHasMoreEvents(false);
      }
    } catch (err) {
      console.error("Daha fazla etkinlik yüklenirken hata:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderEventItem = ({ item }: { item: any }) => {
    // API'den gelen etkinlik verisi için uygun formatta görüntüleme
    const eventDate = item.event_date ? new Date(item.event_date) : new Date();

    // Tarih ve saat "string" kontrolü
    let formattedDate = formatEventDate(item.event_date || "");
    if (formattedDate === "Invalid Date" || item.event_date === "string") {
      formattedDate = "Tarih belirtilmemiş";
    }

    let formattedTime = formatEventTime(
      item.start_time || "",
      item.end_time || ""
    );
    if (
      formattedTime === ":" ||
      item.start_time === "string" ||
      item.end_time === "string"
    ) {
      formattedTime = "Saat belirtilmemiş";
    }

    // API'den gelen "string" değerlerini düzelt
    const sportName =
      item.sport?.name === "string"
        ? "Diğer"
        : item.sport?.name || item.category || "Diğer";
    const title =
      item.title === "string" ? sportName + " Etkinliği" : item.title;
    const location =
      item.location_name === "string"
        ? "Belirtilmemiş"
        : item.location_name || item.location || "Belirtilmemiş";

    // Katılımcı bilgilerini kontrol et
    const participants = item.current_participants || item.participants || 0;
    const maxParticipants = item.max_participants || item.maxParticipants || 10;
    const status = item.status?.toLowerCase() || "pending";

    // Etkinlik resmi - API'den gelen resim varsa onu kullan, yoksa spor türüne göre varsayılan resmi kullan
    let imageSource;
    if (
      item.image_url &&
      item.image_url !== "string" &&
      item.image_url.startsWith("http")
    ) {
      imageSource = { uri: item.image_url };
    } else {
      // getSportImage zaten string URL döndürür
      imageSource = { uri: getSportImage(sportName) };
    }

    // Katılımcı doluluk yüzdesi
    const participationPercentage = Math.min(
      Math.round((participants / maxParticipants) * 100),
      100
    );

    return (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleEventPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.eventImageContainer}>
          <Image
            source={imageSource}
            style={styles.eventImage}
            resizeMode="cover"
          />
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{sportName}</Text>
          </View>

          {status === "active" || status === "approved" ? (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Onaylandı</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>{title}</Text>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Calendar size={16} color="#3498db" />
              <Text style={styles.eventInfo}>{formattedDate}</Text>
            </View>

            <View style={styles.infoRow}>
              <Clock size={16} color="#3498db" />
              <Text style={styles.eventInfo}>{formattedTime}</Text>
            </View>

            <View style={styles.infoRow}>
              <MapPin size={16} color="#3498db" />
              <Text style={styles.eventInfo}>{location}</Text>
            </View>
          </View>

          <View style={styles.participantContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${participationPercentage}%` },
                  participationPercentage >= 90 && styles.almostFullBar,
                ]}
              />
            </View>
            <View style={styles.participantInfo}>
              <Users size={16} color="#3498db" />
              <Text style={styles.eventInfo}>
                {participants}/{maxParticipants} Katılımcı
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Kategori için uygun animasyonu döndüren fonksiyon
  const renderCategoryAnimation = () => {
    const lowerCategory = categoryName.toLowerCase();

    switch (lowerCategory) {
      case "futbol":
        return <FootballAnimation style={styles.headerAnimation} />;
      case "basketbol":
        return <BasketballAnimation style={styles.headerAnimation} />;
      case "tenis":
        return <TennisAnimation style={styles.headerAnimation} />;
      case "yoga":
        return <YogaAnimation style={styles.headerAnimation} />;
      case "koşu":
        return <RunningAnimation style={styles.headerAnimation} />;
      case "bisiklet":
        return <BicycleAnimation style={styles.headerAnimation} />;
      case "yürüyüş":
        return <WalkingAnimation style={styles.headerAnimation} />;
      default:
        return <Text style={styles.headerIcon}>{categoryIcon}</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Modern Header */}
      <LinearGradient
        colors={["#4e54c8", "#8f94fb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerTitleContainer}>
              {renderCategoryAnimation()}
              <Text style={styles.headerTitle}>{categoryName}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={toggleFilters} style={styles.filterButton}>
            <Filter size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Modern Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={18} color="#718096" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Etkinlik ara..."
              placeholderTextColor="#a0aec0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>×</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </LinearGradient>

      {showFilters && (
        <View style={styles.sortContainer}>
          <Text style={styles.sortTitle}>Sıralama</Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[
                styles.sortButton,
                sortBy === "date" && styles.selectedSortButton,
              ]}
              onPress={() => setSortBy("date")}
            >
              <Calendar size={16} color={sortBy === "date" ? "#fff" : "#666"} />
              <Text
                style={[
                  styles.sortButtonText,
                  sortBy === "date" && styles.selectedSortButtonText,
                ]}
              >
                Tarihe Göre
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sortButton,
                sortBy === "popularity" && styles.selectedSortButton,
              ]}
              onPress={() => setSortBy("popularity")}
            >
              <Users
                size={16}
                color={sortBy === "popularity" ? "#fff" : "#666"}
              />
              <Text
                style={[
                  styles.sortButtonText,
                  sortBy === "popularity" && styles.selectedSortButtonText,
                ]}
              >
                Popülerliğe Göre
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4e54c8" />
          <Text style={styles.loadingText}>Etkinlikler yükleniyor...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Etkinlik bulunamadı</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.eventsList}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
        />
      )}

      <CreateEventButton onPress={handleCreateEvent} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f8fa",
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerAnimation: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 8,
    color: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#2d3748",
    padding: 0,
  },
  clearButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    color: "#718096",
    lineHeight: 20,
    textAlign: "center",
  },
  categoryFilterContainer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    marginTop: 15,
    borderRadius: 20,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  categoryFilterContent: {
    paddingHorizontal: 16,
  },
  categoryFilterItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: "#f7f8fa",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  selectedCategoryItem: {
    backgroundColor: "#4e54c8",
    borderColor: "#4e54c8",
  },
  categoryFilterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4a5568",
  },
  selectedCategoryText: {
    color: "#fff",
    fontWeight: "600",
  },
  sortContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sortTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 10,
  },
  sortButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f7f8fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 10,
    flex: 1,
    justifyContent: "center",
  },
  selectedSortButton: {
    backgroundColor: "#4e54c8",
    borderColor: "#4e54c8",
  },
  sortButtonText: {
    fontSize: 14,
    color: "#4a5568",
    fontWeight: "500",
    marginLeft: 8,
  },
  selectedSortButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  eventsList: {
    padding: 16,
    paddingTop: 10,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  eventImageContainer: {
    position: "relative",
    height: 180,
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(78, 84, 200, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(16, 185, 129, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 12,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventInfo: {
    fontSize: 14,
    color: "#4a5568",
    marginLeft: 10,
  },
  participantContainer: {
    marginTop: 5,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    marginBottom: 10,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4e54c8",
    borderRadius: 3,
  },
  almostFullBar: {
    backgroundColor: "#f56565",
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4a5568",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#f56565",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#4a5568",
    textAlign: "center",
  },
});
