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
  Alert,
  ActivityIndicator,
} from "react-native";
import { friendshipsApi } from '@/services/api/friendships';
import { usersApi } from '@/services/api/users';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Kullanıcı tipi tanımlama
interface User {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  age?: number;
  location?: string;
  sportsInterested?: string[];
  isOnline?: boolean;
}

// Spor kategorisi tipi tanımlama
interface SportCategory {
  id: string;
  name: string;
  icon: string;
}

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
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [friends, setFriends] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Age filter states
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 60]);
  const [tempAgeRange, setTempAgeRange] = useState<[number, number]>([18, 60]);
  const [isAgeFilterActive, setIsAgeFilterActive] = useState(false);

  // Arkadaşları yükle ve ardından kullanıcıları yükle
  useEffect(() => {
    loadFriends();
  }, []);

  useEffect(() => {
    if (friends !== null) {
      loadUsers();
    }
  }, [friends]);

  const loadFriends = async () => {
    try {
      const friendsList = await friendshipsApi.getFriends();
      const friendIds = friendsList.map(friend => friend.id);
      setFriends(friendIds);
    } catch (error) {
      setFriends([]);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getUsersByRole();
      const allUsers = response.data.users;
      // Arkadaş olan kullanıcıları filtrele (tip ve trim farkı olmadan)
      const nonFriendUsers = allUsers.filter(user =>
        !(friends ?? []).some(fid => String(fid).trim() === String(user.id).trim())
      );
      setUsers(nonFriendUsers);
      setFilteredUsers(nonFriendUsers);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kullanıcılar yüklenirken bir hata oluştu');
      Alert.alert('Hata', err.response?.data?.message || 'Kullanıcılar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedCategories, ageRange, isAgeFilterActive, users]);

  const filterUsers = () => {
    let result = users;

    // Arama sorgusuna göre filtrele
    if (searchQuery.trim() !== "") {
      result = result.filter((user) =>
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Seçili kategorilere göre filtrele
    if (selectedCategories.length > 0) {
      // Burada kullanıcının spor ilgi alanlarını API'den almalıyız
      // Şimdilik bu filtreyi devre dışı bırakıyoruz
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

  const renderUserItem = ({ item }: { item: User }) => {
    const isFriend = friends?.some(fid => String(fid).trim() === String(item.id).trim());
    console.log('Kullanıcı render ediliyor:', item.id, 'Arkadaş mı:', isFriend);
    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.userAvatarContainer}>
            <Image 
              source={{ uri: item.avatar_url || 'https://via.placeholder.com/150' }} 
              style={styles.userAvatar} 
            />
            <View style={styles.onlineIndicator} />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{`${item.first_name} ${item.last_name}`}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MapPin size={14} color="#888" />
              <Text style={styles.userLocation}>İstanbul</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
              <Calendar size={14} color="#888" />
              <Text style={styles.userLocation}>25 yaşında</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {isFriend ? (
            <View style={[styles.friendRequestButton, styles.friendButton]}>
              <Text style={styles.friendRequestButtonText}>Arkadaş</Text>
            </View>
          ) : (
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
          )}

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
  };

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
  const handleFriendRequest = async (userId: string) => {
    try {
      // Kendine istek göndermeyi engelle
      const currentUser = await AsyncStorage.getItem('user');
      if (currentUser) {
        const { id } = JSON.parse(currentUser);
        if (id === userId) {
          Alert.alert('Hata', 'Kendinize arkadaşlık isteği gönderemezsiniz.');
          return;
        }
      }

      await friendshipsApi.sendRequest(userId);
      setPendingRequests(prev => [...prev, userId]);
      Alert.alert('Başarılı', 'Arkadaşlık isteği gönderildi.');
    } catch (error: any) {
      if (error.response?.status === 409) {
        Alert.alert('Bilgi', 'Bu kullanıcı ile zaten arkadaşsınız veya bekleyen bir isteğiniz var.');
      } else if (error.response?.status === 400) {
        Alert.alert('Hata', 'Geçersiz istek. Lütfen tekrar deneyin.');
      } else {
        Alert.alert('Hata', 'Arkadaşlık isteği gönderilirken bir hata oluştu.');
      }
    }
  };

  const handleCancelRequest = async (userId: string) => {
    try {
      // Burada giden istekleri getirip, ilgili isteğin ID'sini bulup iptal etmemiz gerekiyor
      const outgoingRequests = await friendshipsApi.getOutgoingRequests();
      const request = outgoingRequests.find(req => req.receiver_id === userId);
      
      if (request) {
        await friendshipsApi.cancelRequest(request.id);
        setPendingRequests(prev => prev.filter(id => id !== userId));
        Alert.alert('Başarılı', 'Arkadaşlık isteği iptal edildi.');
      }
    } catch (error) {
      Alert.alert('Hata', 'Arkadaşlık isteği iptal edilirken bir hata oluştu.');
    }
  };

  const handleSendMessage = (userId: string) => {
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

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4dabf7" />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadUsers}>
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.usersList}
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={loadUsers}
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4dabf7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  friendButton: {
    backgroundColor: '#4dabf7',
    opacity: 0.8,
  },
});
