import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import {
  Calendar,
  MessageCircle,
  Bell,
  User,
  Users,
  ThumbsUp,
  Clock,
  TrashIcon,
  Info,
} from "lucide-react-native";
import { router } from "expo-router";
import { Link } from "expo-router";

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
          // @ts-ignore - Expo Router tip sorununu geçici olarak görmezden geliyoruz
          router.push("/upcoming-events");
        } else if (notification.title === "Etkinlik Güncellemesi") {
          // Eğer başlık "Etkinlik Güncellemesi" ise güncellenen etkinlikler sayfasına yönlendir
          // @ts-ignore
          router.push("/event-updates");
        } else if (notification.title === "Yeni Etkinlik") {
          // Eğer başlık "Yeni Etkinlik" ise tüm etkinlikler sayfasına yönlendir
          // @ts-ignore - Expo Router tip sorununu geçici olarak görmezden geliyoruz
          router.push("/all-events");
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
        // @ts-ignore - Expo Router tip sorununu geçici olarak görmezden geliyoruz
        router.push("/messages");
        break;
      case "friend":
        // Arkadaşlık istekleri sayfasına yönlendir
        // @ts-ignore - Expo Router tip sorununu geçici olarak görmezden geliyoruz
        router.push("/friend-requests");
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
        // @ts-ignore - Expo Router tip sorununu geçici olarak görmezden geliyoruz
        router.push("/system-notifications");
        break;
      default:
        break;
    }
  };

  const handleClearAll = () => {
    // Tüm bildirimleri okundu olarak işaretle
    setNotifications((prevNotifications) =>
      prevNotifications.map((item) => ({ ...item, isRead: true }))
    );
  };

  const handleDeleteNotification = (id: string) => {
    // Bildirimi sil
    setNotifications((prevNotifications) =>
      prevNotifications.filter((item) => item.id !== id)
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

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteNotification(item.id)}
        >
          <TrashIcon size={18} color="#95a5a6" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={{ padding: 16 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={styles.screenTitle}>Bildirimler</Text>

          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.clearAllButton}
              onPress={handleClearAll}
            >
              <Text style={styles.clearAllText}>Tümünü Okundu İşaretle</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.tabContainer, { marginBottom: 16 }]}>
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
                unreadCount > 0 && styles.boldText,
              ]}
            >
              Okunmamış ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {getFilteredNotifications().length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Bell size={60} color="#d5d5d5" />
          <Text style={styles.emptyText}>Bildirim Yok</Text>
          <Text style={styles.emptySubText}>
            {activeTab === "all"
              ? "Henüz bildiriminiz bulunmuyor."
              : "Okunmamış bildiriminiz bulunmuyor."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={getFilteredNotifications()}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
  screenTitle: {
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
  deleteButton: {
    padding: 8,
    marginLeft: 8,
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
});
