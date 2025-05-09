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
} from "../../services/api/notifications";
import { Linking } from "react-native";
import { AlertTriangle, RefreshCw } from "lucide-react-native";

// API isteği için timeout değeri (ms)
const API_TIMEOUT = 15000;

export default function NotificationsScreen() {
  const [apiNotifications, setApiNotifications] = useState<
    NotificationResponse[]
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
        let notificationsData: NotificationResponse[] = [];

        if (Array.isArray(response.data)) {
          // Doğrudan dizi dönüyorsa
          notificationsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // { data: [...] } formatında dönüyorsa
          notificationsData = response.data.data;
        } else if (
          response.data.status === "success" &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          // { status: "success", data: [...] } formatında dönüyorsa
          notificationsData = response.data.data;
        } else {
          // Hiçbir bilinen format bulunamadıysa
          console.error("Bilinmeyen API yanıt formatı:", response.data);
          setApiNotifications([]);
          setError("Bildirimler alınamadı: Bilinmeyen API yanıt formatı");
          return;
        }

        // Verileri tarih sırasına göre sırala (en yeniler üstte)
        notificationsData.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setApiNotifications(notificationsData);
      } else {
        console.error("Bildirimler alınırken boş yanıt:", response);
        setApiNotifications([]);
        setError("Bildirimler alınamadı: Boş yanıt");
      }
    } catch (error: any) {
      console.error("Bildirimler getirilirken hata:", error);
      setApiNotifications([]);

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
        if (results.every((result) => result.status === "rejected")) {
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
  }, [refreshing, apiRequestInProgress]);

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
      Alert.alert(
        "Hata",
        "Arkadaşlık isteği kabul edilirken bir sorun oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      // İşlem tamamlandı
      setProcessingRequestIds((prev) =>
        prev.filter((id) => id !== requestId.toString())
      );
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
      Alert.alert(
        "Hata",
        "Arkadaşlık isteği reddedilirken bir sorun oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      // İşlem tamamlandı
      setProcessingRequestIds((prev) =>
        prev.filter((id) => id !== requestId.toString())
      );
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

      // Backend'den dönen API yanıtı
      if (
        response.data &&
        (response.data.status === "success" || response.data.success)
      ) {
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

  // Bildirim türüne göre yönlendirme
  const handleNotificationPress = async (
    notification: NotificationResponse
  ) => {
    // Bildirimi okundu olarak işaretle
    await handleMarkNotificationAsRead(notification);

    // Sadece okundu olarak işaretle, herhangi bir yönlendirme yapma
    console.log("Bildirim okundu olarak işaretlendi:", notification.id);
  };

  // Arkadaşlık isteğine tıklandığında
  const handleFriendRequestPress = () => {
    router.push("/friend-requests" as any);
  };

  // Tüm bildirimleri okundu olarak işaretle
  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationsService.markAllAsRead();

      // Backend'den dönen API yanıtı
      if (
        response.data &&
        (response.data.status === "success" || response.data.success)
      ) {
        // Tüm bildirimleri yerel olarak okundu işaretle
        setApiNotifications((prevState) =>
          prevState.map((item) => ({ ...item, read_status: true }))
        );
      }
    } catch (error) {
      console.error("Tüm bildirimler okundu işaretlenirken hata:", error);
      Alert.alert(
        "Hata",
        "Bildirimler okundu olarak işaretlenirken bir sorun oluştu."
      );
    }
  };

  const getFilteredNotifications = () => {
    return activeTab === "all"
      ? apiNotifications
      : apiNotifications.filter((item) => !item.read_status);
  };

  // Boş durum gösterimi
  const renderEmptyComponent = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { marginTop: 16 }]}>
            Bildirimler yükleniyor...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <AlertTriangle size={48} color="#e74c3c" />
          <Text style={[styles.emptyText, { marginTop: 16 }]}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRefresh}
            disabled={apiRequestInProgress}
          >
            <RefreshCw size={16} color="#fff" />
            <Text style={styles.retryButtonText}>
              {apiRequestInProgress ? "Yenileniyor..." : "Tekrar Dene"}
            </Text>
          </TouchableOpacity>

          {isNetworkError && (
            <Text style={styles.networkTip}>
              İpucu: Ağ ayarlarınızı veya internet bağlantınızı kontrol edin.
            </Text>
          )}
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {activeTab === "all"
            ? "Hiç bildiriminiz bulunmuyor."
            : "Okunmamış bildiriminiz bulunmuyor."}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Üst bilgi çubuğu */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bildirimler</Text>

        {activeTab === "all" && apiNotifications.length > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            disabled={apiRequestInProgress}
          >
            <Text
              style={[
                styles.clearText,
                apiRequestInProgress && styles.disabledText,
              ]}
            >
              Tümünü Okundu İşaretle
            </Text>
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
        contentContainerStyle={[
          styles.listContent,
          apiNotifications.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4CAF50"]} // Android için
            tintColor={"#4CAF50"} // iOS için
          />
        }
      />
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
  disabledText: {
    opacity: 0.5,
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
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#3498db",
    borderRadius: 24,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  networkTip: {
    marginTop: 16,
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
