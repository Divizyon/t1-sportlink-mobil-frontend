import { Text } from "@/components/ui/text";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Calendar,
  Filter,
  MessageCircle,
  Search,
  UserPlus,
  X,
  User as UserIcon,
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
import { friendshipsApi } from "@/services/api/friendships";
import { usersApi, User } from "@/services/api/users";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Kullanıcı için ek tip tanımlamaları
interface EnhancedUser extends User {
  age?: number;
  location?: string;
  sportsInterested?: string[];
  isOnline?: boolean;
  is_online?: boolean; // Support both formats since API may return either
  last_seen_at?: string;
}

// Spor kategorisi tipi tanımlama
interface SportCategory {
  id: string;
  name: string;
  icon: string;
}

// FriendRequest tipi tanımla (Loglar için)
interface FriendRequest {
  id: string;
  receiver_id: string;
  requester_id: string;
  status: string;
  created_at: string;
}

// Yaş hesaplama yardımcı fonksiyonu
const calculateAge = (birthdayDate: string | undefined): number => {
  if (!birthdayDate) return 25; // Default yaş 25 olsun

  try {
    const birthDate = new Date(birthdayDate);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Eğer doğum günü bu yıl henüz geçmediyse yaşı bir azalt
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  } catch (error) {
    console.log("Yaş hesaplama hatası:", error);
    return 25; // Hata durumunda default yaş
  }
};

