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
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Event tipi tanımlama
interface Event {
  id: number;
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

// Örnek veri - Resim ve açıklama alanları eklendi
const eventsData: Event[] = [
  {
    id: 1,
    title: "Basketbol Maçı",
    type: "Spor",
    category: "Basketbol",
    date: "23 Ekim",
    time: "11:00-13:00",
    location: "Konya Basket Sahası",
    distance: "1.2 km",
    participants: 10,
    maxParticipants: 12,
    organizer: "Konya Spor Kulübü",
    isJoined: true,
    image: "https://picsum.photos/500/300?random=1",
    rating: 4.5,
    description:
      "Basketbol severler için haftalık dostluk maçı. Her seviyeden oyuncular katılabilir.",
  },
  {
    id: 2,
    title: "Futbol Turnuvası",
    type: "Buluşma",
    category: "Futbol",
    date: "25 Ekim",
    time: "14:00-17:00",
    location: "Meram Futbol Sahası",
    distance: "2.5 km",
    participants: 18,
    maxParticipants: 22,
    organizer: "Meram Spor",
    isJoined: true,
    image: "https://picsum.photos/500/300?random=2",
    rating: 4.2,
    description:
      "5v5 halı saha futbol turnuvası. Kazanan takıma kupa verilecektir.",
  },
  {
    id: 3,
    title: "Yüzme Etkinliği",
    type: "Kurs",
    category: "Yüzme",
    date: "28 Ekim",
    time: "15:00-16:30",
    location: "Selçuklu Olimpik Havuz",
    distance: "3.7 km",
    participants: 8,
    maxParticipants: 12,
    organizer: "Yüzme Kulübü",
    isJoined: false,
    image: "https://picsum.photos/500/300?random=3",
    rating: 4.7,
    description:
      "Tüm seviyelere uygun yüzme etkinliği. Profesyonel eğitmenler eşliğinde stil geliştirme.",
  },
  {
    id: 4,
    title: "Tenis Turnuvası",
    type: "Yarışma",
    category: "Tenis",
    date: "30 Ekim",
    time: "10:00-16:00",
    location: "Konya Tenis Kulübü",
    distance: "4.1 km",
    participants: 12,
    maxParticipants: 16,
    organizer: "Tenis Akademi",
    isJoined: false,
    image: "https://picsum.photos/500/300?random=4",
    rating: 4.9,
    description:
      "Başlangıç seviyesinden ileri seviyeye tenis dersleri. Raketler kulüp tarafından sağlanmaktadır.",
  },
  {
    id: 5,
    title: "Voleybol Antrenmanı",
    type: "Antrenman",
    category: "Voleybol",
    date: "1 Kasım",
    time: "19:00-21:00",
    location: "Selçuklu Spor Salonu",
    distance: "2.8 km",
    participants: 14,
    maxParticipants: 16,
    organizer: "Konya Voleybol Derneği",
    isJoined: true,
    image: "https://picsum.photos/500/300?random=5",
    rating: 4.3,
    description:
      "Hem eğlence hem de profesyonel antrenman için voleybol etkinliği.",
  },
];

export default function EventsScreen() {
  const [activeTab, setActiveTab] = useState<string>("upcoming"); // 'past', 'upcoming', 'created'
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(
    eventsData.slice(2, 4) // Başlangıçta yaklaşan etkinlikleri göster
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [allFilteredEvents, setAllFilteredEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Tümü");
  const [showDateFilter, setShowDateFilter] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>("Tümü");
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Kategori listesi
  const categories = [
    { id: 1, name: "Tümü", icon: "🏆" },
    { id: 2, name: "Futbol", icon: "⚽" },
    { id: 3, name: "Basketbol", icon: "🏀" },
    { id: 4, name: "Yüzme", icon: "🏊" },
    { id: 5, name: "Tenis", icon: "🎾" },
    { id: 6, name: "Voleybol", icon: "🏐" },
  ];

  // Yıl dizisi (son 2 yıl ve gelecek 3 yıl)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Ay dizisi
  const months = [
    { value: 0, label: "Ocak" },
    { value: 1, label: "Şubat" },
    { value: 2, label: "Mart" },
    { value: 3, label: "Nisan" },
    { value: 4, label: "Mayıs" },
    { value: 5, label: "Haziran" },
    { value: 6, label: "Temmuz" },
    { value: 7, label: "Ağustos" },
    { value: 8, label: "Eylül" },
    { value: 9, label: "Ekim" },
    { value: 10, label: "Kasım" },
    { value: 11, label: "Aralık" },
  ];

  // Temel tarih filtreleme seçenekleri
  const basicDateFilters = [
    { id: 1, name: "Tümü", label: "Tüm Tarihler" },
    { id: 2, name: "Bugün", label: "Bugün" },
    { id: 3, name: "Bu Hafta", label: "Bu Hafta" },
    { id: 4, name: "Bu Ay", label: "Bu Ay" },
  ];

  useEffect(() => {
    // Tab, arama, kategori veya tarih değiştiğinde filtrelemeyi güncelle
    filterEvents(activeTab, selectedCategory, selectedDate);
  }, [activeTab, searchQuery, selectedCategory, selectedDate]);

  const filterEvents = (tab: string, category: string, dateFilter: string) => {
    let tabFilteredEvents: Event[] = [];

    switch (tab) {
      case "past":
        // Gerçek uygulamada geçmiş etkinlikleri filtreleyecek
        tabFilteredEvents = eventsData.slice(0, 2);
        break;
      case "upcoming":
        // Gerçek uygulamada gelecek etkinlikleri filtreleyecek
        tabFilteredEvents = eventsData.slice(2, 4);
        break;
      case "created":
        // Gerçek uygulamada kullanıcının oluşturduğu etkinlikleri filtreleyecek
        tabFilteredEvents = [eventsData[4]];
        break;
      default:
        tabFilteredEvents = eventsData.slice(2, 4);
    }

    // Kategori filtrelemesi
    if (category !== "Tümü") {
      tabFilteredEvents = tabFilteredEvents.filter(
        (event) => event.category === category
      );
    }

    // Tarih filtrelemesi
    if (dateFilter !== "Tümü") {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // Bu basitleştirilmiş bir örnektir. Gerçek uygulamada tam tarih karşılaştırması yapılmalıdır.
      switch (dateFilter) {
        case "Bugün":
          // Örnek olarak "23 Ekim" formatındaki tarihi kontrol ediyoruz
          const todayStr = `${today.getDate()} Ekim`; // Gerçek uygulamada ay dinamik olmalı
          tabFilteredEvents = tabFilteredEvents.filter(
            (event) => event.date === todayStr
          );
          break;
        case "Bu Hafta":
          // Basitleştirilmiş örnek - gerçek uygulamada hafta hesaplaması yapılmalı
          tabFilteredEvents = tabFilteredEvents.filter(
            (event) =>
              parseInt(event.date.split(" ")[0]) >= today.getDate() &&
              parseInt(event.date.split(" ")[0]) < today.getDate() + 7
          );
          break;
        case "Bu Ay":
          // Tüm Ekim (örnek) etkinlikleri
          tabFilteredEvents = tabFilteredEvents.filter((event) =>
            event.date.includes("Ekim")
          );
          break;
        default:
          // Özel tarih filtreleme (yıl-ay)
          if (selectedYear && selectedMonth) {
            tabFilteredEvents = tabFilteredEvents.filter((event) =>
              event.date.includes(selectedMonth)
            );
          }
          break;
      }
    }

    // Arama sorgusu varsa, isim veya adrese göre filtrele
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      tabFilteredEvents = tabFilteredEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    setAllFilteredEvents(tabFilteredEvents);
    setFilteredEvents(tabFilteredEvents);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    filterEvents(tab, selectedCategory, selectedDate);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleBasicDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedYear(null);
    setSelectedMonth(null);
    setExpandedYear(null);
  };

  const toggleDateFilter = () => {
    setShowDateFilter(!showDateFilter);
    if (!showDateFilter) {
      // Filtre açılırken genişletilen yılı sıfırla
      setExpandedYear(null);
    }
  };

  const toggleYearExpansion = (year: number) => {
    setExpandedYear(expandedYear === year ? null : year);
  };

  const handleMonthSelect = (year: number, month: string) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDate(`${month} ${year}`);
    setShowDateFilter(false);
  };

  const resetDateFilter = () => {
    setSelectedDate("Tümü");
    setSelectedYear(null);
    setSelectedMonth(null);
    setExpandedYear(null);
    setShowDateFilter(false);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      // Arama kapanınca sorguyu temizle
      setSearchQuery("");
      filterEvents(activeTab, selectedCategory, selectedDate);
    }
  };

  const handleEventPress = (eventId: number) => {
    router.push(`/dashboard/event-details?id=${eventId}`);
  };

  // Öne çıkan etkinliği bul (rating'e göre)
  const featuredEvent =
    filteredEvents.length > 0
      ? [...filteredEvents].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]
      : null;

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Basketbol: "#e74c3c",
      Futbol: "#2ecc71",
      Yüzme: "#3498db",
      Tenis: "#f39c12",
      Voleybol: "#9b59b6",
    };

    return colors[category] || "#95a5a6";
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(item.id)}
    >
      <HStack style={styles.eventHeader}>
        <Box style={styles.dateBox}>
          <Text style={styles.dateNumber}>{item.date.split(" ")[0]}</Text>
          <Text style={styles.dateMonth}>Eki</Text>
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
              <Text style={styles.ratingText}>{item.rating}</Text>
            </HStack>
          </HStack>

          <HStack style={styles.eventExtraInfo}>
            <Box style={styles.distanceInfo}>
              <MapPin size={14} color="#666" style={{ marginRight: 4 }} />
              <Text style={styles.distanceText}>
                {item.location} ({item.distance})
              </Text>
            </Box>
          </HStack>

          <HStack style={styles.participantsInfo}>
            <Users size={14} color="#666" />
            <Text style={styles.participantsText}>
              {item.participants}/{item.maxParticipants} katılımcı
            </Text>
            {item.isJoined && (
              <HStack style={{ alignItems: "center", marginLeft: 8 }}>
                <UserCheck size={16} color="#047857" />
                <Text style={styles.joinedText}>Katılıyorsun</Text>
              </HStack>
            )}
          </HStack>
        </VStack>
      </HStack>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Box style={styles.header}>
        <Text style={styles.headerTitle}>Etkinliklerim</Text>
        <HStack>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={toggleDateFilter}
          >
            <Filter
              size={20}
              color={selectedDate !== "Tümü" ? "#047857" : "#333"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={toggleSearch}
          >
            {showSearch ? (
              <TouchableOpacity onPress={toggleSearch}>
                <Text style={styles.cancelSearchText}>İptal</Text>
              </TouchableOpacity>
            ) : (
              <Search size={20} color="#333" />
            )}
          </TouchableOpacity>
        </HStack>
      </Box>

      {/* Search Bar */}
      {showSearch && (
        <Box style={styles.searchBarContainer}>
          <HStack style={styles.searchBar}>
            <Search size={20} color="#047857" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Etkinlik adı veya adrese göre ara"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              clearButtonMode="while-editing"
            />
          </HStack>
          {searchQuery.trim() !== "" && (
            <Box style={styles.searchResultsInfo}>
              <Text style={styles.searchResultsText}>
                "{searchQuery}" için {filteredEvents.length} sonuç bulundu
              </Text>
            </Box>
          )}
        </Box>
      )}

      {/* Date Filter Panel */}
      {showDateFilter && (
        <Box style={styles.dateFilterPanel}>
          <HStack style={styles.dateFilterHeader}>
            <Text style={styles.dateFilterTitle}>Tarihe Göre Filtrele</Text>
            <TouchableOpacity
              style={styles.resetFilterButton}
              onPress={resetDateFilter}
            >
              <Text style={styles.resetFilterText}>Sıfırla</Text>
            </TouchableOpacity>
          </HStack>

          {/* Basic Date Filters */}
          {basicDateFilters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.dateFilterItem,
                selectedDate === filter.name && styles.selectedDateFilterItem,
              ]}
              onPress={() => handleBasicDateSelect(filter.name)}
            >
              <Text
                style={[
                  styles.dateFilterText,
                  selectedDate === filter.name && styles.selectedDateFilterText,
                ]}
              >
                {filter.label}
              </Text>
              {selectedDate === filter.name && (
                <CheckCircle
                  size={18}
                  color="#047857"
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))}

          {/* Year Buttons with Accordion */}
          <Text style={styles.yearSectionTitle}>Yıl Seçin</Text>
          {years.map((year) => (
            <View key={year}>
              <TouchableOpacity
                style={[
                  styles.yearButton,
                  selectedYear === year &&
                    !selectedMonth &&
                    styles.selectedYearButton,
                ]}
                onPress={() => toggleYearExpansion(year)}
              >
                <Text
                  style={[
                    styles.yearButtonText,
                    selectedYear === year &&
                      !selectedMonth &&
                      styles.selectedYearButtonText,
                  ]}
                >
                  {year}
                </Text>
                {expandedYear === year ? (
                  <ChevronUp size={20} color="#666" />
                ) : (
                  <ChevronDown size={20} color="#666" />
                )}
              </TouchableOpacity>

              {/* Month Buttons (shown only when year is expanded) */}
              {expandedYear === year && (
                <View style={styles.monthButtonsContainer}>
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month.value}
                      style={[
                        styles.monthButton,
                        selectedYear === year &&
                          selectedMonth === month.label &&
                          styles.selectedMonthButton,
                      ]}
                      onPress={() => handleMonthSelect(year, month.label)}
                    >
                      <Text
                        style={[
                          styles.monthButtonText,
                          selectedYear === year &&
                            selectedMonth === month.label &&
                            styles.selectedMonthButtonText,
                        ]}
                      >
                        {month.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </Box>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Category Filters - Always visible now */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFiltersContainer}
          contentContainerStyle={styles.categoryFiltersContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.name &&
                  styles.selectedCategoryButton,
              ]}
              onPress={() => handleCategorySelect(category.name)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryName,
                  selectedCategory === category.name &&
                    styles.selectedCategoryName,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Tabs */}
        <Box style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
            onPress={() => handleTabChange("upcoming")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "upcoming" && styles.activeTabText,
              ]}
            >
              Yaklaşan
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
        </Box>

        {/* Featured Event */}
        {featuredEvent && (
          <Box style={styles.featuredEventContainer}>
            <HStack
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
              }}
            >
              <Text style={styles.featuredEventTitle}>Öne Çıkan Etkinlik</Text>
              <HStack style={styles.trendingBadge}>
                <TrendingUp size={14} color="#047857" />
                <Text style={styles.trendingText}>Popüler</Text>
              </HStack>
            </HStack>

            <TouchableOpacity
              style={styles.featuredEventCard}
              onPress={() => handleEventPress(featuredEvent.id)}
            >
              <Image
                source={{
                  uri: featuredEvent.image || "https://picsum.photos/500/300",
                }}
                style={styles.featuredEventImage}
              />
              <Box style={styles.featuredEventBadge}>
                <Text style={styles.featuredEventBadgeText}>ÖNE ÇIKAN</Text>
              </Box>

              <Box style={styles.featuredEventContent}>
                <HStack style={styles.featuredEventMeta}>
                  <Box style={styles.featuredEventCategory}>
                    <Text style={styles.featuredEventCategoryText}>
                      {featuredEvent.category}
                    </Text>
                  </Box>
                  <HStack style={{ alignItems: "center" }}>
                    <Star size={14} color="#f59e0b" fill="#f59e0b" />
                    <Text style={styles.featuredEventRating}>
                      {featuredEvent.rating}
                    </Text>
                  </HStack>
                </HStack>

                <Text style={styles.featuredEventName}>
                  {featuredEvent.title}
                </Text>
                {featuredEvent.description && (
                  <Text
                    style={styles.featuredEventDescription}
                    numberOfLines={2}
                  >
                    {featuredEvent.description}
                  </Text>
                )}

                <HStack style={styles.featuredEventDetails}>
                  <HStack style={styles.featuredEventDetail}>
                    <Calendar size={14} color="#666" />
                    <Text style={styles.featuredEventDetailText}>
                      {featuredEvent.date}
                    </Text>
                  </HStack>
                  <HStack style={styles.featuredEventDetail}>
                    <Clock size={14} color="#666" />
                    <Text style={styles.featuredEventDetailText}>
                      {featuredEvent.time}
                    </Text>
                  </HStack>
                </HStack>

                <HStack style={styles.featuredEventLocation}>
                  <MapPin size={14} color="#666" />
                  <Text style={styles.featuredEventDetailText}>
                    {featuredEvent.location} ({featuredEvent.distance})
                  </Text>
                </HStack>

                <HStack style={styles.featuredEventOrganizer}>
                  <Text style={styles.featuredEventOrganizerName}>
                    {featuredEvent.organizer}
                  </Text>
                  <HStack style={{ alignItems: "center" }}>
                    <Users size={14} color="#666" />
                    <Text style={styles.featuredEventParticipantsText}>
                      {featuredEvent.participants}/
                      {featuredEvent.maxParticipants} katılımcı
                    </Text>
                  </HStack>
                </HStack>
              </Box>
            </TouchableOpacity>
          </Box>
        )}

        {/* Events List Header */}
        <HStack style={styles.sectionHeader}>
          <VStack>
            <Text style={styles.sectionTitle}>
              {activeTab === "past"
                ? "Geçmiş Etkinlikler"
                : activeTab === "upcoming"
                ? "Yaklaşan Etkinlikler"
                : "Oluşturduğum Etkinlikler"}
              {searchQuery.trim() !== "" && `: "${searchQuery}"`}
            </Text>
            <HStack style={styles.activeFiltersContainer}>
              {selectedCategory !== "Tümü" && (
                <HStack style={styles.activeFilterBadge}>
                  <Text style={styles.activeFilterIcon}>
                    {categories.find((c) => c.name === selectedCategory)?.icon}
                  </Text>
                  <Text style={styles.activeFilterText}>
                    {selectedCategory}
                  </Text>
                </HStack>
              )}
              {selectedDate !== "Tümü" && (
                <HStack style={styles.activeFilterBadge}>
                  <Text style={styles.activeFilterIcon}>🗓️</Text>
                  <Text style={styles.activeFilterText}>
                    {selectedYear && selectedMonth
                      ? `${selectedMonth} ${selectedYear}`
                      : selectedDate}
                  </Text>
                </HStack>
              )}
            </HStack>
          </VStack>
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>Tümünü Görüntüle</Text>
            <ChevronRight size={16} color="#047857" />
          </TouchableOpacity>
        </HStack>

        {/* Events List */}
        <VStack style={styles.eventsContainer}>
          {filteredEvents.length > 0 ? (
            filteredEvents
              .filter((event) => event.id !== featuredEvent?.id)
              .map((event) => (
                <View key={event.id}>{renderEvent({ item: event })}</View>
              ))
          ) : (
            <Box style={styles.noEventsMessage}>
              {searchQuery.trim() !== "" ? (
                <Text style={styles.noEventsText}>
                  "{searchQuery}" için sonuç bulunamadı.
                </Text>
              ) : selectedCategory !== "Tümü" || selectedDate !== "Tümü" ? (
                <Text style={styles.noEventsText}>
                  Seçilen filtrelere uygun etkinlik bulunamadı.
                </Text>
              ) : (
                <Text style={styles.noEventsText}>
                  Bu kategoride etkinlik bulunamadı.
                </Text>
              )}
            </Box>
          )}
        </VStack>

        {/* Bottom Spacing */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 0,
    fontWeight: "bold",
    color: "#333",
  },
  headerIconButton: {
    padding: 8,
    marginLeft: 5,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 5,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#e6f7f4",
  },
  tabText: {
    color: "#666",
    fontWeight: "500",
    fontSize: 14,
  },
  activeTabText: {
    color: "#047857",
    fontWeight: "600",
  },
  eventsContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  dateBox: {
    width: 50,
    height: 50,
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  dateMonth: {
    fontSize: 14,
    color: "#fff",
  },
  eventDetails: {
    flex: 1,
    marginLeft: 15,
  },
  eventTopInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: "#666",
  },
  organizerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f7f4",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  organizerBadgeText: {
    fontSize: 12,
    color: "#047857",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  eventDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  eventTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  workTag: {
    backgroundColor: "#ffebee",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  meetingTag: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  tagText: {
    fontSize: 12,
    color: "#333",
  },
  eventExtraInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  distanceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    fontSize: 12,
    color: "#666",
  },
  ratingInfo: {
    backgroundColor: "#fff9e6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#f59e0b",
    marginLeft: 4,
  },
  participantsInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  participantsText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  joinedText: {
    fontSize: 12,
    color: "#047857",
    fontWeight: "500",
    marginLeft: 4,
  },
  noEventsMessage: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  noEventsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  featuredEventContainer: {
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 15,
    marginHorizontal: 15,
    borderRadius: 12,
  },
  featuredEventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  trendingBadge: {
    backgroundColor: "#e6f7f4",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  trendingText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#047857",
    marginLeft: 4,
  },
  featuredEventCard: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuredEventImage: {
    width: "100%",
    height: 180,
  },
  featuredEventBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#047857",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  featuredEventBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  featuredEventContent: {
    padding: 15,
  },
  featuredEventMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  featuredEventCategory: {
    backgroundColor: "#e6f7f4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  featuredEventCategoryText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#047857",
  },
  featuredEventRating: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 4,
  },
  featuredEventName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  featuredEventDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  featuredEventDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featuredEventDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  featuredEventDetailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
  },
  featuredEventLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featuredEventOrganizer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  featuredEventOrganizerName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  featuredEventParticipantsText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewAllText: {
    fontSize: 14,
    color: "#047857",
  },
  searchBarContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 4,
  },
  cancelSearchText: {
    color: "#047857",
    fontSize: 14,
    fontWeight: "500",
  },
  searchResultsInfo: {
    marginTop: 8,
    paddingHorizontal: 5,
  },
  searchResultsText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  categoryFiltersContainer: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    marginBottom: 10,
  },
  categoryFiltersContent: {
    paddingHorizontal: 15,
  },
  categoryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flexDirection: "row",
  },
  selectedCategoryButton: {
    backgroundColor: "#e6f7f4",
    borderColor: "#047857",
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryName: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  selectedCategoryName: {
    color: "#047857",
    fontWeight: "600",
  },
  activeFiltersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  activeFilterBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  activeFilterIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  activeFilterText: {
    fontSize: 12,
    color: "#047857",
    fontWeight: "500",
  },
  dateFilterPanel: {
    backgroundColor: "#fff",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  dateFilterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  dateFilterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  resetFilterButton: {
    padding: 5,
  },
  resetFilterText: {
    color: "#047857",
    fontSize: 14,
    fontWeight: "500",
  },
  dateFilterItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
  },
  selectedDateFilterItem: {
    backgroundColor: "#e6f7f4",
  },
  dateFilterText: {
    fontSize: 16,
    color: "#333",
  },
  selectedDateFilterText: {
    color: "#047857",
    fontWeight: "600",
  },
  checkIcon: {
    marginLeft: 10,
  },
  yearSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 10,
  },
  yearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedYearButton: {
    backgroundColor: "#e6f7f4",
  },
  yearButtonText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  selectedYearButtonText: {
    color: "#047857",
    fontWeight: "600",
  },
  monthButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    marginLeft: 10,
  },
  monthButton: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    margin: 4,
  },
  selectedMonthButton: {
    backgroundColor: "#e6f7f4",
  },
  monthButtonText: {
    fontSize: 14,
    color: "#333",
  },
  selectedMonthButtonText: {
    color: "#047857",
    fontWeight: "600",
  },
});
