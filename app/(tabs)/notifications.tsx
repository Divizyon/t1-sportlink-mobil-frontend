import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Bell,
  Calendar,
  Clock,
  Info,
  MessageCircle,
  ThumbsUp,
  User,
} from "lucide-react-native";
import React, { useState, useEffect } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import {
  getIncomingFriendshipRequests,
  acceptFriendshipRequest,
  rejectFriendshipRequest,
} from "../../services/api/friendships";
import { FriendshipRequest } from "../../types/friendships";
import FriendshipRequestItem from "../../components/notifications/FriendshipRequestItem";

// Bildirim tipi tanımlama
interface Notification {
  id: string;
  type: "event" | "message" | "friend" | "system" | "like";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  data?: {
    eventId?: number;
    userId?: number;
    messageId?: number;
  };
}

// Örnek bildirim verileri
const notificationsData: Notification[] = [
  {
    id: "1",
    type: "event",
    title: "Etkinlik Hatırlatıcı",
    message: "Basketbol Maçı etkinliği 2 saat içinde başlayacak.",
    time: "10 dakika önce",
    isRead: false,
    data: {
      eventId: 1,
    },
  },
  {
    id: "2",
    type: "message",
    title: "Yeni Mesaj",
    message: "Ahmet Yılmaz size mesaj gönderdi.",
    time: "25 dakika önce",
    isRead: false,
    data: {
      userId: 1,
      messageId: 101,
    },
  },
  {
    id: "3",
    type: "friend",
    title: "Arkadaşlık İsteği",
    message: "Zeynep Şahin sizinle arkadaş olmak istiyor.",
    time: "1 saat önce",
    isRead: true,
    data: {
      userId: 4,
    },
  },
  {
    id: "4",
    type: "event",
    title: "Etkinlik Güncellemesi",
    message: "Futbol Turnuvası etkinliğinin yeri değişti.",
    time: "3 saat önce",
    isRead: true,
    data: {
      eventId: 2,
    },
  },
  {
    id: "5",
    type: "system",
    title: "Sistem Bildirimi",
    message: "Hesabınız başarıyla doğrulandı, tüm özelliklere erişebilirsiniz.",
    time: "1 gün önce",
    isRead: true,
  },
  {
    id: "6",
    type: "like",
    title: "Beğeni",
    message: "Murat Öztürk yorumunuzu beğendi.",
    time: "1 gün önce",
    isRead: true,
    data: {
      userId: 5,
    },
  },
  {
    id: "7",
    type: "event",
    title: "Yeni Etkinlik",
    message: "İlgilenebileceğiniz yeni bir etkinlik: Yüzme Etkinliği",
    time: "2 gün önce",
    isRead: true,
    data: {
      eventId: 3,
    },
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] =
    useState<Notification[]>(notificationsData);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [friendRequests, setFriendRequests] = useState<FriendshipRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processingRequestIds, setProcessingRequestIds] = useState<string[]>(
    []
  );

  // Arkadaşlık isteklerini getir
  const fetchFriendshipRequests = async () => {
    try {
      setLoading(true);
      const response = await getIncomingFriendshipRequests();
      if (response.status === "success" && response.data) {
        console.log("Gelen arkadaşlık istekleri:", response.data.length);
        console.log("İstek detayları:", JSON.stringify(response.data, null, 2));
        // Sadece geçerli verileri al
        const validRequests = response.data.filter(
          (req: FriendshipRequest) => req && req.id
        );
        setFriendRequests(validRequests);
      }
    } catch (error) {
      console.error("Arkadaşlık istekleri getirilirken hata:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sayfa yüklendiğinde ve yenilendiğinde istekleri getir
  useEffect(() => {
    fetchFriendshipRequests();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchFriendshipRequests();
  }, []);

  // Arkadaşlık isteği kabul et
  const handleAcceptRequest = async (requestId: string) => {
    try {
      // İşlem başladı
      setProcessingRequestIds((prev) => [...prev, requestId.toString()]);

      const response = await acceptFriendshipRequest(requestId.toString());
      if (response.status === "success") {
        // İstek kabul edildikten sonra listeden kaldır
        setFriendRequests((prevRequests) =>
          prevRequests.filter(
            (request) => request.id.toString() !== requestId.toString()
          )
        );
        console.log("Arkadaşlık isteği kabul edildi:", requestId);
      }
    } catch (error) {
      console.error("Arkadaşlık isteği kabul edilirken hata:", error);
    } finally {
      // İşlem tamamlandı
      setProcessingRequestIds((prev) =>
        prev.filter((id) => id !== requestId.toString())
      );
      setLoading(false);
    }
  };

  // Arkadaşlık isteği reddet
  const handleRejectRequest = async (requestId: string) => {
    try {
      // İşlem başladı
      setProcessingRequestIds((prev) => [...prev, requestId.toString()]);

      const response = await rejectFriendshipRequest(requestId.toString());
      if (response.status === "success") {
        // İstek reddedildikten sonra listeden kaldır
        setFriendRequests((prevRequests) =>
          prevRequests.filter(
            (request) => request.id.toString() !== requestId.toString()
          )
        );
        console.log("Arkadaşlık isteği reddedildi:", requestId);
      }
    } catch (error) {
      console.error("Arkadaşlık isteği reddedilirken hata:", error);
    } finally {
      // İşlem tamamlandı
      setProcessingRequestIds((prev) =>
        prev.filter((id) => id !== requestId.toString())
      );
      setLoading(false);
    }
  };

  const handleTabChange = (tab: "all" | "unread") => {
    setActiveTab(tab);
  };

  const handleNotificationPress = (notification: Notification) => {
    // Bildirimi okundu olarak işaretleme
    setNotifications((prevNotifications) =>
      prevNotifications.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item
      )
    );

    // Bildirim tipine göre yönlendirme yap
    switch (notification.type) {
      case "event":
        // Eğer başlık "Etkinlik Hatırlatıcı" ise yaklaşan etkinlikler sayfasına yönlendir
        if (notification.title === "Etkinlik Hatırlatıcı") {
          // Yaklaşan etkinlikler sayfasına yönlendir
          router.push("/upcoming-events" as any);
        } else if (notification.title === "Etkinlik Güncellemesi") {
          // Eğer başlık "Etkinlik Güncellemesi" ise güncellenen etkinlikler sayfasına yönlendir
          router.push("/event-updates" as any);
        } else if (notification.title === "Yeni Etkinlik") {
          // Eğer başlık "Yeni Etkinlik" ise tüm etkinlikler sayfasına yönlendir
          router.push("/all-events" as any);
        } else {
          // Diğer etkinlik bildirimleri için (örn. güncellemeler), spesifik etkinliğe yönlendir
          if (notification.data?.eventId) {
            router.push({
              pathname: "/(tabs)/reminders/[id]",
              params: { id: notification.data.eventId },
            });
          } else {
            // Etkinlik yoksa etkinlikler listesine yönlendir
            router.push("/(tabs)/reminders/index");
          }
        }
        break;
      case "message":
        // Mesajlar sayfasına yönlendir
        router.push("/messages/index" as any);
        break;
      case "friend":
        // Arkadaşlık istekleri sayfasına yönlendir
        router.push("/friend-requests" as any);
        break;
      case "like":
        // Beğeni bildirimleri için şimdilik profil sayfasına yönlendir
        if (notification.data?.userId) {
          router.push({
            pathname: "/(tabs)/profile",
            params: { id: notification.data.userId },
          });
        }
        break;
      case "system":
        // Sistem bildirimleri sayfasına yönlendir
        router.push("/system-notifications/index" as any);
        break;
      default:
        break;
    }
  };

  // Arkadaşlık isteğine tıklandığında
  const handleFriendRequestPress = () => {
    router.push("/friend-requests" as any);
  };

  const handleClearAll = () => {
    // Tüm bildirimleri okundu olarak işaretle
    setNotifications((prevNotifications) =>
      prevNotifications.map((item) => ({ ...item, isRead: true }))
    );
  };

  const getFilteredNotifications = () => {
    return activeTab === "all"
      ? notifications
      : notifications.filter((item) => !item.isRead);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "event":
        return <Calendar size={24} color="#3498db" />;
      case "message":
        return <MessageCircle size={24} color="#2ecc71" />;
      case "friend":
        return <User size={24} color="#9b59b6" />;
      case "system":
        return <Bell size={24} color="#f39c12" />;
      case "like":
        return <ThumbsUp size={24} color="#e74c3c" />;
      default:
        return <Info size={24} color="#95a5a6" />;
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={styles.iconContainer}>
          {getNotificationIcon(item.type)}
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.title}>{item.title}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Clock size={12} color="#95a5a6" />
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>

          <Text style={styles.message}>{item.message}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Üst bilgi çubuğu */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bildirimler</Text>

        {activeTab === "all" && notifications.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearText}>Tümünü Okundu İşaretle</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Sekmeler */}
      <View style={styles.tabsContainer}>
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
            Tümü ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === "unread" && styles.activeTab]}
          onPress={() => handleTabChange("unread")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "unread" && styles.activeTabText,
            ]}
          >
            Okunmamış ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Arkadaşlık İstekleri Başlığı */}
      {friendRequests.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Arkadaşlık İstekleri</Text>
        </View>
      )}

      {/* Arkadaşlık İstekleri Listesi */}
      {friendRequests.length > 0 && (
        <View style={styles.friendRequestsContainer}>
          {friendRequests.map((request) =>
            request && request.id ? (
              <FriendshipRequestItem
                key={request.id.toString()}
                request={request}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
                onPress={handleFriendRequestPress}
                isProcessing={processingRequestIds.includes(
                  request.id.toString()
                )}
              />
            ) : null
          )}
        </View>
      )}

      {/* Bildirimler Başlığı */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bildirimler</Text>
      </View>

      {/* Bildirimler Listesi */}
      <FlatList
        data={getFilteredNotifications()}
        keyExtractor={(item) => item.id}
        renderItem={renderNotificationItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === "all"
                ? "Hiç bildiriminiz bulunmuyor."
                : "Okunmamış bildiriminiz bulunmuyor."}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Yükleniyor göstergesi */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  screenTitle: {
    lineHeight: 0,
    fontSize: 24,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#2ecc71",
  },
  tabText: {
    fontSize: 14,
    color: "#95a5a6",
  },
  activeTabText: {
    color: "#2ecc71",
    fontWeight: "600",
  },
  boldText: {
    fontWeight: "bold",
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  unreadItem: {
    backgroundColor: "#f5faff",
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  time: {
    fontSize: 12,
    color: "#95a5a6",
    marginLeft: 4,
  },
  message: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginTop: 4,
  },
  clearAllButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  clearAllText: {
    fontSize: 12,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#bdc3c7",
    textAlign: "center",
    paddingHorizontal: 32,
    marginTop: 8,
  },
  header: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  clearText: {
    fontSize: 12,
    color: "#666",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#f5f5f5",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#666",
  },
  friendRequestsContainer: {
    padding: 16,
    backgroundColor: "white",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
});
