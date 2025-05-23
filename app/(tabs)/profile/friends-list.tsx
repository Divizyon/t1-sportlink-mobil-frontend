import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { friendshipsApi, Friend } from "@/services/api/friendships";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  RefreshCw,
  User as UserIcon,
  Users,
  Trash2,
} from "lucide-react-native";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import profileService from "@/src/api/profileService";
import eventBus from "@/src/utils/EventBus";

const { width } = Dimensions.get("window");

export default function FriendsListScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const router = useRouter();
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    console.log("Arkadaş listesi ekranı açıldı");
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Arkadaşlar yükleniyor...");
      const response = await friendshipsApi.getFriends();

      console.log("API yanıtı:", JSON.stringify(response, null, 2));

      // Debug bilgisini kaydet
      let debugText = `API yanıtı tipi: ${typeof response}\n`;

      if (response.status === "error") {
        console.log("Arkadaş listesi getirme hatası:", response.message);
        debugText += `Hata: ${response.message}\n`;
        setError(response.message || "Arkadaşlar yüklenirken bir hata oluştu");
        setFriends([]);
      } else {
        // API yanıtını doğru şekilde işle
        let friendsData: Friend[] = [];

        if (Array.isArray(response)) {
          debugText += `Yanıt bir dizi, uzunluk: ${response.length}\n`;
          friendsData = response;
        } else if (response.data && Array.isArray(response.data)) {
          debugText += `Yanıt bir obje, data alanı bir dizi, uzunluk: ${response.data.length}\n`;
          friendsData = response.data;
        } else {
          debugText += `Beklenmeyen yanıt formatı\n`;
          console.log("Beklenmeyen API yanıt formatı:", response);
          friendsData = [];
        }

        console.log(
          "Arkadaşlar yüklendi:",
          JSON.stringify(friendsData, null, 2)
        );
        debugText += `İşlenen arkadaş sayısı: ${friendsData.length}\n`;

        // Dizi içeriğini kontrol et
        if (friendsData.length > 0) {
          debugText += `İlk arkadaş: ${JSON.stringify(
            friendsData[0],
            null,
            2
          )}\n`;
        }

        setFriends(friendsData);
      }

      setDebugInfo(debugText);
    } catch (err: any) {
      console.error("Beklenmeyen hata:", err);
      setError("Arkadaşlar yüklenirken bir hata oluştu");
      setFriends([]);
      setDebugInfo(`Hata: ${err.message || "Bilinmeyen hata"}`);
      Alert.alert(
        "Hata",
        "Arkadaşlar yüklenirken bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleViewProfile = (friend: Friend) => {
    console.log("Kullanıcı profiline yönlendiriliyor:", friend.id);
    router.push({
      pathname: "/(tabs)/profile/user-profile",
      params: { id: friend.id },
    });
  };

  const handleDeleteFriend = (friend: Friend) => {
    // Arkadaş silme işlemini onay modeli ile gerçekleştir
    Alert.alert(
      "Arkadaş Sil",
      `${friend.first_name} ${friend.last_name} arkadaşlıktan çıkarılsın mı?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Arkadaş siliniyor:", friend.id);
              const response = await friendshipsApi.deleteFriend(friend.id);

              if (response.status === "success") {
                // Başarıyla silindiğinde arkadaş listesini güncelle
                setFriends((prev) => prev.filter((f) => f.id !== friend.id));
                console.log("Arkadaş başarıyla silindi");

                // Profil bilgilerini yenile
                try {
                  await profileService.getProfile();
                  // Arkadaş sayısının güncellendiğini bildir
                  eventBus.publish("FRIEND_COUNT_UPDATED", {});
                } catch (err) {
                  console.error("Profil bilgileri güncellenirken hata:", err);
                }
              } else {
                console.error("Arkadaş silme hatası:", response.message);
                Alert.alert(
                  "Hata",
                  response.message ||
                    "Arkadaş silinemedi, lütfen tekrar deneyin."
                );
              }
            } catch (error) {
              console.error("Arkadaş silme işlemi sırasında hata:", error);
              Alert.alert("Hata", "Arkadaş silinemedi, lütfen tekrar deneyin.");
            }
          },
        },
      ]
    );
  };

  const formatLastSeenTime = (lastSeenDate: string | Date) => {
    try {
      const date =
        typeof lastSeenDate === "string"
          ? new Date(lastSeenDate)
          : lastSeenDate;
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch (error) {
      console.error("Son görülme zamanı formatlama hatası:", error);
      return "Bilinmiyor";
    }
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 1], // Başlık her zaman görünür olsun
    extrapolate: "clamp",
  });

  const renderFriend = ({ item, index }: { item: Friend; index: number }) => {
    console.log("Arkadaş render ediliyor:", item);
    return (
      <Animated.View
        style={[
          styles.friendItemContainer,
          {
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, index % 2 === 0 ? -5 : 5],
                  extrapolate: "clamp",
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.userCardContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleViewProfile(item)}
            style={styles.userCardTouchable}
          >
            <LinearGradient
              colors={["#ffffff", "#f5f0fe"]}
              style={styles.userCard}
            >
              <View style={styles.userHeader}>
                <View style={styles.userAvatarContainer}>
                  {item.profile_picture ? (
                    <Image
                      source={{ uri: item.profile_picture }}
                      style={styles.userAvatar}
                    />
                  ) : (
                    <LinearGradient
                      colors={["#4e54c8", "#8f94fb"]}
                      style={styles.defaultAvatarContainer}
                    >
                      <UserIcon size={20} color="#fff" />
                    </LinearGradient>
                  )}
                  {item.is_online && <View style={styles.onlineIndicator} />}
                </View>
                <View style={styles.userInfoContainer}>
                  <Text
                    style={styles.userName}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.first_name} {item.last_name}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteFriend(item)}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Trash2 size={24} color="#e53e3e" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.error}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadFriends}>
        <RefreshCw size={18} color="#fff" />
        <Text style={styles.retryButtonText}>Tekrar Dene</Text>
      </TouchableOpacity>
      {debugInfo ? (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug Bilgileri:</Text>
          <Text style={styles.debugText}>{debugInfo}</Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6a11cb" />

      {/* Mor gradient başlık arka planı */}
      <LinearGradient
        colors={["#4e54c8", "#8f94fb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Arkadaşlarım</Text>
          </View>
          <View style={{ width: 22 }} />
        </View>
      </LinearGradient>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4e54c8" />
          <Text style={styles.loadingText}>Arkadaşların yükleniyor...</Text>
        </View>
      ) : error ? (
        renderErrorState()
      ) : (
        <>
          <Animated.FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <View style={styles.iconContainer}>
                  <Users size={28} color="#4e54c8" />
                </View>
                <Text style={styles.listHeaderText}>
                  {friends.length > 0
                    ? "Arkadaşlarınız"
                    : "Henüz arkadaşınız yok"}
                </Text>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <LinearGradient
                  colors={["#4e54c8", "#8f94fb"]}
                  style={styles.emptyCard}
                >
                  <Text style={styles.empty}>Henüz arkadaşın yok.</Text>
                  <TouchableOpacity
                    style={styles.findFriendsButton}
                    onPress={() =>
                      router.push("/(tabs)/profile/find-friends" as any)
                    }
                  >
                    <LinearGradient
                      colors={["#4e54c8", "#8f94fb"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.findFriendsButtonGradient}
                    >
                      <Text style={styles.findFriendsButtonText}>
                        Arkadaş Bul
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#4e54c8"]}
                tintColor="#4e54c8"
              />
            }
          />

          {friends.length > 0 && (
            <LinearGradient
              colors={["#4e54c8", "#8f94fb"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.countBadge}
            >
              <Text style={styles.countText}>{friends.length} arkadaş</Text>
            </LinearGradient>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerGradient: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#fff",
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
    zIndex: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  badgeSmall: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 12,
    paddingBottom: 80,
    paddingTop: 20,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(156, 39, 176, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  listHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4e54c8",
  },
  friendItemContainer: {
    marginBottom: 12,
  },
  userCardContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userCardTouchable: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userCard: {
    padding: 14,
    borderRadius: 16,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatarContainer: {
    position: "relative",
    marginRight: 14,
  },
  userAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#fff",
  },
  defaultAvatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  onlineIndicator: {
    position: "absolute",
    width: 10,
    height: 10,
    backgroundColor: "#9c27b0",
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#fff",
    right: 0,
    bottom: 0,
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    letterSpacing: 0.3,
  },
  deleteButton: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "rgba(229, 62, 62, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "rgba(229, 62, 62, 0.3)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#4e54c8",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  error: {
    color: "#ef4444",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    fontSize: 16,
  },
  retryButton: {
    flexDirection: "row",
    backgroundColor: "#9c27b0",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyCard: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  empty: {
    color: "#6a11cb",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  findFriendsButton: {
    width: "100%",
    maxWidth: 200,
    overflow: "hidden",
    borderRadius: 12,
  },
  findFriendsButtonGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  findFriendsButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  debugContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  debugTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  debugText: {
    fontSize: 12,
    color: "#666",
  },
  countBadge: {
    position: "absolute",
    bottom: 20,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  countText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});
