import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  ArrowLeft,
  X,
  Search,
  Clock,
  MapPin,
  CalendarClock,
} from "lucide-react-native";
import { router } from "expo-router";
import { eventsApi } from "@/services/api/events";
import { usersApi } from "@/services/api/users";
import LoadingAnimation from "../animations/LoadingAnimations";

type SearchModalProps = {
  visible: boolean;
  onClose: () => void;
};

type SearchResult = {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  type: "event" | "user" | "venue";
};

const SearchModal: React.FC<SearchModalProps> = ({ visible, onClose }) => {
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "events" | "users">("all");

  // Input'a odaklanma
  const handleInputFocus = () => {
    if (searchText.length === 0 && searchHistory.length === 0) {
      // Geçmiş arama sonuçlarını yükleyebiliriz
      loadSearchHistory();
    }
  };

  // Arama geçmişini yükleme (normalde AsyncStorage'dan gelecektir)
  const loadSearchHistory = () => {
    // Burada AsyncStorage'dan yükleme yapılabilir
    setSearchHistory([
      "basketbol etkinlikleri",
      "tenis antrenörü",
      "koşu parkuru",
    ]);
  };

  // Geçmiş aramadan bir arama seçildiğinde
  const handleHistoryPress = (historyItem: string) => {
    setSearchText(historyItem);
    performSearch(historyItem);
  };

  // Geçmiş aramayı temizleme
  const clearSearchHistory = () => {
    setSearchHistory([]);
    // AsyncStorage'dan da temizlemek gerekiyor
  };

  // Arama yapma
  const performSearch = async (query: string = searchText) => {
    if (query.trim().length < 2) return;

    setIsLoading(true);

    try {
      const results: SearchResult[] = [];

      // Etkinlik aramalarını yap (events API)
      if (activeTab === "all" || activeTab === "events") {
        try {
          const eventsResult = await eventsApi.searchEvents(query);
          if (eventsResult?.events?.length > 0) {
            const mappedEvents = eventsResult.events.map((event: any) => ({
              id: event.id.toString(),
              title: event.title,
              subtitle: event.location_name || "Konum bilgisi yok",
              image: event.image_url || undefined,
              type: "event" as const,
            }));
            results.push(...mappedEvents);
          }
        } catch (error) {
          console.error("Etkinlik arama hatası:", error);
        }
      }

      // Kullanıcı aramalarını yap (users API)
      if (activeTab === "all" || activeTab === "users") {
        try {
          const usersResult = await usersApi.searchUsers(query);
          if (usersResult?.length > 0) {
            const mappedUsers = usersResult.map((user) => ({
              id: user.id,
              title: `${user.first_name} ${user.last_name}`,
              subtitle: user.role === "TRAINER" ? "Antrenör" : undefined,
              image: user.profile_picture || undefined,
              type: "user" as const,
            }));
            results.push(...mappedUsers);
          }
        } catch (error) {
          console.error("Kullanıcı arama hatası:", error);
        }
      }

      setResults(results);

      // Geçmişe ekle
      if (query.trim() && !searchHistory.includes(query.trim())) {
        const updatedHistory = [query.trim(), ...searchHistory.slice(0, 4)];
        setSearchHistory(updatedHistory);
        // AsyncStorage'a da kaydet
      }
    } catch (error) {
      console.error("Arama hatası:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Arama sonuç öğesine tıklama
  const handleResultPress = (item: SearchResult) => {
    onClose();

    if (item.type === "event") {
      router.push({
        pathname: "/(tabs)/dashboard/event-details",
        params: { id: item.id },
      });
    } else if (item.type === "user") {
      router.push({
        pathname: "/profile/user-profile",
        params: { id: item.id },
      });
    }
  };

  // Arama input'ı temizleme
  const clearSearch = () => {
    setSearchText("");
    setResults([]);
  };

  // Tab değiştirme
  const handleTabChange = (tab: "all" | "events" | "users") => {
    setActiveTab(tab);
    if (searchText.length > 1) {
      performSearch();
    }
  };

  // Arama başlatma
  const handleSearch = () => {
    Keyboard.dismiss();
    performSearch();
  };

  // Sonuç öğesi render etme
  const renderResultItem = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleResultPress(item)}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.resultImage} />
      ) : (
        <View
          style={[
            styles.resultImage,
            styles.placeholderImage,
            { backgroundColor: item.type === "event" ? "#10B981" : "#3B82F6" },
          ]}
        >
          {item.type === "event" ? (
            <CalendarClock size={18} color="#fff" />
          ) : (
            <MapPin size={18} color="#fff" />
          )}
        </View>
      )}
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.title}
        </Text>
        {item.subtitle && (
          <Text style={styles.resultSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Geçmiş arama öğesi render etme
  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleHistoryPress(item)}
    >
      <Clock size={16} color="#64748B" />
      <Text style={styles.historyText} numberOfLines={1}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  // Modali dışına tıklandığında klavyeyi kapatma
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <ArrowLeft size={24} color="#0F172A" />
              </TouchableOpacity>

              <View style={styles.searchInputContainer}>
                <Search size={18} color="#64748B" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Etkinlik, salon, antrenör ara..."
                  placeholderTextColor="#94A3B8"
                  value={searchText}
                  onChangeText={setSearchText}
                  onSubmitEditing={handleSearch}
                  autoFocus
                  onFocus={handleInputFocus}
                />
                {searchText.length > 0 && (
                  <TouchableOpacity onPress={clearSearch}>
                    <X size={18} color="#64748B" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Tab seçiciler */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === "all" && styles.activeTab]}
                onPress={() => handleTabChange("all")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "all" && styles.activeTabText,
                  ]}
                >
                  Tümü
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === "events" && styles.activeTab]}
                onPress={() => handleTabChange("events")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "events" && styles.activeTabText,
                  ]}
                >
                  Etkinlikler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === "users" && styles.activeTab]}
                onPress={() => handleTabChange("users")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "users" && styles.activeTabText,
                  ]}
                >
                  Antrenörler
                </Text>
              </TouchableOpacity>
            </View>

            {/* Yükleniyor göstergesi */}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <LoadingAnimation size={60} />
              </View>
            )}

            {/* Sonuçlar */}
            {!isLoading && results.length > 0 && (
              <FlatList
                data={results}
                renderItem={renderResultItem}
                keyExtractor={(item) => `${item.type}-${item.id}`}
                contentContainerStyle={styles.resultsList}
              />
            )}

            {/* Arama geçmişi */}
            {!isLoading && results.length === 0 && searchHistory.length > 0 && (
              <>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyTitle}>Son Aramalar</Text>
                  <TouchableOpacity onPress={clearSearchHistory}>
                    <Text style={styles.clearText}>Temizle</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={searchHistory}
                  renderItem={renderHistoryItem}
                  keyExtractor={(item, index) => `history-${index}`}
                  contentContainerStyle={styles.historyList}
                />
              </>
            )}

            {/* Sonuç bulunamazsa */}
            {!isLoading && searchText.length > 0 && results.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  "{searchText}" için sonuç bulunamadı
                </Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalContent: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    marginLeft: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 16,
    color: "#0F172A",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: "#ECFDF5",
  },
  tabText: {
    fontSize: 14,
    color: "#64748B",
  },
  activeTabText: {
    color: "#10B981",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    alignItems: "center",
  },
  resultImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0F172A",
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  clearText: {
    fontSize: 14,
    color: "#10B981",
  },
  historyList: {
    paddingHorizontal: 16,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  historyText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#0F172A",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },
});

export default SearchModal;
