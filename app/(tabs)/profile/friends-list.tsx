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
} from "react-native";
import { friendshipsApi, Friend } from "@/services/api/friendships";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  MessageCircle,
  RefreshCw,
  Clock,
  User as UserIcon,
} from "lucide-react-native";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

export default function FriendsListScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const router = useRouter();

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

  const handleSendMessage = (friend: Friend) => {
    console.log("Mesaj gönderme ekranına yönlendiriliyor:", friend.id);
    router.push({
      pathname: `/messages/${friend.id}`,
      params: {
        name: friend.first_name + " " + friend.last_name,
        avatar: friend.profile_picture,
        email: friend.email,
      },
    });
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

  const renderFriend = ({ item }: { item: Friend }) => {
    console.log("Arkadaş render ediliyor:", item);
    return (
      <TouchableOpacity onPress={() => handleViewProfile(item)}>
        <View style={styles.userCard}>
          <View style={styles.userHeader}>
            <View style={styles.userAvatarContainer}>
              {item.profile_picture ? (
                <Image
                  source={{ uri: item.profile_picture }}
                  style={styles.userAvatar}
                />
              ) : (
                <View style={styles.defaultAvatarContainer}>
                  <UserIcon size={30} color="#666" />
                </View>
              )}
              {item.is_online && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.userInfoContainer}>
              <View style={styles.userInfo}>
                <Text
                  style={styles.userName}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.first_name} {item.last_name}
                </Text>
                <View style={styles.lastSeenContainer}>
                  <Clock size={12} color="#95a5a6" />
                  <Text style={styles.lastSeenText}>
                    {item.last_seen_at
                      ? formatLastSeenTime(item.last_seen_at)
                      : "Çevrimdışı"}
                  </Text>
                </View>
                <Text
                  style={styles.userLocation}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.email}
                </Text>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.messageButton}
                  onPress={() => handleSendMessage(item)}
                >
                  <MessageCircle size={14} color="#fff" />
                  <Text style={styles.messageButtonText}>Mesaj Gönder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Arkadaşlarım</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color="#4dabf7"
          style={{ marginTop: 40 }}
        />
      ) : error ? (
        renderErrorState()
      ) : (
        <>
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.empty}>Henüz arkadaşın yok.</Text>
                <TouchableOpacity
                  style={styles.findFriendsButton}
                  onPress={() =>
                    router.push("/(tabs)/profile/find-friends" as any)
                  }
                >
                  <Text style={styles.findFriendsButtonText}>Arkadaş Bul</Text>
                </TouchableOpacity>

                {debugInfo ? (
                  <View style={styles.debugContainer}>
                    <Text style={styles.debugTitle}>Debug Bilgileri:</Text>
                    <Text style={styles.debugText}>{debugInfo}</Text>
                  </View>
                ) : null}
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#4dabf7"]}
              />
            }
          />

          {friends.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{friends.length} arkadaş</Text>
            </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
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
    width: 14,
    height: 14,
    backgroundColor: "#4cd137",
    borderRadius: 7,
    borderWidth: 2,
    borderColor: "#fff",
    right: 0,
    bottom: 0,
  },
  userInfoContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 12,
  },
  userInfo: {
    flex: 1,
    marginRight: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  lastSeenContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  lastSeenText: {
    fontSize: 13,
    color: "#95a5a6",
    marginLeft: 6,
  },
  userLocation: {
    fontSize: 14,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  messageButton: {
    flexDirection: "row",
    backgroundColor: "#4dabf7",
    padding: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    height: 26,
    minWidth: 70,
  },
  messageButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 11,
    marginLeft: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  error: {
    color: "#ff6b6b",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 20,
    fontSize: 16,
  },
  retryButton: {
    flexDirection: "row",
    backgroundColor: "#4dabf7",
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
    marginTop: 40,
  },
  empty: {
    color: "#888",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 16,
  },
  findFriendsButton: {
    backgroundColor: "#4dabf7",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  findFriendsButtonText: {
    color: "#fff",
    fontWeight: "600",
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
    backgroundColor: "#4dabf7",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  countText: {
    color: "white",
    fontWeight: "bold",
  },
});