export default function FindFriendsScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [users, setUsers] = useState<EnhancedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<EnhancedUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [friends, setFriends] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Age filter states
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 60]);
  const [tempAgeRange, setTempAgeRange] = useState<[number, number]>([18, 60]);
  const [isAgeFilterActive, setIsAgeFilterActive] = useState(false);

  // Bekleyen arkadaşlık isteklerini yükle
  const loadPendingRequests = async () => {
    try {
      console.log("[Friends] Bekleyen istekler yükleniyor...");
      const outgoingRequests = await friendshipsApi.getOutgoingRequests();

      if (Array.isArray(outgoingRequests)) {
        console.log(
          `[Friends] ${outgoingRequests.length} bekleyen istek bulundu`
        );
        const pendingIds = outgoingRequests.map(
          (req: FriendRequest) => req.receiver_id
        );
        console.log(`[Friends] Bekleyen istek ID'leri:`, pendingIds);
        setPendingRequests(pendingIds);
      } else {
        console.warn(
          "[Friends] getOutgoingRequests beklenen bir dizi döndürmedi:",
          outgoingRequests
        );
        setPendingRequests([]);
      }
    } catch (error) {
      console.error("[Friends] Bekleyen istekler yüklenemedi:", error);
      setPendingRequests([]); // Hata durumunda boş dizi set et
    }
  };

  // Arkadaşları yükle ve ardından kullanıcıları yükle
  useEffect(() => {
    loadFriends();
    loadPendingRequests(); // Bekleyen istekleri yükle
  }, []);

  useEffect(() => {
    if (friends !== null) {
      loadUsers(1);
    }
  }, [friends]);

  const loadFriends = async () => {
    try {
      const friendsList = await friendshipsApi.getFriends();
      const friendIds = friendsList.map((friend: { id: string }) => friend.id);
      setFriends(friendIds);
    } catch (error) {
      setFriends([]);
    }
  };

  // Kullanıcıyı client tarafında normalize eden yardımcı fonksiyon
  const normalizeUser = (user: User): EnhancedUser => {
    // Yaş hesaplaması
    const age = calculateAge(user.birthday_date);

    return {
      ...user,
      avatar_url: user.profile_picture || user.avatar_url || undefined, // Varsayılan resim için undefined bırakıyoruz
      age: age,
    };
  };

  const loadUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersApi.getUsersByRole(page, 10);

      if (response.status === "success") {
        const allUsers = response.data.users;
        // Arkadaş olan kullanıcıları filtrele (tip ve trim farkı olmadan)
        const nonFriendUsers = allUsers
          .filter(
            (user) =>
              !(friends ?? []).some(
                (fid) => String(fid).trim() === String(user.id).trim()
              )
          )
          .map(normalizeUser);

        // Eğer ilk sayfayı yüklüyorsak, listeyi tamamen değiştir
        // Aksi takdirde, mevcut listeye ekle (sayfalama için)
        if (page === 1) {
          setUsers(nonFriendUsers);
          setFilteredUsers(nonFriendUsers);
        } else {
          setUsers((prev) => [...prev, ...nonFriendUsers]);
          setFilteredUsers((prev) => [...prev, ...nonFriendUsers]);
        }

        setCurrentPage(page);
        setTotalPages(response.data.meta.totalPages);
      } else {
        throw new Error("Kullanıcılar getirilemedi");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Kullanıcılar yüklenirken bir hata oluştu"
      );
      Alert.alert(
        "Hata",
        err.response?.data?.message ||
          "Kullanıcılar yüklenirken bir hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadNextPage = () => {
    if (currentPage < totalPages && !isSearching) {
      loadUsers(currentPage + 1);
    }
  };

  // Kullanıcı aramak için fonksiyon
  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      // Arama metni boş ise normal kullanıcı listesini göster
      loadUsers(1);
      setIsSearching(false);
      return;
    }

    // Arama uzunluğu kontrolü
    if (searchQuery.trim().length < 2) {
      setError("Lütfen en az 2 karakter girin");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setIsSearching(true);

      // API üzerinden arama yap
      const searchResults = await usersApi.searchUsers(searchQuery);

      // Hiç sonuç yoksa, kullanıcıyı bilgilendir ama mevcut listeyi koru
      if (!searchResults || searchResults.length === 0) {
        console.log("Aranan kullanıcı bulunamadı, eşleşen sonuç yok");
        setError(`"${searchQuery}" için sonuç bulunamadı`);
        setFilteredUsers([]);
        setLoading(false);
        return;
      }

      // Arkadaş olan kullanıcıları filtrele
      const nonFriendResults = searchResults
        .filter(
          (user) =>
            !(friends ?? []).some(
              (fid) => String(fid).trim() === String(user.id).trim()
            )
        )
        .map(normalizeUser);

      console.log(`Arama sonucu: ${nonFriendResults.length} kullanıcı bulundu`);
      setFilteredUsers(nonFriendResults);
      setError(null); // Önceki hata mesajları varsa temizle
    } catch (err: any) {
      console.error("Arama hatası:", err);

      // Burada hata yerine daha kullanıcı dostu bir mesaj göster
      if (err.response?.status === 404) {
        setError(`"${searchQuery}" ile eşleşen kullanıcı bulunamadı`);
      } else {
        setError("Arama işlemi sırasında beklenmeyen bir hata oluştu");
      }

      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı arama işlemi için debounce
  useEffect(() => {
    // Aktif aramayı iptal etmek için bir değişken
    let isActive = true;

    // 500ms debounce ile aramaları engelle
    const delaySearch = setTimeout(() => {
      if (!isActive) return;

      if (searchQuery.trim()) {
        // Minimum 2 karakter şartı ekleyelim, gereksiz aramaları önlemek için
        if (searchQuery.trim().length >= 2) {
          searchUsers();
        } else if (searchQuery.trim().length > 0) {
          setError("Lütfen en az 2 karakter girin");
        }
      } else {
        // Arama kutusu boşaltıldıysa
        loadUsers(1);
        setIsSearching(false);
        setError(null); // Hata mesajını temizle
      }
    }, 500);

    // Cleanup fonksiyonu
    return () => {
      isActive = false;
      clearTimeout(delaySearch);
    };
  }, [searchQuery]);

  // Yaş filtresi
  const applyAgeFilter = () => {
    setAgeRange(tempAgeRange);
    setIsAgeFilterActive(true);
    setIsFilterModalVisible(false);

    // Yaş filtresi uygulandığında eğer arama yapılıyorsa aramayı tekrar yap
    if (isSearching && searchQuery) {
      searchUsers();
    } else {
      filterUsersByAge();
    }
  };

  // Sadece yaş filtresini uygulayan fonksiyon
  const filterUsersByAge = () => {
    if (isAgeFilterActive) {
      // Burada gerçek yaş verisi olsa filtreleme yapılabilir
      // Şimdilik bu filtreyi yorum satırı olarak bırakıyoruz
      // const filteredByAge = users.filter((user) =>
      //   user.age && user.age >= ageRange[0] && user.age <= ageRange[1]
      // );
      // setFilteredUsers(filteredByAge);
    } else {
      setFilteredUsers(users);
    }
  };

  // Filtreleri sıfırla
  const resetFilters = () => {
    setTempAgeRange([18, 60]);
    setAgeRange([18, 60]);
    setIsAgeFilterActive(false);
    setIsFilterModalVisible(false);

    // Arama yapılıyorsa aramayı tekrar yap
    if (isSearching && searchQuery) {
      searchUsers();
    } else {
      setFilteredUsers(users);
    }
  };

  const renderUserItem = ({ item }: { item: EnhancedUser }) => {
    const isFriend = friends?.some(
      (fid) => String(fid).trim() === String(item.id).trim()
    );

    const hasPendingRequest = pendingRequests.includes(item.id);

    console.log(
      `[Friends] Kullanıcı render: ${item.id} | Arkadaş: ${isFriend} | Bekleyen istek: ${hasPendingRequest}`
    );

    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.userAvatarContainer}>
            {item.avatar_url ? (
              <Image
                source={{ uri: item.avatar_url }}
                style={styles.userAvatar}
              />
            ) : (
              <View style={styles.defaultAvatarContainer}>
                <UserIcon size={30} color="#666" />
              </View>
            )}
            {item.is_online && <View style={styles.onlineIndicator} />}
          </View>

          <View style={styles.userInfo}>
            <Text
              style={styles.userName}
            >{`${item.first_name} ${item.last_name}`}</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Calendar size={14} color="#888" />
              <Text style={styles.userLocation}>{item.age || 25} yaşında</Text>
            </View>
            <View style={styles.statusContainer}>
              {item.is_online ? (
                <View style={styles.onlineStatusContainer}>
                  <View style={styles.statusDot} />
                  <Text style={styles.onlineStatusText}>Çevrimiçi</Text>
                </View>
              ) : (
                <View style={styles.offlineStatusContainer}>
                  <View style={styles.offlineStatusDot} />
                  <Text style={styles.offlineStatusText}>Çevrimdışı</Text>
                </View>
              )}
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
                hasPendingRequest && styles.requestSentButton,
              ]}
              onPress={() =>
                hasPendingRequest
                  ? handleCancelRequest(item.id)
                  : handleFriendRequest(item.id)
              }
            >
              {hasPendingRequest ? (
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
      const currentUser = await AsyncStorage.getItem("user");
      if (currentUser) {
        const { id } = JSON.parse(currentUser);
        if (id === userId) {
          Alert.alert("Hata", "Kendinize arkadaşlık isteği gönderemezsiniz.");
          return;
        }
      }

      // Kullanıcı zaten bekleyen istekler listesindeyse uyarı ver
      if (pendingRequests.includes(userId)) {
        Alert.alert(
          "Bilgi",
          "Bu kullanıcıya zaten bir arkadaşlık isteği gönderdiniz."
        );
        return;
      }

      await friendshipsApi.sendRequest(userId);
      setPendingRequests((prev) => [...prev, userId]);
      Alert.alert("Başarılı", "Arkadaşlık isteği gönderildi.");
    } catch (error: any) {
      console.log(
        "API çağrısı sırasında hata:",
        error.response?.data?.message || error.message
      );

      if (error.response?.status === 409) {
        // 409 hatası alındıysa, bu kullanıcıya zaten istek gönderilmiş demektir
        // Otomatik olarak pendingRequests'e ekleyerek UI'ı güncelle
        if (!pendingRequests.includes(userId)) {
          setPendingRequests((prev) => [...prev, userId]);
        }
        Alert.alert(
          "Bilgi",
          "Bu kullanıcı ile zaten arkadaşsınız veya bekleyen bir isteğiniz var."
        );
      } else if (error.response?.status === 400) {
        Alert.alert("Hata", "Geçersiz istek. Lütfen tekrar deneyin.");
      } else {
        Alert.alert("Hata", "Arkadaşlık isteği gönderilirken bir hata oluştu.");
      }
    }
  };

  const handleCancelRequest = async (userId: string) => {
    try {
      // Giden istekleri getir ve ilgili isteği bul
      const outgoingRequests = await friendshipsApi.getOutgoingRequests();
      const request = outgoingRequests.find(
        (req: { receiver_id: string; id: string }) => req.receiver_id === userId
      );

      if (request) {
        await friendshipsApi.cancelRequest(request.id);
        setPendingRequests((prev) => prev.filter((id) => id !== userId));
        Alert.alert("Başarılı", "Arkadaşlık isteği iptal edildi.");
      } else {
        // İstek bulunamadıysa UI'ı güncelle
        console.log("İstek bulunamadı, yine de UI'dan kaldırılıyor:", userId);
        setPendingRequests((prev) => prev.filter((id) => id !== userId));
        Alert.alert(
          "Bilgi",
          "İstek zaten iptal edilmiş veya kabul edilmiş olabilir."
        );
      }
    } catch (error: any) {
      console.error("İstek iptal hatası:", error.message);

      // Hata alınsa bile kullanıcıya iyi bir deneyim sunmak için UI'ı güncelle
      setPendingRequests((prev) => prev.filter((id) => id !== userId));

      Alert.alert(
        "Uyarı",
        "Teknik bir sorun oluştu, ancak işlem UI'da güncellendi. Lütfen tekrar deneyin."
      );
    }
  };

  const handleSendMessage = (userId: string) => {
    console.log(`Mesaj gönderilecek: ${userId}`);
    router.push({
      pathname: `/messages/${userId}`,
      params: {
        name:
          users.find((user) => user.id === userId)?.first_name +
          " " +
          users.find((user) => user.id === userId)?.last_name,
        avatar: users.find((user) => user.id === userId)?.avatar_url,
      },
    });
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
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
            placeholder="İsim ara (en az 2 karakter)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="words"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setError(null);
              }}
              style={{ padding: 8 }}
            >
              <X size={16} color="#888" />
            </TouchableOpacity>
          )}
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
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadUsers(1)}
            >
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.usersList,
              filteredUsers.length === 0 && {
                paddingTop: 50,
                alignItems: "center",
              },
            ]}
            ListEmptyComponent={
              !loading && !error ? (
                <View style={styles.emptyResultsContainer}>
                  <Text style={styles.emptyResultsText}>
                    {isSearching
                      ? `"${searchQuery}" için sonuç bulunamadı`
                      : "Kullanıcı bulunamadı"}
                  </Text>
                </View>
              ) : null
            }
            showsVerticalScrollIndicator={false}
            refreshing={loading}
            onRefresh={() => {
              isSearching && searchQuery ? searchUsers() : loadUsers(1);
            }}
            onEndReached={!isSearching ? loadNextPage : undefined}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              !isSearching && currentPage < totalPages ? (
                <View style={styles.listFooter}>
                  <ActivityIndicator size="small" color="#4dabf7" />
                  <Text style={styles.loadingMoreText}>
                    Daha fazla kullanıcı yükleniyor...
                  </Text>
                </View>
              ) : null
            }
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
  defaultAvatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e9ecef",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dee2e6",
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
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#4dabf7",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  friendButton: {
    backgroundColor: "#4dabf7",
    opacity: 0.8,
  },
  listFooter: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingMoreText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  emptyResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyResultsText: {
    fontSize: 16,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  onlineStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4cd137",
    marginRight: 4,
  },
  onlineStatusText: {
    fontSize: 14,
    color: "#4cd137",
    fontWeight: "bold",
  },
  offlineStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  offlineStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff6b6b",
    marginRight: 4,
  },
  offlineStatusText: {
    fontSize: 14,
    color: "#ff6b6b",
    fontWeight: "bold",
  },
});
