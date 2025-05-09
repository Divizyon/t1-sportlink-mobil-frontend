import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import {
  Calendar,
  CheckCircle,
  Filter,
  MapPin,
  Search,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  AlertCircle,
} from "lucide-react-native";
import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { Event, eventsApi } from "../../services/api/events";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from "../../src/utils/toastHelper";

// UI Event interface
interface UIEvent {
  id: string;
  title: string;
  type: string;
  category: string;
  date: string;
  time: string;
  location: string;
  participants: number;
  maxParticipants: number;
  organizer: string;
  isJoined: boolean;
  status: string;
  isCreator: boolean;
}

export default function EventsScreen() {
  // Basic state
  const [events, setEvents] = useState<UIEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<UIEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Tab and filter state
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [selectedDate, setSelectedDate] = useState("Tümü");
  
  // Constants
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];
  
  // Categories and date filters
  const categories = [
    { id: 1, name: "Tümü", icon: "🏆" },
    { id: 2, name: "Futbol", icon: "⚽" },
    { id: 3, name: "Basketbol", icon: "🏀" },
    { id: 4, name: "Yüzme", icon: "🏊" },
    { id: 5, name: "Tenis", icon: "🎾" },
    { id: 6, name: "Voleybol", icon: "🏐" },
  ];
  
  const dateFilters = [
    { id: 1, name: "Tümü" },
    { id: 2, name: "Bugün" },
    { id: 3, name: "Bu Hafta" },
    { id: 4, name: "Bu Ay" },
  ];
  
  // Simple function to map API event to UI event
  const mapEventToUIEvent = (apiEvent: Event, currentTab: string): UIEvent => {
    // Format date
    let day = 1;
    let month = "Ocak";
    try {
      const date = new Date(apiEvent.event_date);
      day = date.getDate();
      month = months[date.getMonth()];
    } catch (e) {
      // Use defaults
    }
    
    // Format time
    let startTime = "??:??";
    let endTime = "??:??";
    try {
      startTime = new Date(apiEvent.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      endTime = new Date(apiEvent.end_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      // Use defaults
    }
    
    return {
      id: apiEvent.id,
      title: apiEvent.title || "İsimsiz Etkinlik",
      type: "Etkinlik",
      category: apiEvent.sport_name || "Diğer",
      date: `${day} ${month}`,
      time: `${startTime}-${endTime}`,
      location: apiEvent.location_name || "Belirtilmemiş",
      participants: apiEvent.participant_count || 0,
      maxParticipants: apiEvent.max_participants || 10,
      organizer: apiEvent.creator_name || "Bilinmiyor",
      isJoined: apiEvent.user_joined || false,
      status: apiEvent.status || "UNKNOWN",
      isCreator: currentTab === "created",
    };
  };
  
  // Fetch events based on active tab
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching events for tab: ${activeTab}`);
      let apiEvents: Event[] = [];
      
      switch (activeTab) {
        case "active":
          apiEvents = await eventsApi.getEventsByStatus("ACTIVE", 1, 10);
          break;
        case "past":
          apiEvents = await eventsApi.getUserParticipatedEvents(1, 10, "COMPLETED");
          break;
        case "created":
          apiEvents = await eventsApi.getUserCreatedEvents(1, 10);
          break;
      }
      
      console.log(`Received ${apiEvents.length} events from API`);
      
      if (!Array.isArray(apiEvents)) {
        apiEvents = [];
      }
      
      const uiEvents = apiEvents.map(event => mapEventToUIEvent(event, activeTab));
      setEvents(uiEvents);
      setFilteredEvents(uiEvents);
    } catch (err: any) {
      console.error("Error fetching events:", err);
      setError(err?.message || "Etkinlikler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };
  
  // Filter events based on search, category, and date
  const filterEvents = () => {
    if (!events.length) {
      setFilteredEvents([]);
      return;
    }
    
    let filtered = [...events];
    
    // Apply tab filter
    if (activeTab === "active") {
      filtered = filtered.filter(event => 
        event.status === "ACTIVE" || 
        event.status === "active"
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) || 
        event.location.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory !== "Tümü") {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }
    
    // Apply date filter
    if (selectedDate !== "Tümü") {
      // Date filtering logic...
      // (simplified for brevity)
    }
    
    setFilteredEvents(filtered);
  };
  
  // Initial fetch on mount
  useEffect(() => {
    fetchEvents();
  }, [activeTab]);
  
  // Apply filters when criteria change
  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, selectedCategory, selectedDate]);
  
  // Handle tab change
  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  };
  
  // Toggle search
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchQuery("");
    }
  };
  
  // Navigate to event details
  const handleEventPress = (eventId: string) => {
    router.push(`/dashboard/event-details?id=${eventId}`);
  };
  
  // Render event item
  const renderEventItem = ({ item }: { item: UIEvent }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(item.id)}
    >
      <HStack style={styles.eventHeader}>
        <Box style={styles.dateBox}>
          <Text style={styles.dateNumber}>{item.date.split(" ")[0]}</Text>
          <Text style={styles.dateMonth}>{item.date.split(" ")[1].substring(0, 3)}</Text>
        </Box>
        
        <VStack style={styles.eventDetails}>
          <HStack style={styles.eventTopInfo}>
            <Text style={styles.eventTime}>{item.time}</Text>
            <HStack style={styles.organizerBadge}>
              <Text style={styles.organizerBadgeText}>
                {item.isCreator ? "Sizin Etkinliğiniz" : item.organizer}
              </Text>
              <CheckCircle size={12} color="#047857" style={{ marginLeft: 4 }} />
            </HStack>
          </HStack>
          
          <Text style={styles.eventTitle}>{item.title}</Text>
          
          <HStack style={styles.eventTypeContainer}>
            <Box style={styles.typeTag}>
              <Text style={styles.tagText}>{item.type}</Text>
            </Box>
          </HStack>
        </VStack>
      </HStack>
      
      <HStack style={styles.eventFooter}>
        <HStack style={styles.locationInfo}>
          <MapPin size={14} color="#6b7280" />
          <Text style={styles.locationText}>{item.location}</Text>
        </HStack>
        
        <HStack style={styles.participantsInfo}>
          <Users size={14} color="#6b7280" />
          <Text style={styles.participantsText}>
            {item.participants}/{item.maxParticipants}
          </Text>
        </HStack>
      </HStack>
      
      {item.isJoined && (
        <Box style={styles.joinedBadge}>
          <HStack style={styles.joinedContent}>
            <UserCheck size={12} color="#fff" />
            <Text style={styles.joinedText}>Katılıyorsunuz</Text>
          </HStack>
        </Box>
      )}
    </TouchableOpacity>
  );
  
  // Render empty state
  const renderEmptyState = () => {
    if (loading) return null;
    
    let title = "Etkinlik Bulunamadı";
    let message = "Seçilen filtrelere uygun etkinlik bulunamadı.";
    
    if (error) {
      title = "Bir Hata Oluştu";
      message = error;
    }
    
    return (
      <View style={styles.emptyState}>
        <TrendingUp size={40} color="#9ca3af" />
        <Text style={styles.emptyStateTitle}>{title}</Text>
        <Text style={styles.emptyStateText}>{message}</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshButtonText}>Yenile</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Header with search and filtering */}
      <View style={{ padding: 16, backgroundColor: "#fff" }}>
        <HStack style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827" }}>
            Etkinlikler
          </Text>
          <HStack space="md">
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#f3f4f6",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={toggleSearch}
            >
              <Search size={18} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: "#f3f4f6",
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => {}}
            >
              <Filter size={18} color="#6b7280" />
            </TouchableOpacity>
          </HStack>
        </HStack>

        {showSearch && (
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#f3f4f6",
              borderRadius: 8,
              padding: 8,
              marginBottom: 12,
              alignItems: "center",
            }}
          >
            <Search size={16} color="#6b7280" style={{ marginRight: 8 }} />
            <TextInput
              style={{
                flex: 1,
                fontSize: 14,
                color: "#111827",
                height: 24,
                padding: 0,
              }}
              placeholder="Etkinlik veya konum ara..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        )}

        {/* Tab navigation */}
        <HStack
          style={{
            backgroundColor: "#f3f4f6",
            borderRadius: 8,
            padding: 4,
          }}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 4,
              backgroundColor: activeTab === "active" ? "#047857" : "transparent",
              alignItems: "center",
            }}
            onPress={() => handleTabChange("active")}
          >
            <Text
              style={{
                color: activeTab === "active" ? "#fff" : "#6b7280",
                fontWeight: activeTab === "active" ? "bold" : "normal",
              }}
            >
              Aktif Etkinlikler
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 4,
              backgroundColor: activeTab === "past" ? "#047857" : "transparent",
              alignItems: "center",
            }}
            onPress={() => handleTabChange("past")}
          >
            <Text
              style={{
                color: activeTab === "past" ? "#fff" : "#6b7280",
                fontWeight: activeTab === "past" ? "bold" : "normal",
              }}
            >
              Geçmiş
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 4,
              backgroundColor: activeTab === "created" ? "#047857" : "transparent",
              alignItems: "center",
            }}
            onPress={() => handleTabChange("created")}
          >
            <Text
              style={{
                color: activeTab === "created" ? "#fff" : "#6b7280",
                fontWeight: activeTab === "created" ? "bold" : "normal",
              }}
            >
              Oluşturduğum
            </Text>
          </TouchableOpacity>
        </HStack>

        {/* Category scrolling row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 12 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                marginRight: 8,
                backgroundColor:
                  selectedCategory === category.name ? "#e6f7f2" : "#f3f4f6",
                borderWidth: 1,
                borderColor:
                  selectedCategory === category.name ? "#047857" : "transparent",
              }}
              onPress={() => setSelectedCategory(category.name)}
            >
              <HStack space="md" style={{ alignItems: "center" }}>
                <Text style={{ marginRight: 4 }}>{category.icon}</Text>
                <Text
                  style={{
                    color:
                      selectedCategory === category.name ? "#047857" : "#4b5563",
                    fontWeight:
                      selectedCategory === category.name ? "bold" : "normal",
                  }}
                >
                  {category.name}
                </Text>
              </HStack>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Date filter scrolling row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 6 }}
        >
          {dateFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                marginRight: 8,
                backgroundColor:
                  selectedDate === filter.name ? "#e6f7f2" : "#f3f4f6",
                borderWidth: 1,
                borderColor:
                  selectedDate === filter.name ? "#047857" : "transparent",
              }}
              onPress={() => setSelectedDate(filter.name)}
            >
              <Text
                style={{
                  color: selectedDate === filter.name ? "#047857" : "#4b5563",
                  fontWeight: selectedDate === filter.name ? "bold" : "normal",
                }}
              >
                {filter.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Event list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#047857" />
          <Text style={styles.loadingText}>Etkinlikler yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEvents}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 24,
            ...(filteredEvents.length === 0 ? { flex: 1, justifyContent: 'center' } : {})
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#047857"]}
              tintColor="#047857"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4b5563',
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  eventHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  dateBox: {
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    padding: 4,
    marginRight: 8,
  },
  dateNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  dateMonth: {
    fontSize: 12,
    color: "#6b7280",
  },
  eventDetails: {
    flex: 1,
  },
  eventTopInfo: {
    alignItems: "center",
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: "#6b7280",
  },
  organizerBadge: {
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    padding: 4,
  },
  organizerBadgeText: {
    fontSize: 12,
    color: "#6b7280",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  eventTypeContainer: {
    alignItems: "center",
  },
  typeTag: {
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    padding: 4,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#047857",
    fontWeight: "bold",
  },
  eventFooter: {
    alignItems: "center",
    marginTop: 12,
    justifyContent: "space-between",
  },
  locationInfo: {
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 4,
  },
  participantsInfo: {
    alignItems: "center",
  },
  participantsText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 4,
  },
  joinedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: "#047857",
    borderRadius: 4,
    padding: 4,
  },
  joinedContent: {
    alignItems: "center",
  },
  joinedText: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 300,
  },
  refreshButton: {
    backgroundColor: "#047857",
    borderRadius: 4,
    padding: 12,
    width: 180,
    alignItems: "center",
  },
  refreshButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
});