import { Text } from "@/components/ui/text";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Calendar,
  Filter,
  MapPin,
  MessageCircle,
  Search,
  UserPlus,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Kullanıcı tipi tanımlama
interface User {
  id: number;
  name: string;
  age: number;
  location: string;
  sportsInterested: string[];
  avatarUrl: string;
  isOnline: boolean;
}

// Spor kategorisi tipi tanımlama
interface SportCategory {
  id: string;
  name: string;
  icon: string; // Bu bir icon adı veya URL olabilir
}

// Örnek kullanıcı verileri
const usersData: User[] = [
  {
    id: 1,
    name: "Ahmet Yılmaz",
    age: 28,
    location: "Kadıköy, İstanbul",
    sportsInterested: ["Futbol", "Basketbol", "Koşu"],
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    isOnline: true,
  },
  {
    id: 2,
    name: "Zeynep Kaya",
    age: 25,
    location: "Beşiktaş, İstanbul",
    sportsInterested: ["Tenis", "Yüzme", "Pilates"],
    avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    isOnline: false,
  },
  {
    id: 3,
    name: "Burak Demir",
    age: 32,
    location: "Ataşehir, İstanbul",
    sportsInterested: ["Fitness", "Yoga", "Bisiklet"],
    avatarUrl: "https://randomuser.me/api/portraits/men/67.jpg",
    isOnline: true,
  },
  {
    id: 4,
    name: "Elif Şahin",
    age: 27,
    location: "Üsküdar, İstanbul",
    sportsInterested: ["Pilates", "Koşu", "Dağ Yürüyüşü"],
    avatarUrl: "https://randomuser.me/api/portraits/women/28.jpg",
    isOnline: true,
  },
  {
    id: 5,
    name: "Mert Öztürk",
    age: 30,
    location: "Şişli, İstanbul",
    sportsInterested: ["Basketbol", "Futbol", "Fitness"],
    avatarUrl: "https://randomuser.me/api/portraits/men/22.jpg",
    isOnline: false,
  },
];

// Spor Kategorileri
const sportsCategories: SportCategory[] = [
  { id: "1", name: "Futbol", icon: "⚽" },
  { id: "2", name: "Basketbol", icon: "🏀" },
  { id: "3", name: "Tenis", icon: "🎾" },
  { id: "4", name: "Yüzme", icon: "🏊‍♂️" },
  { id: "5", name: "Koşu", icon: "🏃‍♂️" },
  { id: "6", name: "Bisiklet", icon: "🚴‍♂️" },
  { id: "7", name: "Fitness", icon: "💪" },
  { id: "8", name: "Yoga", icon: "🧘‍♀️" },
  { id: "9", name: "Pilates", icon: "🤸‍♀️" },
  { id: "10", name: "Dağ Yürüyüşü", icon: "🥾" },
];

