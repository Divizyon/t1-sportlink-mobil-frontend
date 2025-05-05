import { Text } from "@/components/ui/text";
import { ALL_EVENTS, EVENT_CATEGORIES } from "@/mocks/events";
import { Event } from "@/types/app";
import { router } from "expo-router";
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
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function AllEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "popularity">("date");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Etkinlikleri tarih sırasına göre sırala (en yakın en üstte)
    const sortedEvents = [...ALL_EVENTS].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
    setEvents(sortedEvents);
    setFilteredEvents(sortedEvents);
  }, []);

  useEffect(() => {
    let result = [...events];

    // Kategori filtrelemesi
    if (selectedCategory) {
      result = result.filter((event) => event.category === selectedCategory);
    }

    // Sıralama
    if (sortBy === "date") {
      result.sort((a, b) => a.date.getTime() - b.date.getTime());
    } else if (sortBy === "popularity") {
      result.sort(
        (a, b) =>
          b.participants / b.maxParticipants -
          a.participants / a.maxParticipants
      );
    }

    setFilteredEvents(result);
  }, [selectedCategory, sortBy, events]);

  const handleBackPress = () => {
    router.back();
  };

  const handleEventPress = (eventId: number) => {
    router.push({
      pathname: "/event-detail/[id]",
      params: { id: eventId },
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

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("tr-TR", options);
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventItem}
      onPress={() => handleEventPress(item.id)}
    >
      <View style={styles.eventImageContainer}>
        <Image
          source={item.image}
          style={styles.eventImage}
          resizeMode="cover"
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.title}</Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Calendar size={16} color="#3498db" />
            <Text style={styles.eventInfo}>{formatDate(item.date)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Clock size={16} color="#3498db" />
            <Text style={styles.eventInfo}>
              {item.time} - {item.endTime}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MapPin size={16} color="#3498db" />
            <Text style={styles.eventInfo}>{item.location}</Text>
          </View>

          <View style={styles.infoRow}>
            <Users size={16} color="#3498db" />
            <Text style={styles.eventInfo}>
              {item.participants}/{item.maxParticipants} Katılımcı
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusBadge,
              item.status === "approved"
                ? styles.approvedBadge
                : item.status === "completed"
                ? styles.completedBadge
                : styles.pendingBadge,
            ]}
          >
            <Text style={styles.statusText}>
              {item.status === "approved"
                ? "Onaylandı"
                : item.status === "completed"
                ? "Tamamlandı"
                : "Beklemede"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tüm Etkinlikler</Text>
        <TouchableOpacity onPress={toggleFilters} style={styles.filterButton}>
          <Filter size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSectionHeader}>
            <Text style={styles.filterTitle}>Kategori</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {EVENT_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.selectedCategoryChip,
                ]}
                onPress={() => handleCategoryPress(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category &&
                      styles.selectedCategoryChipText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

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

      {filteredEvents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Calendar size={64} color="#d5d5d5" />
          <Text style={styles.emptyText}>Etkinlik Bulunamadı</Text>
          <Text style={styles.emptySubText}>
            Seçili kriterlere uygun etkinlik bulunmamaktadır.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  filterButton: {
    padding: 4,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
  filterSectionHeader: {
    marginVertical: 8,
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
    backgroundColor: "#3498db",
  },
  categoryChipText: {
    fontSize: 14,
    color: "#666",
  },
  selectedCategoryChipText: {
    color: "#fff",
    fontWeight: "600",
  },
  sortButtons: {
    flexDirection: "row",
    marginVertical: 8,
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
    backgroundColor: "#3498db",
  },
  sortButtonText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  selectedSortButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
  },
  eventItem: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventImageContainer: {
    width: "100%",
    height: 160,
    position: "relative",
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#3498db",
    borderRadius: 20,
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
    marginBottom: 12,
    color: "#333",
  },
  infoContainer: {
    marginTop: 4,
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
    marginTop: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  approvedBadge: {
    backgroundColor: "#2ecc71",
  },
  completedBadge: {
    backgroundColor: "#95a5a6",
  },
  pendingBadge: {
    backgroundColor: "#f39c12",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#95a5a6",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#bdc3c7",
    textAlign: "center",
    paddingHorizontal: 32,
    marginTop: 8,
  },
});
