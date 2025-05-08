import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
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
import NotificationItem from "../../components/notifications/NotificationItem";
import notificationsService, {
  NotificationResponse,
} from "../../services/api/notifications";
import { Linking } from "react-native";

export default function NotificationsScreen() {
  const [apiNotifications, setApiNotifications] = useState<
    NotificationResponse[]
  >([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [friendRequests, setFriendRequests] = useState<FriendshipRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processingRequestIds, setProcessingRequestIds] = useState<string[]>(
    []
  );

  // Bildirimleri getir
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsService.getNotifications();
      console.log("NOTIFICATIONS", response.data);
      if (response.data.success) {
        console.log("Bildirimler başarıyla alındı:", response.data);
        setApiNotifications(response.data.data || []);
      } else {
        console.error("Bildirimler alınırken bir hata oluştu:", response.data);
      }
    } catch (error) {
      console.error("Bildirimler getirilirken hata:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Arkadaşlık isteklerini getir
  const fetchFriendshipRequests = async () => {
    try {
      setLoading(true);
      const response = await getIncomingFriendshipRequests();
      if (response.status === "success" && response.data) {
        console.log("Gelen arkadaşlık istekleri:", response.data.length);
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
    fetchNotifications();
    fetchFriendshipRequests();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
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

  // Bildirimleri okundu olarak işaretle
  const handleMarkNotificationAsRead = async (
    notification: NotificationResponse
  ) => {
    try {
      const response = await notificationsService.markAsRead(notification.id);
      if (response.data.success) {
        // Bildirimi yerel olarak güncelle
        setApiNotifications((prevState) =>
          prevState.map((item) =>
            item.id === notification.id ? { ...item, read_status: true } : item
          )
        );
      }
    } catch (error) {
      console.error("Bildirim okundu işaretlenirken hata:", error);
    }
  };

  // Bildirime tıklandığında
  const handleNotificationPress = async (
    notification: NotificationResponse
  ) => {
    // Bildirimi okundu olarak işaretle
    await handleMarkNotificationAsRead(notification);

    // Etkinlik tipine göre deeplink yönlendirmesi yap
    if (notification.data && notification.data.deepLink) {
      try {
        // Deep linki aç
        await Linking.openURL(notification.data.deepLink);
      } catch (error) {
        console.error("Deeplink açılırken hata:", error);

        // Fallback - Eğer deeplink çalışmazsa ve etkinlik ID'si varsa
        if (notification.data.eventId) {
          router.push({
            pathname: "/(tabs)/events/[id]",
            params: { id: notification.data.eventId },
          });
        }
      }
    } else if (
      notification.notification_type === "event_update" &&
      notification.data?.eventId
    ) {
      // Etkinlik sayfasına yönlendir
      router.push({
        pathname: "/(tabs)/events/[id]",
        params: { id: notification.data.eventId },
      });
    } else if (notification.notification_type === "friend_request") {
      // Arkadaşlık istekleri sayfasına yönlendir
      router.push("/friend-requests" as any);
    } else if (notification.notification_type === "chat_message") {
      // Mesajlar sayfasına yönlendir
      router.push("/messages/index" as any);
    } else if (notification.notification_type === "system") {
      // Sistem bildirimleri sayfasına yönlendir
      router.push("/system-notifications/index" as any);
    }
  };

  // Arkadaşlık isteğine tıklandığında
  const handleFriendRequestPress = () => {
    router.push("/friend-requests" as any);
  };

  // Tüm bildirimleri okundu olarak işaretle
  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationsService.markAllAsRead();
      if (response.data.success) {
        // Tüm bildirimleri yerel olarak okundu işaretle
        setApiNotifications((prevState) =>
          prevState.map((item) => ({ ...item, read_status: true }))
        );
      }
    } catch (error) {
      console.error("Tüm bildirimler okundu işaretlenirken hata:", error);
    }
  };

  const getFilteredNotifications = () => {
    return activeTab === "all"
      ? apiNotifications
      : apiNotifications.filter((item) => !item.read_status);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Üst bilgi çubuğu */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bildirimler</Text>

        {activeTab === "all" && apiNotifications.length > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
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
            Tümü ({apiNotifications.length})
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
            Okunmamış (
            {apiNotifications.filter((item) => !item.read_status).length})
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
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={handleNotificationPress}
          />
        )}
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
