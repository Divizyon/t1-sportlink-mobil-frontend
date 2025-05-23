import { Text } from "@/components/ui/text";
import { EVENT_CATEGORIES } from "@/mocks/events";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Calendar,
  ChevronLeft,
  Clock,
  Filter,
  MapPin,
  Users,
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
} from "react-native";
import CreateEventButton from "@/components/dashboard/CreateEventButton";
import { eventsApi } from "@/services/api/events";
import { getSportImage } from "@/utils/imageUtils";
import { formatEventDate, formatEventTime } from "@/utils/eventDateUtils";

export default function AllEventsScreen() {
  const params = useLocalSearchParams();
  const categoryId = params.categoryId ? Number(params.categoryId) : null;
  const categoryName = (params.categoryName as string) || "Tüm Etkinlikler";
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

  useEffect(() => {
    // Kategori ID'si varsa, o kategoriye ait etkinlikleri getir
    if (categoryId) {
      fetchEventsByCategory(categoryId);
    } else {
      // Tüm etkinlikleri getir
      fetchAllEvents();
    }
  }, [categoryId]);

  const fetchEventsByCategory = async (sportId: number) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Kategoriye göre etkinlikler getiriliyor: ${sportId}`);
      const eventsData = await eventsApi.getEventsBySportId(sportId, page, 10);

      if (eventsData && Array.isArray(eventsData)) {
        console.log(`${eventsData.length} etkinlik bulundu`);
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } else {
        console.log("Etkinlik bulunamadı veya API yanıtı beklenmeyen formatta");
        setEvents([]);
        setFilteredEvents([]);
      }
    } catch (err) {
      console.error("Etkinlikleri getirirken hata:", err);
      setError("Etkinlikler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Tüm etkinlikler getiriliyor");
      const eventsData = await eventsApi.getAllEvents(page, 10, "events", {
        sort: "popular",
      });

      if (eventsData && Array.isArray(eventsData)) {
        console.log(`${eventsData.length} etkinlik bulundu`);
        setEvents(eventsData);
        setFilteredEvents(eventsData);
      } else {
        console.log("Etkinlik bulunamadı veya API yanıtı beklenmeyen formatta");
        setEvents([]);
        setFilteredEvents([]);
      }
    } catch (err) {
      console.error("Etkinlikleri getirirken hata:", err);
      setError("Etkinlikler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

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

    setFilteredEvents(result);
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

  const renderEventItem = ({ item }: { item: any }) => {
    // API'den gelen etkinlik verisi için uygun formatta görüntüleme
    const eventDate = item.event_date ? new Date(item.event_date) : new Date();
    const formattedDate = formatEventDate(item.event_date || "");
    const formattedTime = formatEventTime(
      item.start_time || "",
      item.end_time || ""
    );
    const sportName = item.sport?.name || item.category || "Diğer";
    const participants = item.current_participants || item.participants || 0;
    const maxParticipants = item.max_participants || item.maxParticipants || 10;
    const status = item.status?.toLowerCase() || "pending";

    // Etkinlik resmi
    const imageSource = item.image_url
      ? { uri: item.image_url }
      : (getSportImage(sportName) as any);

    return (
      <TouchableOpacity
        style={styles.eventItem}
        onPress={() => handleEventPress(item.id)}
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
        </View>

        <View style={styles.eventContent}>
          <Text style={styles.eventTitle}>{item.title}</Text>

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
              <Text style={styles.eventInfo}>
                {item.location_name || item.location || "Belirtilmemiş"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Users size={16} color="#3498db" />
              <Text style={styles.eventInfo}>
                {participants}/{maxParticipants} Katılımcı
              </Text>
            </View>
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                status === "active" || status === "approved"
                  ? styles.approvedBadge
                  : status === "completed"
                  ? styles.completedBadge
                  : styles.pendingBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {status === "active" || status === "approved"
                  ? "Onaylandı"
                  : status === "completed"
                  ? "Tamamlandı"
                  : "Beklemede"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerIcon}>{categoryIcon}</Text>
          <Text style={styles.headerTitle}>{categoryName}</Text>
        </View>
        <TouchableOpacity onPress={toggleFilters} style={styles.filterButton}>
          <Filter size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSectionHeader}>
            <Text style={styles.filterTitle}>Sıralama</Text>
          </View>

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
          <ActivityIndicator size="large" color="#10B981" />
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
        />
      )}

      <CreateEventButton onPress={handleCreateEvent} />
    </SafeAreaView>
  );
}

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
    borderBottomColor: "#e1e1e1",
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  filterButton: {
    padding: 8,
  },
  filtersContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  filterSectionHeader: {
    marginTop: 8,
    marginBottom: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  categoriesContainer: {
    paddingVertical: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: "#10B981",
  },
  categoryChipText: {
    fontSize: 14,
    color: "#333",
  },
  selectedCategoryChipText: {
    color: "#fff",
  },
  sortButtons: {
    flexDirection: "row",
    marginTop: 8,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    marginRight: 8,
  },
  selectedSortButton: {
    backgroundColor: "#10B981",
  },
  sortButtonText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  selectedSortButtonText: {
    color: "#fff",
  },
  eventsList: {
    padding: 16,
  },
  eventItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  eventImageContainer: {
    position: "relative",
    height: 160,
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(16, 185, 129, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 12,
  },
  infoContainer: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventInfo: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  approvedBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  completedBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
  },
  pendingBadge: {
    backgroundColor: "rgba(249, 115, 22, 0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#ef4444",
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
    color: "#666",
    textAlign: "center",
  },
});
