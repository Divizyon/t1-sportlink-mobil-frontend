import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { 
  ChevronLeft, 
  Bell, 
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Calendar,
  Shield,
} from "lucide-react-native";

// Sistem bildirimi arayüzü
interface SystemNotification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: "info" | "warning" | "success" | "update";
  actionUrl?: string;
}

// Örnek sistem bildirimleri verisi
const SYSTEM_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 1,
    title: "Hesap Doğrulandı",
    message: "Hesabınız başarıyla doğrulandı, tüm özelliklere erişebilirsiniz.",
    timestamp: "Bugün, 10:30",
    isRead: false,
    type: "success",
  },
  {
    id: 2,
    title: "Güvenlik Güncellemesi",
    message: "Hesap güvenliğinizi artırmak için güvenlik ayarlarınızı kontrol etmeyi unutmayın.",
    timestamp: "Dün, 14:22",
    isRead: false,
    type: "warning",
    actionUrl: "/security-settings",
  },
  {
    id: 3,
    title: "Uygulama Güncellemesi",
    message: "Uygulamamız güncellendi! Yeni özellikler ve iyileştirmeler için güncel sürümü kullanın.",
    timestamp: "2 gün önce",
    isRead: true,
    type: "info",
  },
  {
    id: 4,
    title: "Bakım Duyurusu",
    message: "Yarın 02:00-04:00 saatleri arasında planlı bakım nedeniyle hizmet veremeyeceğiz.",
    timestamp: "3 gün önce",
    isRead: true,
    type: "warning",
  },
  {
    id: 5,
    title: "Yeni Etkinlik Türleri",
    message: "Artık yoga, koşu ve bisiklet etkinlikleri oluşturabilirsiniz. Hemen deneyin!",
    timestamp: "1 hafta önce",
    isRead: true,
    type: "update",
    actionUrl: "/create-event",
  },
  {
    id: 6,
    title: "Profiliniz Onaylandı",
    message: "Kullanıcı profiliniz onaylandı. Artık etkinlik organizatörü olabilirsiniz!",
    timestamp: "2 hafta önce",
    isRead: true,
    type: "success",
  },
];

export default function SystemNotificationsScreen() {
  const [notifications, setNotifications] = useState<SystemNotification[]>(SYSTEM_NOTIFICATIONS);

  const handleBackPress = () => {
    router.back();
  };

  const handleNotificationPress = (notification: SystemNotification) => {
    // Bildirimi okundu olarak işaretle
    setNotifications(prev => 
      prev.map(item => 
        item.id === notification.id 
          ? { ...item, isRead: true } 
          : item
      )
    );

    // Bildirimde bir actionUrl varsa, o sayfaya yönlendir
    if (notification.actionUrl) {
      // @ts-ignore - Expo Router tip sorununu geçici olarak görmezden geliyoruz
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info size={24} color="#3498db" />;
      case "warning":
        return <AlertTriangle size={24} color="#f39c12" />;
      case "success":
        return <CheckCircle size={24} color="#2ecc71" />;
      case "update":
        return <Bell size={24} color="#9b59b6" />;
      default:
        return <Bell size={24} color="#95a5a6" />;
    }
  };

  const renderNotificationItem = ({ item }: { item: SystemNotification }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.iconContainer}>
        {getNotificationIcon(item.type)}
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{item.title}</Text>
          <View style={styles.timeContainer}>
            <Clock size={12} color="#95a5a6" />
            <Text style={styles.time}>{item.timestamp}</Text>
          </View>
        </View>
        
        <Text style={styles.message}>{item.message}</Text>
        
        {item.actionUrl && (
          <View style={styles.actionContainer}>
            <Text style={styles.actionText}>
              Ayrıntılar için dokunun
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(item => !item.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sistem Bildirimleri</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Settings size={20} color="#333" />
        </TouchableOpacity>
      </View>
      
      {unreadCount > 0 && (
        <TouchableOpacity 
          style={styles.markAllAsReadButton} 
          onPress={handleMarkAllAsRead}
        >
          <CheckCircle size={16} color="#3498db" />
          <Text style={styles.markAllAsReadText}>
            Tümünü Okundu İşaretle
          </Text>
        </TouchableOpacity>
      )}
      
      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={64} color="#d5d5d5" />
          <Text style={styles.emptyText}>Bildirim Yok</Text>
          <Text style={styles.emptySubText}>
            Sistem bildirimi bulunmuyor.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id.toString()}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  settingsButton: {
    padding: 4,
  },
  markAllAsReadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
  },
  markAllAsReadText: {
    marginLeft: 8,
    color: "#3498db",
    fontWeight: "600",
    fontSize: 14,
  },
  listContent: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  unreadItem: {
    backgroundColor: "#f5faff",
    borderLeftWidth: 3,
    borderLeftColor: "#3498db",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 8,
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
  message: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: 8,
  },
  actionText: {
    fontSize: 13,
    color: "#3498db",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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