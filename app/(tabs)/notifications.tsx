import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useCallback } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
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
  MobileNotification,
} from "../../services/api/notifications";
import { Linking } from "react-native";
import {
  AlertTriangle,
  RefreshCw,
  Bell,
  CheckCircle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

// API isteği için timeout değeri (ms)
const API_TIMEOUT = 15000;

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<
    Array<MobileNotification | NotificationResponse>
  >([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [friendRequests, setFriendRequests] = useState<FriendshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [processingRequestIds, setProcessingRequestIds] = useState<string[]>(
    []
  );
  // Eklenmiş durumlar
  const [isNetworkError, setIsNetworkError] = useState(false);
  const [apiRequestInProgress, setApiRequestInProgress] = useState(false);

  // Bildirim tipini kontrol etmek için yardımcı fonksiyon
  const isMobileNotification = (
    notification: MobileNotification | NotificationResponse
  ): notification is MobileNotification => {
    return "title" in notification && "body" in notification;
  };

  // Bildirimleri getir - useCallback ile optimize edildi
  const fetchNotifications = useCallback(async () => {
    // Zaten bir istek sürüyorsa çık
    if (apiRequestInProgress) return;

    setApiRequestInProgress(true);
    setIsNetworkError(false);

    // Timeout kontrolü için Promise.race kullan
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("İstek zaman aşımına uğradı")),
        API_TIMEOUT
      );
    });

    try {
      setError(null);
      console.log("Bildirimleri getirme isteği başlatılıyor...");

      // Timeout ile API isteğini yarıştır
      const response = (await Promise.race([
        notificationsService.getNotifications(),
        timeoutPromise,
      ])) as any;

      console.log("NOTIFICATIONS RESPONSE:", response);

      // API'den gelen veriyi çözümle ve kontrol et
      if (response && response.data) {
        console.log("Bildirimler başarıyla alındı:", response.data);

        // API yanıtı için tüm olası yapıları kontrol et
        let notificationsData: Array<
          MobileNotification | NotificationResponse
        > = [];

        if (Array.isArray(response.data)) {
          // Doğrudan dizi dönüyorsa
          notificationsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // { data: [...] } formatında dönüyorsa
          notificationsData = response.data.data;
        } else if (
          (response.data.status === "success" || response.data.success) &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          // { status: "success", data: [...] } veya { success: true, data: [...] } formatında dönüyorsa
          notificationsData = response.data.data;
        } else {
          // Hiçbir bilinen format bulunamadıysa
          console.error("Bilinmeyen API yanıt formatı:", response.data);
          setNotifications([]);
          setError("Bildirimler alınamadı: Bilinmeyen API yanıt formatı");
          return;
        }

        // Verileri tarih sırasına göre sırala (en yeniler üstte)
        notificationsData.sort((a, b) => {
          const dateA = new Date(
            isMobileNotification(a) ? a.created_at : a.created_at
          ).getTime();
          const dateB = new Date(
            isMobileNotification(b) ? b.created_at : b.created_at
          ).getTime();
          return dateB - dateA;
        });

        setNotifications(notificationsData);
      } else {
        console.error("Bildirimler alınırken boş yanıt:", response);
        setNotifications([]);
        setError("Bildirimler alınamadı: Boş yanıt");
      }
    } catch (error: any) {
      console.error("Bildirimler getirilirken hata:", error);
      setNotifications([]);

      // Network hatası mı kontrol et
      if (
        error.message === "Network Error" ||
        error.message.includes("network")
      ) {
        setIsNetworkError(true);
        setError(
          "İnternet bağlantısı problemi. Lütfen bağlantınızı kontrol edin."
        );
      } else if (error.message.includes("zaman aşımı")) {
        setError("Sunucu yanıt vermiyor. Lütfen daha sonra tekrar deneyin.");
      } else {
        setError(
          "Bildirimler alınamadı: " + (error?.message || "Bilinmeyen hata")
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setApiRequestInProgress(false);
    }
  }, [apiRequestInProgress]);

  // Arkadaşlık isteklerini getir - useCallback ile optimize edildi
  const fetchFriendshipRequests = useCallback(async () => {
    try {
      const response = await getIncomingFriendshipRequests();
      if (response.status === "success" && response.data) {
        console.log("Gelen arkadaşlık istekleri:", response.data.length);
        // Sadece geçerli verileri al
        const validRequests = response.data.filter(
          (req: FriendshipRequest) => req && req.id
        );
        setFriendRequests(validRequests);
      }
    } catch (error: any) {
      console.error("Arkadaşlık istekleri getirilirken hata:", error);

      // Arkadaşlık istekleri olmadığında kritik bir hata değil,
      // sadece boş liste olarak işaretle
      setFriendRequests([]);
    }
  }, []);

  // Bildirimi okundu olarak işaretle
  const handleMarkNotificationAsRead = async (
    notification: MobileNotification | NotificationResponse
  ) => {
    try {
      const notificationId = notification.id;
      const result = await notificationsService.markAsRead(notificationId);

      console.log(
        `Bildirim #${notificationId} okundu olarak işaretlendi:`,
        result
      );

      // Bildirim listesini güncelle
      setNotifications(
        notifications.map((item) =>
          item.id === notificationId ? { ...item, read_status: true } : item
        )
      );
    } catch (error: any) {
      console.error("Bildirim okundu işaretlenirken hata:", error);
    }
  };

  // Bildirimlerin hepsini okundu olarak işaretle
  const handleMarkAllAsRead = async () => {
    try {
      const result = await notificationsService.markAllAsRead();
      console.log("Tüm bildirimler okundu olarak işaretlendi:", result);

      // Tüm bildirimleri okundu olarak güncelle
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          read_status: true,
        }))
      );
    } catch (error: any) {
      console.error("Bildirimler okundu işaretlenirken hata:", error);
    }
  };

  // Notification'a tıklandığında
  const handleNotificationPress = async (
    notification: MobileNotification | NotificationResponse
  ) => {
    // Eğer bildirim okunmamışsa, okundu olarak işaretle
    if (!notification.read_status) {
      await handleMarkNotificationAsRead(notification);
    }

    // Bildirim tipini ve içeriğini kontrol et
    const type = isMobileNotification(notification)
      ? notification.notification_type
      : notification.notification_type;

    // Bildirim tıklaması için yönlendirme yapma - sadece okundu olarak işaretlemek yeterli
    console.log("Bildirim okundu olarak işaretlendi:", notification.id);

    // İsteğe bağlı olarak bildirim içeriğiyle ilgili bir mesaj gösterebilirsiniz
    /*
    Alert.alert(
      "Bildirim",
      "Bildirim okundu olarak işaretlendi",
      [{ text: "Tamam", style: "default" }]
    );
    */
  };

  // Arkadaşlık isteği onaylama işlemi
  const handleAcceptRequest = async (requestId: string) => {
    setProcessingRequestIds((prev) => [...prev, requestId]);
    try {
      const response = await acceptFriendshipRequest(requestId);
      if (response.status === "success") {
        console.log("Arkadaşlık isteği kabul edildi:", response);
        // İsteği listeden kaldır
        setFriendRequests((prev) =>
          prev.filter((req) => String(req.id) !== requestId)
        );
      } else {
        console.error("Arkadaşlık isteği kabul edilirken hata:", response);
        Alert.alert(
          "Hata",
          "Arkadaşlık isteği kabul edilirken bir sorun oluştu."
        );
      }
    } catch (error) {
      console.error("Arkadaşlık isteği kabul edilirken hata:", error);
      Alert.alert(
        "Hata",
        "Arkadaşlık isteği kabul edilirken bir sorun oluştu."
      );
    } finally {
      setProcessingRequestIds((prev) => prev.filter((id) => id !== requestId));
    }
  };

  // Arkadaşlık isteği reddetme işlemi
  const handleRejectRequest = async (requestId: string) => {
    setProcessingRequestIds((prev) => [...prev, requestId]);
    try {
      const response = await rejectFriendshipRequest(requestId);
      if (response.status === "success") {
        console.log("Arkadaşlık isteği reddedildi:", response);
        // İsteği listeden kaldır
        setFriendRequests((prev) =>
          prev.filter((req) => String(req.id) !== requestId)
        );
      } else {
        console.error("Arkadaşlık isteği reddedilirken hata:", response);
        Alert.alert(
          "Hata",
          "Arkadaşlık isteği reddedilirken bir sorun oluştu."
        );
      }
    } catch (error) {
      console.error("Arkadaşlık isteği reddedilirken hata:", error);
      Alert.alert("Hata", "Arkadaşlık isteği reddedilirken bir sorun oluştu.");
    } finally {
      setProcessingRequestIds((prev) => prev.filter((id) => id !== requestId));
    }
  };

  // Sayfa yüklendiğinde ve yenilendiğinde istekleri getir
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Parallel API calls with Promise.allSettled
        const results = await Promise.allSettled([
          fetchNotifications(),
          fetchFriendshipRequests(),
        ]);

        // Check for specific errors
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.error(
              `API çağrısı ${index} başarısız oldu:`,
              result.reason
            );
          }
        });

        // If notifications failed but friendship requests succeeded
        if (
          results[0].status === "rejected" &&
          results[1].status === "fulfilled"
        ) {
          setError(
            "Bildirimler yüklenemedi, ancak arkadaşlık istekleri başarıyla alındı."
          );
        }
      } catch (error: any) {
        console.error("Veri yüklenirken hata:", error);
        setError(
          "Veriler yüklenemedi: " + (error?.message || "Bilinmeyen hata")
        );
      } finally {
        // Yükleme durumunu 500ms sonra kapat - bu kısa gecikme kullanıcı deneyimini iyileştirir
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };

    // Veri yükleme işlemini başlat
    loadData();

    // Sayfadan ayrıldığında API isteklerini temizle
    return () => {
      setApiRequestInProgress(false);
    };
    // Boş dependency array kullan - sayfa ilk yüklendiğinde bir kez çalışır
  }, []);

  // Yenileme fonksiyonu
  const onRefresh = useCallback(() => {
    // Eğer halihazırda bir yenileme işlemi veya istek sürüyorsa çık
    if (refreshing || apiRequestInProgress) return;

    setRefreshing(true);
    setError(null);

    const refreshData = async () => {
      try {
        const results = await Promise.allSettled([
          fetchNotifications(),
          fetchFriendshipRequests(),
        ]);

        // If all requests failed
        if (
          results.every(
            (result: PromiseSettledResult<any>) => result.status === "rejected"
          )
        ) {
          setError(
            "Veriler yenilenemedi. Lütfen internet bağlantınızı kontrol edin."
          );
        }
      } catch (error: any) {
        console.error("Yenileme sırasında hata:", error);
        setError(
          "Veriler yenilenemedi: " + (error?.message || "Bilinmeyen hata")
        );
      } finally {
        setRefreshing(false);
      }
    };

    refreshData();
  }, [
    refreshing,
    apiRequestInProgress,
    fetchNotifications,
    fetchFriendshipRequests,
  ]);

  // Sekme değiştirme işlemi
  const handleTabChange = (tab: "all" | "unread") => {
    setActiveTab(tab);
  };

  // Filtrelenmiş bildirimleri getir
  const getFilteredNotifications = () => {
    return activeTab === "unread"
      ? notifications.filter((notification) => !notification.read_status)
      : notifications;
  };

  // Arkadaşlık istekleri sayfasına yönlendirme
  const handleFriendRequestPress = () => {
    // Yönlendirmeyi kaldırıyoruz
    // Kullanıcıya tüm arkadaşlık isteklerini görebileceği bir bilgi verebiliriz
    Alert.alert(
      "Bilgi",
      "Şu anda yönlendirme devre dışı bırakılmıştır. Lütfen daha sonra tekrar deneyiniz.",
      [{ text: "Tamam", style: "default" }]
    );
  };

  // Boş bildirim durumu
  const renderEmptyComponent = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={["#4e54c833", "#8f94fb20"]}
          style={styles.emptyGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Bell size={60} color="#4e54c8" style={styles.emptyIcon} />
        <Text style={styles.emptyTitle}>
          {activeTab === "all"
            ? "Henüz bildiriminiz yok"
            : "Okunmamış bildiriminiz yok"}
        </Text>
        <Text style={styles.emptyDescription}>
          {activeTab === "all"
            ? "Yeni etkinlikler oluşturabilir veya mevcut etkinliklere katılabilirsiniz."
            : "Tüm bildirimlerinizi okudunuz! 👍"}
        </Text>
      </View>
    );
  };

  // Bildirim başlığı - arkadaşlık istekleri
  const renderHeader = () => {
    if (friendRequests.length === 0) return null;

    return (
      <View style={styles.requestsContainer}>
        <LinearGradient
          colors={["#4e54c820", "#8f94fb10"]}
          style={styles.requestsGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.requestsHeader}>
          <Text style={styles.requestsTitle}>Arkadaşlık İstekleri</Text>
          {friendRequests.length > 3 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={handleFriendRequestPress}
            >
              <Text style={styles.viewAllText}>Tümünü Gör</Text>
            </TouchableOpacity>
          )}
        </View>
        {friendRequests.slice(0, 3).map((request) => (
          <FriendshipRequestItem
            key={request.id}
            request={request}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
            isProcessing={processingRequestIds.includes(String(request.id))}
          />
        ))}
        <View style={styles.divider} />
      </View>
    );
  };

  // Render fonksiyonları
  const renderNotification = React.useCallback(
    ({ item }: { item: MobileNotification | NotificationResponse }) => (
      <NotificationItem notification={item} onPress={handleNotificationPress} />
    ),
    [handleNotificationPress]
  );

  // keyExtractor fonksiyonu
  const keyExtractor = React.useCallback(
    (item: MobileNotification | NotificationResponse): string =>
      `notification-${item.id}`,
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#fff" />

      <LinearGradient
        colors={["#4e54c8", "#8f94fb"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Bildirimler</Text>
          </View>

          {/* Tümünü Okundu Olarak İşaretle Butonu */}
          {notifications.length > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={handleMarkAllAsRead}
            >
              <CheckCircle size={16} color="#fff" style={{ marginRight: 5 }} />
              <Text style={styles.markAllText}>Tümünü Okundu İşaretle</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

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
            Tümü
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
            Okunmamış
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4e54c8" />
          <Text style={styles.loadingText}>Bildirimler yükleniyor...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <LinearGradient
            colors={["#ff6b6b20", "#ff6b6b10"]}
            style={styles.errorGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <AlertTriangle size={60} color="#ff6b6b" />
          <Text style={styles.errorTitle}>Bir Sorun Oluştu</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              fetchNotifications();
              fetchFriendshipRequests();
            }}
          >
            <RefreshCw size={16} color="#fff" />
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={getFilteredNotifications()}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={handleNotificationPress}
            />
          )}
          keyExtractor={(item) => `notification-${item.id}`}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#4e54c8"]}
              tintColor="#4e54c8"
            />
          }
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyComponent}
          ListFooterComponent={<View style={{ height: 20 }} />}
        />
      )}
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
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 15,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: "#4e54c8",
  },
  tabText: {
    fontSize: 16,
    color: "#95a5a6",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#4e54c8",
    fontWeight: "700",
  },
  boldText: {
    fontWeight: "bold",
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    marginTop: 50,
    position: "relative",
    overflow: "hidden",
  },
  emptyGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4e54c8",
    textAlign: "center",
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    marginTop: 50,
    position: "relative",
    overflow: "hidden",
  },
  errorGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff6b6b",
    marginVertical: 15,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4e54c8",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  requestsContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },
  requestsGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  requestsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  requestsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4e54c8",
  },
  viewAllButton: {
    backgroundColor: "#4e54c8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(78, 84, 200, 0.15)",
    marginVertical: 10,
  },
});