export default function FindFriendsScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(usersData);
  const [pendingRequests, setPendingRequests] = useState<number[]>([]);

  // Age filter states
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 60]);
  const [tempAgeRange, setTempAgeRange] = useState<[number, number]>([18, 60]);
  const [isAgeFilterActive, setIsAgeFilterActive] = useState(false);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedCategories, ageRange, isAgeFilterActive]);

  const filterUsers = () => {
    let result = usersData;

    // Arama sorgusuna göre filtrele
    if (searchQuery.trim() !== "") {
      result = result.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Seçili kategorilere göre filtrele
    if (selectedCategories.length > 0) {
      result = result.filter((user) =>
        user.sportsInterested.some((sport) =>
          selectedCategories.includes(sport)
        )
      );
    }

    // Yaş aralığına göre filtrele
    if (isAgeFilterActive) {
      result = result.filter(
        (user) => user.age >= ageRange[0] && user.age <= ageRange[1]
      );
    }

    setFilteredUsers(result);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  // Handle age filter apply
  const applyAgeFilter = () => {
    setAgeRange(tempAgeRange);
    setIsAgeFilterActive(true);
    setIsFilterModalVisible(false);
  };

  // Handle reset filters
  const resetFilters = () => {
    setTempAgeRange([18, 60]);
    setAgeRange([18, 60]);
    setIsAgeFilterActive(false);
    setIsFilterModalVisible(false);
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userAvatarContainer}>
          <Image source={{ uri: item.avatarUrl }} style={styles.userAvatar} />
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MapPin size={14} color="#888" />
            <Text style={styles.userLocation}>{item.location}</Text>
          </View>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
          >
            <Calendar size={14} color="#888" />
            <Text style={styles.userLocation}>{item.age} yaşında</Text>
          </View>
        </View>
      </View>

      <View style={styles.userBody}>
        <View style={styles.sportTagsContainer}>
          {item.sportsInterested.map((sport, index) => (
            <View
              key={index}
              style={[
                styles.sportTag,
                selectedCategories.includes(sport) && styles.selectedSportTag,
              ]}
            >
              <Text
                style={[
                  styles.sportTagText,
                  selectedCategories.includes(sport) &&
                    styles.selectedSportTagText,
                ]}
              >
                {sport}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.friendRequestButton,
            pendingRequests.includes(item.id) && styles.requestSentButton,
          ]}
          onPress={() =>
            pendingRequests.includes(item.id)
              ? handleCancelRequest(item.id)
              : handleFriendRequest(item.id)
          }
        >
          {pendingRequests.includes(item.id) ? (
            <>
              <X size={16} color="#fff" />
              <Text style={styles.friendRequestButtonText}>
                İsteği İptal Et
              </Text>
            </>
          ) : (
            <>
              <UserPlus size={16} color="#fff" />
              <Text style={styles.friendRequestButtonText}>Takip Et</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.messageButton}
          onPress={() => handleSendMessage(item.id)}
        >
          <MessageCircle size={16} color="#fff" />
          <Text style={styles.messageButtonText}>Mesaj Gönder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoryItem = ({ item }: { item: SportCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategories.includes(item.name) && styles.selectedCategoryItem,
      ]}
      onPress={() => toggleCategory(item.name)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text
        style={[
          styles.categoryName,
          selectedCategories.includes(item.name) && styles.selectedCategoryName,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Add these functions to handle button presses
  const handleFriendRequest = (userId: number) => {
    console.log(`Arkadaşlık isteği gönderildi: ${userId}`);
    setPendingRequests((prev) => [...prev, userId]);
    // Friend request logic will be implemented here
  };

  const handleCancelRequest = (userId: number) => {
    console.log(`Arkadaşlık isteği iptal edildi: ${userId}`);
    setPendingRequests((prev) => prev.filter((id) => id !== userId));
    // Request cancellation logic will be implemented here
  };

  const handleSendMessage = (userId: number) => {
    console.log(`Mesaj gönderilecek: ${userId}`);
    // Message sending logic will be implemented here
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Yaş Filtresi</Text>
              <TouchableOpacity onPress={() => setIsFilterModalVisible(false)}>
                <X size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.ageRangeContainer}>
                <Text style={styles.ageRangeText}>
                  {tempAgeRange[0]} - {tempAgeRange[1]} yaş aralığı
                </Text>
              </View>

              <Text style={styles.sliderLabel}>
                Minimum Yaş: {tempAgeRange[0]}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={60}
                step={1}
                value={tempAgeRange[0]}
                onValueChange={(value: number) =>
                  setTempAgeRange([value, tempAgeRange[1]])
                }
                minimumTrackTintColor="#3498db"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#3498db"
              />

              <Text style={styles.sliderLabel}>
                Maksimum Yaş: {tempAgeRange[1]}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={60}
                step={1}
                value={tempAgeRange[1]}
                onValueChange={(value: number) =>
                  setTempAgeRange([tempAgeRange[0], value])
                }
                minimumTrackTintColor="#3498db"
                maximumTrackTintColor="#d3d3d3"
                thumbTintColor="#3498db"
              />

              <View style={styles.filterActionButtons}>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={resetFilters}
                >
                  <Text style={styles.resetButtonText}>Filtreleri Sıfırla</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={applyAgeFilter}
                >
                  <Text style={styles.applyButtonText}>Uygula</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Arkadaş Bul</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="İsim veya konum ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            isAgeFilterActive && styles.filterButtonActive,
          ]}
          onPress={() => setIsFilterModalVisible(true)}
        >
          <Filter size={20} color={isAgeFilterActive ? "#fff" : "#666"} />
        </TouchableOpacity>
      </View>

      {/* Filter indicators */}
      {isAgeFilterActive && (
        <View style={styles.activeFiltersContainer}>
          <View style={styles.activeFilterBadge}>
            <Text style={styles.activeFilterText}>
              Yaş: {ageRange[0]}-{ageRange[1]}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIsAgeFilterActive(false);
                setAgeRange([18, 60]);
              }}
            >
              <X size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Spor Kategorileri</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {sportsCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategories.includes(category.name) &&
                  styles.selectedCategoryItem,
              ]}
              onPress={() => toggleCategory(category.name)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryName,
                  selectedCategories.includes(category.name) &&
                    styles.selectedCategoryName,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.resultsContainer}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultCount}>
            {filteredUsers.length} kişi bulundu
          </Text>
        </View>

        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.usersList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  screenTitle: {
    lineHeight: 0,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  categoriesContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 8,
  },
  categoriesScrollContent: {
    paddingVertical: 12,
    paddingRight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  categoryItem: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f1f3f5",
    borderRadius: 20,
    minWidth: 90,
  },
  selectedCategoryItem: {
    backgroundColor: "#4dabf7",
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  selectedCategoryName: {
    color: "#fff",
    fontWeight: "500",
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: 8,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultCount: {
    fontSize: 14,
    color: "#666",
  },
  usersList: {
    padding: 16,
    paddingTop: 8,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userAvatarContainer: {
    position: "relative",
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineIndicator: {
    position: "absolute",
    width: 12,
    height: 12,
    backgroundColor: "#4cd137",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
    right: 0,
    bottom: 0,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  userBody: {
    marginBottom: 12,
  },
  sportTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  sportTag: {
    backgroundColor: "#f1f3f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedSportTag: {
    backgroundColor: "#e3f2fd",
  },
  sportTagText: {
    fontSize: 12,
    color: "#666",
  },
  selectedSportTagText: {
    color: "#1c7ed6",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  messageButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#4dabf7",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  messageButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  friendRequestButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#12b886",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  requestSentButton: {
    backgroundColor: "#ff6b6b",
  },
  friendRequestButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  filterButton: {
    backgroundColor: "#f1f3f5",
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#4dabf7",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    paddingHorizontal: 10,
  },
  ageRangeContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  ageRangeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  sliderLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: 20,
  },
  filterActionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    backgroundColor: "#f1f3f5",
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },
  resetButtonText: {
    color: "#666",
    fontWeight: "bold",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#4dabf7",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  activeFiltersContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    flexWrap: "wrap",
  },
  activeFilterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e9f5ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterText: {
    color: "#4dabf7",
    fontSize: 14,
    marginRight: 8,
  },
});
