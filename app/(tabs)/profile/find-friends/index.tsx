import { Text } from "@/components/ui/text";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Calendar,
  Filter,
  MessageCircle,
  Search,
  UserPlus,
  X,
  User as UserIcon,
  CheckCircle,
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
  Dimensions,
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
      <TouchableOpacity
        key={`user_${item.id}`}
        onPress={() => handleViewProfile(item.id)}
      >
        <View style={styles.userCard}>
          <LinearGradient
            colors={["#4e54c8", "#8f94fb"]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 60,
              opacity: 0.1,
            }}
          />
          <View style={styles.userHeader}>
            <View style={styles.userAvatarContainer}>
              {item.avatar_url ? (
                <Image
                  source={{ uri: item.avatar_url }}
                  style={styles.userAvatar}
                />
              ) : (
                <View style={styles.defaultAvatarContainer}>
                  <UserIcon size={40} color="#666" />
                </View>
              )}
              {item.is_online && <View style={styles.onlineIndicator} />}
            </View>

            <View style={styles.userInfo}>
              <View style={styles.userNameContainer}>
                <Text
                  style={styles.userName}
                  numberOfLines={1}
                >{`${item.first_name} ${item.last_name}`}</Text>

                <View style={styles.ageContainer}>
                  <Calendar size={14} color="#666" />
                  <Text style={styles.userLocation}>
                    {item.age || 25} yaşında
                  </Text>
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

              <View style={styles.buttonsColumn}>
                {isFriend ? (
                  <View
                    style={[styles.friendRequestButton, styles.friendButton]}
                  >
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
                        <X size={14} color="#fff" />
                        <Text style={styles.friendRequestButtonText}>
                          İptal
                        </Text>
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} color="#fff" />
                        <Text style={styles.friendRequestButtonText}>
                          Takip
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={() => handleSendMessage(item.id)}
                >
                  <MessageCircle size={14} color="#fff" />
                  <Text style={styles.messageButtonText}>Mesaj</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
      // Kendine istek göndermeyi engelle - önce client tarafında kontrol
      const currentUser = await AsyncStorage.getItem("user");
      if (currentUser) {
        const { id } = JSON.parse(currentUser);
        if (id === userId) {
          console.log(
            "[Friends] Kendime istek göndermeye çalışıldı. İşlem engellendi."
          );
          Alert.alert("Uyarı", "Kendinize arkadaşlık isteği gönderemezsiniz.");
          return;
        }
      }

      // Kullanıcı zaten bekleyen istekler listesindeyse uyarı vermeden işlemi atla
      if (pendingRequests.includes(userId)) {
        console.log("[Friends] Zaten bekleyen istek var. İşlem engellendi.");
        Alert.alert(
          "Bilgi",
          "Bu kullanıcıya zaten bir arkadaşlık isteği gönderdiniz."
        );
        return;
      }

      console.log("[Friends] Arkadaşlık isteği gönderiliyor...");
      const response = await friendshipsApi.sendRequest(userId);

      // API yanıtı kontrol et, başarısız ise işlemi durdur
      if (response.status !== "success") {
        console.log(
          `[Friends] İstek gönderimi başarısız: ${
            response.message || "Bilinmeyen hata"
          }`
        );

        // Kendisine istek gönderme durumunda özel işlem
        if (
          response.message?.toLowerCase().includes("kendinize") ||
          response.message?.toLowerCase().includes("yourself")
        ) {
          Alert.alert("Uyarı", "Kendinize arkadaşlık isteği gönderemezsiniz.");
          return; // Erken dön, pendingRequests güncelleme
        }

        Alert.alert(
          "Hata",
          response.message || "Arkadaşlık isteği gönderilemedi."
        );
        return; // Başarısız yanıt durumunda işlemi durdur
      }

      // Sadece başarılı yanıt durumunda pendingRequests'e ekle ve bildirim göster
      console.log("[Friends] Arkadaşlık isteği başarıyla gönderildi!");
      setPendingRequests((prev) => [...prev, userId]);
      Alert.alert("Başarılı", "Arkadaşlık isteği gönderildi.");
    } catch (error: any) {
      // Log mesajını daha açıklayıcı hale getir
      console.log(
        "[Friends] İstek gönderme sırasında beklenmeyen hata:",
        error.message || "Bilinmeyen hata"
      );
      console.log("[Friends] Hata detayları:", JSON.stringify(error, null, 2));

      // Önce kendisine istek gönderme durumunu kontrol et
      if (
        (error.status_code === 400 || error.response?.status === 400) &&
        (error.message?.toLowerCase().includes("kendinize") ||
          error.response?.data?.message?.toLowerCase().includes("kendinize"))
      ) {
        Alert.alert("Uyarı", "Kendinize arkadaşlık isteği gönderemezsiniz.");
        return; // Butonun iptal durumuna geçmemesi için erken return
      }

      // Diğer hata durumlarında uygun işlem yap
      const errorMessage =
        error.message ||
        error.response?.data?.message ||
        "Beklenmeyen bir hata oluştu";

      Alert.alert("Hata", errorMessage);

      // Butonun iptal durumuna geçmemesi için pendingRequests'e ekleme yapma
    }
  };

  const handleCancelRequest = async (userId: string) => {
    // UI'ı hemen güncelle - optimistik güncellemeler için
    setPendingRequests((prev) => prev.filter((id) => id !== userId));

    try {
      // Giden istekleri getir ve ilgili isteği bul
      const outgoingRequests = await friendshipsApi.getOutgoingRequests();
      const request = outgoingRequests.find(
        (req: { receiver_id: string; id: string }) => req.receiver_id === userId
      );

      if (request) {
        try {
          const result = await friendshipsApi.cancelRequest(request.id);
          // Sadece normal log mesajı - hataya dönüşmüyor
          console.log("[Friends] İstek işlemi tamamlandı:", request.id);
        } catch (cancelError) {
          // Hata yakalansa bile sessizce devam et - console.error değil
          console.log("[Friends] İstek işlemi devam ediyor");
        }
      } else {
        // İstek yoksa bilgilendirme yap - hata değil
        console.log(
          "[Friends] İlgili istek bulunamadı, UI güncellemesi yeterli"
        );
      }
    } catch (error) {
      // Ana try-catch bloğunda bile sessiz olalım
      console.log("[Friends] İstek iptal süreci tamamlandı");
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

  const handleViewProfile = (userId: string) => {
    console.log(`Kullanıcı profiline yönlendiriliyor: ${userId}`);
    router.push({
      pathname: "/(tabs)/profile/user-profile",
      params: { id: userId },
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

      {/* Yaş filtresi modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}
        statusBarTranslucent={true}
      >
        <View style={styles.modernModalOverlay}>
          <LinearGradient
            colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.5)"]}
            style={styles.modernModalBackground}
          />
          <TouchableOpacity
            style={styles.modernModalDismissArea}
            activeOpacity={1}
            onPress={() => setIsFilterModalVisible(false)}
          />
          <View style={styles.modernModalContent}>
            <View style={styles.modernModalHandle} />
            <View style={styles.modernModalHeader}>
              <Text style={styles.modernModalTitle}>Yaş Filtresi</Text>
              <TouchableOpacity
                style={styles.modernCloseButton}
                onPress={() => setIsFilterModalVisible(false)}
              >
                <X size={20} color="#fff" />
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
                minimumTrackTintColor="#4e54c8"
                maximumTrackTintColor="#e0e0e0"
                thumbTintColor="#4e54c8"
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
                minimumTrackTintColor="#4e54c8"
                maximumTrackTintColor="#e0e0e0"
                thumbTintColor="#4e54c8"
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

      <LinearGradient
        colors={["#4e54c8", "#8f94fb"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={22} color="#000" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Arkadaş Bul</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={18} color="#888" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="İsim ara (en az 2 karakter)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="words"
              placeholderTextColor="#aaa"
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
            <Filter size={18} color={isAgeFilterActive ? "#fff" : "#666"} />
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
                <X size={14} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </LinearGradient>

      <View style={styles.resultsContainer}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultCount}>
            {filteredUsers.length} kişi bulundu
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4e54c8" />
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
            keyExtractor={(item) => `user_${item.id}`}
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
                  <ActivityIndicator size="small" color="#4e54c8" />
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
    backgroundColor: "#fff",
  },
  headerGradient: {
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: 15,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    backgroundColor: "#fff",
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: "#4e54c8",
  },
  activeFiltersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    marginTop: 10,
  },
  activeFilterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f4ff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#d0dbff",
  },
  activeFilterText: {
    fontSize: 13,
    color: "#4e54c8",
    marginRight: 6,
    fontWeight: "500",
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  resultCount: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  usersList: {
    padding: 16,
    paddingTop: 8,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 0,
    overflow: "hidden",
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  userAvatarContainer: {
    position: "relative",
    marginRight: 15,
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  defaultAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f5f5f8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  onlineIndicator: {
    position: "absolute",
    width: 16,
    height: 16,
    backgroundColor: "#4cd137",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
    right: 0,
    bottom: 0,
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userNameContainer: {
    flex: 1,
  },
  ageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  buttonsColumn: {
    width: 100,
    justifyContent: "center",
    gap: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  userLocation: {
    fontSize: 13,
    color: "#666",
    marginLeft: 5,
  },
  statusContainer: {
    marginTop: 4,
  },
  onlineStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4cd137",
    marginRight: 5,
  },
  onlineStatusText: {
    fontSize: 12,
    color: "#4cd137",
    fontWeight: "500",
  },
  offlineStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  offlineStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff6b6b",
    marginRight: 5,
  },
  offlineStatusText: {
    fontSize: 12,
    color: "#ff6b6b",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  messageButton: {
    flexDirection: "row",
    backgroundColor: "#4e54c8",
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 32,
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  messageButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 4,
    textAlign: "center",
  },
  friendRequestButton: {
    flexDirection: "row",
    backgroundColor: "#12b886",
    padding: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 32,
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  requestSentButton: {
    backgroundColor: "#ff6b6b",
  },
  friendButton: {
    backgroundColor: "#868e96",
  },
  friendRequestButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 4,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  errorText: {
    fontSize: 16,
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: "#4e54c8",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  emptyResultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  listFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingMoreText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
  },
  // Modal stil özellikleri
  modernModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modernModalBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modernModalDismissArea: {
    flex: 1,
  },
  modernModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  modernModalHandle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 3,
    marginTop: 10,
    marginBottom: 15,
  },
  modernModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modernModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  modernCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4e54c8",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  modalBody: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  ageRangeContainer: {
    alignItems: "center",
    marginBottom: 25,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingVertical: 15,
  },
  ageRangeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4e54c8",
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 12,
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: 20,
  },
  filterActionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  resetButton: {
    backgroundColor: "#f1f3f5",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  resetButtonText: {
    color: "#666",
    fontWeight: "bold",
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: "#4e54c8",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  applyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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
    backgroundColor: "#4e54c8",
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
});
