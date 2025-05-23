import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import {
  ChevronLeft,
  User,
  Check,
  X,
  Clock,
  AlertCircle,
} from "lucide-react-native";
import { FriendshipRequest } from "../../types/friendships";
import {
  getIncomingFriendshipRequests,
  acceptFriendshipRequest,
  rejectFriendshipRequest,
} from "../../services/api/friendships";

export default function FriendRequestsScreen() {
  const [friendRequests, setFriendRequests] = useState<FriendshipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingRequestIds, setProcessingRequestIds] = useState<string[]>(
    []
  );

  // Arkadaşlık isteklerini getir
  const fetchFriendRequests = async () => {
    try {
      setLoading(true);
      const response = await getIncomingFriendshipRequests();
      if (response.status === "success" && response.data) {
        console.log("Gelen arkadaşlık istekleri:", response.data.length);
        console.log(
          "Arkadaşlık isteği detayları:",
          JSON.stringify(response.data, null, 2)
        );
        setFriendRequests(response.data);
      }
    } catch (error) {
      console.error("Arkadaşlık istekleri getirilirken hata:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Sayfa yüklendiğinde arkadaşlık isteklerini getir
  useEffect(() => {
    fetchFriendRequests();
  }, []);

  // Yenile fonksiyonu
  const onRefresh = () => {
    setRefreshing(true);
    fetchFriendRequests();
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleViewProfile = (userId: string) => {
    router.push({
      pathname: "/(tabs)/profile",
      params: { id: userId },
    });
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      // İşlem başladı durumunu kaydet
      setProcessingRequestIds((prev) => [...prev, requestId.toString()]);

      const response = await acceptFriendshipRequest(requestId.toString());

      if (response.status === "success") {
        // İstek listeden kaldırılıyor
        setFriendRequests((prev) =>
          prev.filter(
            (request) => request.id.toString() !== requestId.toString()
          )
        );
        console.log("Arkadaşlık isteği kabul edildi:", requestId);
      }
    } catch (error) {
      console.error("Arkadaşlık isteği kabul edilirken hata:", error);
    } finally {
      // İşlemi tamamlandı durumunu kaydet
      setProcessingRequestIds((prev) =>
        prev.filter((id) => id !== requestId.toString())
      );
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      // İşlem başladı durumunu kaydet
      setProcessingRequestIds((prev) => [...prev, requestId.toString()]);

      const response = await rejectFriendshipRequest(requestId.toString());

      if (response.status === "success") {
        // İstek listeden kaldırılıyor
        setFriendRequests((prev) =>
          prev.filter(
            (request) => request.id.toString() !== requestId.toString()
          )
        );
        console.log("Arkadaşlık isteği reddedildi:", requestId);
      }
    } catch (error) {
      console.error("Arkadaşlık isteği reddedilirken hata:", error);
    } finally {
      // İşlemi tamamlandı durumunu kaydet
      setProcessingRequestIds((prev) =>
        prev.filter((id) => id !== requestId.toString())
      );
      setLoading(false);
    }
  };

  const renderFriendRequestItem = ({ item }: { item: FriendshipRequest }) => {
    // Kullanıcı adını güvenli bir şekilde alalım
    const getRequesterName = () => {
      // Requester undefined ise güvenli bir değer döndür
      if (!item.requester) {
        return "Bilinmeyen Kullanıcı";
      }

      // First_name ve last_name birleştir
      if (item.requester.first_name || item.requester.last_name) {
        return `${item.requester.first_name || ""} ${
          item.requester.last_name || ""
        }`.trim();
      }

      // Hiçbir isim bilgisi yoksa
      return "Bilinmeyen Kullanıcı";
    };

    const requesterName = getRequesterName();

    // Kullanıcı adından avatar oluştur
    const avatarLetter = requesterName.charAt(0).toUpperCase();

    // İsteğin işlem durumunu kontrol et
    const isProcessing = processingRequestIds.includes(item.id.toString());

    return (
      <View style={styles.requestItem}>
        <TouchableOpacity
          style={styles.profileSection}
          onPress={() =>
            item.requester ? handleViewProfile(item.requester.id) : null
          }
        >
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.name}>{requesterName}</Text>
            <View style={styles.timeContainer}>
              <Clock size={12} color="#95a5a6" />
              <Text style={styles.time}>
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString("tr-TR")
                  : ""}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.acceptButton,
              isProcessing && styles.disabledButton,
            ]}
            onPress={() =>
              !isProcessing && handleAcceptRequest(item.id.toString())
            }
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Check size={18} color="#fff" />
                <Text style={styles.acceptButtonText}>Kabul Et</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.rejectButton,
              isProcessing && styles.disabledButton,
            ]}
            onPress={() =>
              !isProcessing && handleRejectRequest(item.id.toString())
            }
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <>
                <X size={18} color="#666" />
                <Text style={styles.rejectButtonText}>Reddet</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Arkadaşlık İstekleri</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : friendRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <User size={64} color="#d5d5d5" />
          <Text style={styles.emptyText}>Arkadaşlık İsteği Yok</Text>
          <Text style={styles.emptySubText}>
            Şu anda bekleyen arkadaşlık isteği bulunmuyor.
          </Text>
        </View>
      ) : (
        <FlatList
          data={friendRequests}
          renderItem={renderFriendRequestItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  requestItem: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileSection: {
    flexDirection: "row",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  mutualFriends: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    fontSize: 12,
    color: "#95a5a6",
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 4,
  },
  rejectButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  rejectButtonText: {
    color: "#666",
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  acceptedText: {
    color: "#2ecc71",
    marginLeft: 4,
  },
  rejectedText: {
    color: "#e74c3c",
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#95a5a6",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#bdc3c7",
    textAlign: "center",
    paddingHorizontal: 32,
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
