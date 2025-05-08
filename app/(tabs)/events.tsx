import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { router } from "expo-router";
import {
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Filter,
  MapPin,
  Search,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  AlertCircle,
  RefreshCw
} from "lucide-react-native";
import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import {
  Image,
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
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from "../../utils/toastHelper";

// Frontende özel etkinlik arayüzü
interface UIEvent {
  id: string;
  title: string;
  type: string;
  category: string;
  date: string;
  time: string;
  location: string;
  distance: string;
  participants: number;
  maxParticipants: number;
  organizer: string;
  isJoined: boolean;
  image?: string;
  rating?: number;
  description?: string;
}

export default function EventsScreen() {
  // State variables
  const [activeTab, setActiveTab] = useState<string>("upcoming");
  const [events, setEvents] = useState<UIEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<UIEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  const [selectedDate, setSelectedDate] = useState<string>("Tümü");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMoreEvents, setHasMoreEvents] = useState<boolean>(true);
  const PAGE_SIZE = 10;
  
  // Track first render
  const isFirstRender = useRef(true);
  
  // Rate limiting for API calls
  const lastApiCallTime = useRef<number>(0);
  const API_CALL_DEBOUNCE = 300; // ms

  // Category list
  const categories = [
    { id: 1, name: "Tümü", icon: "🏆" },
    { id: 2, name: "Futbol", icon: "⚽" },
    { id: 3, name: "Basketbol", icon: "🏀" },
    { id: 4, name: "Yüzme", icon: "🏊" },
    { id: 5, name: "Tenis", icon: "🎾" },
    { id: 6, name: "Voleybol", icon: "🏐" },
  ];
  
  // Date filter options
  const dateFilters = [
    { id: 1, name: "Tümü" },
    { id: 2, name: "Bugün" },
    { id: 3, name: "Bu Hafta" },
    { id: 4, name: "Bu Ay" },
  ];
  
  // Get current month name array
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];
  
  // Handle auth errors
  const handleAuthError = useCallback(() => {
    (async () => {
      try {
        await AsyncStorage.removeItem("authToken");
        await AsyncStorage.removeItem("userInfo");
      } catch (e) {
        console.error("Auth data temizlenirken hata:", e);
      }
    })();
    
    setError("Oturumunuz sona erdi. Lütfen tekrar giriş yapın.");
    setLoading(false);
    
    showToast("Oturum süresi doldu, tekrar giriş yapmanız gerekiyor.", "error");
    
    setTimeout(() => {
      router.replace("/auth/login");
    }, 500);
  }, []);
  
  // Helper functions for distance calculation
  const deg2rad = (deg: number): number => {
    return deg * (Math.PI/180);
  };
  
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; // Distance in km
  };
  
  // Get user location
  const getUserLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Konum izni reddedildi');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      if (!location || !location.coords) return null;
      
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
    } catch (err) {
      console.error("Konum alınamadı:", err);
      return null;
    }
  }, []);
  
  // Update location on mount
  useEffect(() => {
    getUserLocation().then(location => {
      if (location) setUserLocation(location);
    });
  }, [getUserLocation]);
  
  // Convert API event to UI event
  const mapEventToUIEvent = useCallback((apiEvent: Event): UIEvent => {
    if (!apiEvent) {
      return {
        id: "unknown",
        title: "Etkinlik bulunamadı",
        type: "Diğer",
        category: "Diğer",
        date: "Bilinmiyor",
        time: "Bilinmiyor",
        location: "Bilinmiyor",
        distance: "?? km",
        participants: 0,
        maxParticipants: 0,
        organizer: "Bilinmiyor",
        isJoined: false,
        image: `https://picsum.photos/500/300?random=0`,
        rating: 0,
        description: "Etkinlik bilgileri yüklenemedi",
      };
    }
    
    // Determine event type
    let type = "Etkinlik";
    const title = apiEvent.title?.toLowerCase() || "";
    if (title.includes("kurs")) type = "Kurs";
    else if (title.includes("turnuva")) type = "Yarışma";
    else if (title.includes("antrenman")) type = "Antrenman";
    else if (title.includes("maç")) type = "Spor";
    else type = "Buluşma";
    
    // Format time
    let startTime = "";
    let endTime = "";
    try {
      startTime = new Date(apiEvent.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      endTime = new Date(apiEvent.end_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      startTime = "??:??";
      endTime = "??:??";
    }
    
    // Format date: "23 Ekim"
    let day = 1;
    let month = "Ocak";
    try {
      const date = new Date(apiEvent.event_date);
      day = date.getDate();
      month = months[date.getMonth()];
    } catch (e) {
      // Use defaults
    }
    
    // Calculate distance
    let distance = "?? km";
    if (userLocation && apiEvent.location_lat && apiEvent.location_long) {
      try {
        const distanceInKm = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          apiEvent.location_lat,
          apiEvent.location_long
        );
        distance = `${distanceInKm.toFixed(1)} km`;
      } catch (e) {
        // Use default
      }
    }
    
    return {
      id: apiEvent.id,
      title: apiEvent.title || "İsimsiz Etkinlik",
      type: type,
      category: apiEvent.sport_name || "Diğer",
      date: `${day} ${month}`,
      time: `${startTime}-${endTime}`,
      location: apiEvent.location_name || "Belirtilmemiş",
      distance: distance,
      participants: apiEvent.participant_count || 0,
      maxParticipants: apiEvent.max_participants || 10,
      organizer: apiEvent.creator_name || "Bilinmiyor",
      isJoined: apiEvent.user_joined || false,
      image: `https://picsum.photos/500/300?random=${apiEvent.id}`,
      rating: 4.5,
      description: apiEvent.description || "Açıklama bulunmuyor",
    };
  }, [userLocation, months, calculateDistance]);
  
  // Fetch events from API
  const fetchEvents = useCallback(async (isRefresh: boolean = false) => {
    const now = Date.now();
    if (now - lastApiCallTime.current < API_CALL_DEBOUNCE && !isRefresh) {
      return;
    }
    lastApiCallTime.current = now;
    
    // Set loading state
    if (isRefresh) {
      setRefreshing(true);
      setPage(1);
    } else if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    setError(null);
    
    try {
      // Determine endpoint and params based on active tab
      let endpoint = "";
      let params: any = { page, limit: PAGE_SIZE };
      
      switch (activeTab) {
        case "upcoming":
          if (userLocation) {
            endpoint = "events/nearby";
            params = {
              ...params,
              lat: userLocation.latitude,
              lng: userLocation.longitude,
              radius: 10
            };
          } else {
            endpoint = "events";
            params.status = "ACTIVE";
          }
          break;
        case "past":
          endpoint = "events/my/participated";
          params.status = "COMPLETED";
          break;
        case "created":
          endpoint = "events";
          params.creator = true;
          break;
      }
      
      // Make API call
      const apiEvents = await eventsApi.getAllEvents(page, PAGE_SIZE, endpoint, params);
      
      if (!Array.isArray(apiEvents)) {
        throw new Error("API yanıtı geçersiz format");
      }
      
      // Convert API events to UI events
      const uiEvents = apiEvents.map(mapEventToUIEvent);
      
      // Update state
      if (page === 1 || isRefresh) {
        setEvents(uiEvents);
      } else {
        // Add new events, avoiding duplicates
        const newEvents = [...events];
        uiEvents.forEach(newEvent => {
          if (!newEvents.some(e => e.id === newEvent.id)) {
            newEvents.push(newEvent);
          }
        });
        setEvents(newEvents);
      }
      
      // Check if we have more events
      setHasMoreEvents(apiEvents.length >= PAGE_SIZE);
      
    } catch (err: any) {
      console.error("Etkinlik yüklenirken hata:", err);
      
      // Check if auth error
      if (err.message?.includes("token") || 
          err.message?.includes("giriş") || 
          err.message?.includes("oturum") ||
          err.status === 401) {
        handleAuthError();
        return;
      }
      
      setError(err instanceof Error ? err.message : "Etkinlikler yüklenemedi");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [activeTab, page, userLocation, events, PAGE_SIZE, mapEventToUIEvent, handleAuthError]);
  
  // Filter events based on search, category, and date
  const filterEvents = useCallback(() => {
    if (!events.length) {
      setFilteredEvents([]);
      return;
    }
    
    let filtered = [...events];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
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
      const today = new Date();
      
      filtered = filtered.filter(event => {
        // Parse event date (format: "23 Ekim")
        const parts = event.date.split(" ");
        if (parts.length !== 2) return false;
        
        const day = parseInt(parts[0]);
        const monthName = parts[1];
        const monthIndex = months.indexOf(monthName);
        if (monthIndex === -1) return false;
        
        const eventDate = new Date();
        eventDate.setDate(day);
        eventDate.setMonth(monthIndex);
        
        switch (selectedDate) {
          case "Bugün":
            return eventDate.getDate() === today.getDate() && 
                   eventDate.getMonth() === today.getMonth() &&
                   eventDate.getFullYear() === today.getFullYear();
          case "Bu Hafta":
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return eventDate >= startOfWeek && eventDate <= endOfWeek;
          case "Bu Ay":
            return eventDate.getMonth() === today.getMonth() && 
                   eventDate.getFullYear() === today.getFullYear();
          default:
            return true;
        }
      });
    }
    
    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedCategory, selectedDate, months]);
  
  // Fetch events when component mounts or tab changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchEvents();
    } else {
      setPage(1);
      fetchEvents();
    }
  }, [activeTab]);
  
  // Apply filters when events or filter criteria change
  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, selectedCategory, selectedDate, filterEvents]);
  
  // Handle refresh
  const handleRefresh = useCallback(() => {
    setPage(1);
    fetchEvents(true);
  }, [fetchEvents]);
  
  // Load more events when reaching the end of the list
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMoreEvents && !loading && !refreshing) {
      setPage(prevPage => prevPage + 1);
      fetchEvents();
    }
  }, [loadingMore, hasMoreEvents, loading, refreshing, fetchEvents]);
  
  // Handle tab change
  const handleTabChange = useCallback((tab: string) => {
    if (tab === activeTab) return;
    
    setActiveTab(tab);
    setSelectedCategory("Tümü");
    setSelectedDate("Tümü");
    setSearchQuery("");
  }, [activeTab]);
  
  // Handle category selection
  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);
  
  // Handle date filter selection
  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);
  
  // Toggle search bar
  const toggleSearch = useCallback(() => {
    setShowSearch(prev => {
      if (prev) setSearchQuery("");
      return !prev;
    });
  }, []);
  
  // Navigate to event details
  const handleEventPress = useCallback((eventId: string) => {
    if (!eventId || loading || loadingMore || refreshing) return;
    router.push(`/dashboard/event-details?id=${eventId}`);
  }, [loading, loadingMore, refreshing]);
  
  // Render event item for FlatList
  const renderEventItem = useCallback(({ item }: { item: UIEvent }) => {
    return (
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
                <Text style={styles.organizerBadgeText}>{item.organizer}</Text>
                <CheckCircle
                  size={12}
                  color="#047857"
                  style={{ marginLeft: 4 }}
                />
              </HStack>
            </HStack>

            <Text style={styles.eventTitle}>{item.title}</Text>

            {item.description && (
              <Text style={styles.eventDescription} numberOfLines={1}>
                {item.description}
              </Text>
            )}

            <HStack style={styles.eventTypeContainer}>
              <Box
                style={item.type === "Spor" ? styles.workTag : styles.meetingTag}
              >
                <Text style={styles.tagText}>{item.type}</Text>
              </Box>

              <HStack style={styles.ratingInfo}>
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                <Text style={styles.ratingText}>{item.rating?.toFixed(1)}</Text>
              </HStack>
            </HStack>
          </VStack>
        </HStack>

        <HStack style={styles.eventFooter}>
          <HStack style={styles.locationInfo}>
            <MapPin size={14} color="#6b7280" />
            <Text style={styles.locationText}>{item.location}</Text>
            <Text style={styles.distanceText}>· {item.distance}</Text>
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
  }, [handleEventPress]);
  
  // Render empty state
  const renderEmptyState = useMemo(() => {
    if (loading) return null;
    
    let title = "Etkinlik Bulunamadı";
    let message = "Seçilen filtrelere uygun etkinlik bulunamadı. Filtreleri değiştirerek tekrar deneyin.";
    
    if (error) {
      title = "Bir Hata Oluştu";
      message = error;
    } else if (filteredEvents.length === 0) {
      if (activeTab === "upcoming") {
        if (searchQuery || selectedCategory !== "Tümü" || selectedDate !== "Tümü") {
          title = "Filtrelere Uygun Etkinlik Yok";
          message = "Seçilen filtrelere uygun etkinlik bulunamadı. Filtreleri değiştirerek tekrar deneyin.";
        } else {
          title = "Yakında Etkinlik Yok";
          message = "Şu anda yaklaşan etkinlik bulunmuyor. Daha sonra tekrar kontrol edin veya kendi etkinliğinizi oluşturun.";
        }
      } else if (activeTab === "past") {
        title = "Geçmiş Etkinlik Yok";
        message = "Henüz katıldığınız tamamlanmış etkinlik bulunmuyor.";
      } else if (activeTab === "created") {
        title = "Oluşturduğunuz Etkinlik Yok";
        message = "Henüz etkinlik oluşturmadınız. Yeni bir etkinlik oluşturmak için ana sayfadaki + butonuna tıklayın.";
      }
    }
    
    return (
      <View style={styles.emptyState}>
        <TrendingUp size={40} color="#9ca3af" />
        <Text style={styles.emptyStateTitle}>{title}</Text>
        <Text style={styles.emptyStateText}>{message}</Text>
        {(searchQuery || selectedCategory !== "Tümü" || selectedDate !== "Tümü") && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => {
              setSearchQuery("");
              setSelectedCategory("Tümü");
              setSelectedDate("Tümü");
              setPage(1);
              fetchEvents();
            }}
          >
            <Text style={styles.refreshButtonText}>Filtreleri Sıfırla</Text>
          </TouchableOpacity>
        )}
        {!error && !searchQuery && selectedCategory === "Tümü" && selectedDate === "Tümü" && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
          >
            <Text style={styles.refreshButtonText}>Yenile</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }, [loading, error, filteredEvents.length, activeTab, searchQuery, selectedCategory, selectedDate, fetchEvents, handleRefresh]);
  
  // Render footer component for FlatList
  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#047857" />
        <Text style={styles.loadingText}>Daha fazla yükleniyor...</Text>
      </View>
    );
  }, [loadingMore]);
  
  // Render error component
  if (error && error.includes("Oturumunuz sona erdi")) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Box style={styles.errorBox}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
          <Text style={styles.errorTitle}>Oturum Sona Erdi</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.replace("/auth/login")}>
            <Text style={styles.loginButtonText}>Giriş Yap</Text>
          </TouchableOpacity>
        </Box>
      </SafeAreaView>
    );
  }
  
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
              onPress={() => router.push("/dashboard/all-events")}
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
              backgroundColor: activeTab === "upcoming" ? "#047857" : "transparent",
              alignItems: "center",
            }}
            onPress={() => handleTabChange("upcoming")}
          >
            <Text
              style={{
                color: activeTab === "upcoming" ? "#fff" : "#6b7280",
                fontWeight: activeTab === "upcoming" ? "bold" : "normal",
              }}
            >
              Yaklaşan
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
              onPress={() => handleCategorySelect(category.name)}
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
              onPress={() => handleDateSelect(filter.name)}
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
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#047857"]}
            tintColor="#047857"
          />
        }
        // Performance optimizations
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={7}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  eventDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  eventTypeContainer: {
    alignItems: "center",
  },
  workTag: {
    backgroundColor: "#e6f7f2",
    borderRadius: 4,
    padding: 4,
  },
  meetingTag: {
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    padding: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#047857",
    fontWeight: "bold",
  },
  eventFooter: {
    alignItems: "center",
    marginTop: 12,
  },
  locationInfo: {
    alignItems: "center",
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#6b7280",
  },
  distanceText: {
    fontSize: 12,
    color: "#6b7280",
  },
  participantsInfo: {
    alignItems: "center",
  },
  participantsText: {
    fontSize: 14,
    color: "#6b7280",
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: "#047857",
    borderRadius: 4,
    padding: 12,
    width: 200,
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#f59e0b',
    marginLeft: 2,
    fontWeight: 'bold',
  },
  loadingFooter: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4b5563',
  }
});