import { Text } from "@/components/ui/text";
import { formatDistanceToNow, format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Bell,
  Calendar,
  Clock,
  MessageCircle,
  ThumbsUp,
  User,
  Info,
  AlertTriangle,
  Users,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  XCircle,
  Flag,
} from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View, Image } from "react-native";
import { NotificationResponse } from "../../services/api/notifications";
import { LinearGradient } from "expo-linear-gradient";

interface NotificationItemProps {
  notification: NotificationResponse;
  onPress: (notification: NotificationResponse) => void;
}

const NotificationItem = ({ notification, onPress }: NotificationItemProps) => {
  // Format the time to "X minutes/hours/days ago" format
  const getFormattedTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch (error) {
      return "bilinmeyen zaman";
    }
  };

  // Format content to be more readable and concise
  const getFormattedContent = (notification: NotificationResponse) => {
    const { content, notification_type } = notification;

    // Person name
    const personName = getPersonNameFromContent(content);

    // Event name
    const eventName = getEventNameFromContent(content);

    // Create a formatted text based on notification type and content
    switch (notification_type) {
      case "new_event":
        return `${personName || "Bir kullanıcı"} yeni bir etkinlik oluşturdu${
          eventName ? `: ${eventName}` : ""
        }`;

      case "event_update":
      case "event_updated":
        return `${personName || "Bir kullanıcı"} etkinliği güncelledi${
          eventName ? `: ${eventName}` : ""
        }`;

      case "event_join":
        return `${personName || "Bir kullanıcı"} etkinliğe katıldı${
          eventName ? `: ${eventName}` : ""
        }`;

      case "event_leave":
        return `${personName || "Bir kullanıcı"} etkinlikten ayrıldı${
          eventName ? `: ${eventName}` : ""
        }`;

      case "event_cancelled":
        return `${eventName || "Bir etkinlik"} iptal edildi`;

      case "event_completed":
        return `${eventName || "Bir etkinlik"} tamamlandı`;

      case "friend_request":
        return `${personName || "Bir kullanıcı"} arkadaşlık isteği gönderdi`;

      case "friend_request_accepted":
        return `${
          personName || "Bir kullanıcı"
        } arkadaşlık isteğini kabul etti`;

      default:
        // If we can't format, return the original content
        return content;
    }
  };

  // Extract event name from content if possible
  const getEventNameFromContent = (content: string) => {
    if (!content) return null;

    // "Etkinlik adı: \"EVENT_NAME\" (Person tarafından)" formatındaki içeriği parçalara ayır
    const match = content.match(/"([^"]+)"/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  };

  // Extract person name from content if possible
  const getPersonNameFromContent = (content: string) => {
    if (!content) return null;

    // "... (PERSON_NAME tarafından)" formatındaki içeriği parçalara ayır
    const match = content.match(/\(([^)]+) tarafından\)/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  };

  // Get background colors based on notification type
  const getNotificationColors = (type: string) => {
    switch (type) {
      case "new_event":
        return {
          gradient: ["#2196F3", "#0D47A1"],
          iconBg: "#E3F2FD",
        };
      case "event_update":
      case "event_updated":
        return {
          gradient: ["#00BCD4", "#006064"],
          iconBg: "#E0F7FA",
        };
      case "event_join":
        return {
          gradient: ["#4CAF50", "#1B5E20"],
          iconBg: "#E8F5E9",
        };
      case "event_leave":
        return {
          gradient: ["#FF9800", "#E65100"],
          iconBg: "#FFF3E0",
        };
      case "event_cancelled":
        return {
          gradient: ["#F44336", "#B71C1C"],
          iconBg: "#FFEBEE",
        };
      case "event_completed":
        return {
          gradient: ["#8BC34A", "#33691E"],
          iconBg: "#F1F8E9",
        };
      case "friend_request":
        return {
          gradient: ["#9C27B0", "#4A148C"],
          iconBg: "#F3E5F5",
        };
      case "friend_request_accepted":
        return {
          gradient: ["#673AB7", "#311B92"],
          iconBg: "#EDE7F6",
        };
      case "chat_message":
      case "new_message":
        return {
          gradient: ["#2ecc71", "#27ae60"],
          iconBg: "#E8F5E9",
        };
      default:
        return {
          gradient: ["#9E9E9E", "#424242"],
          iconBg: "#F5F5F5",
        };
    }
  };

  // Get the appropriate icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_event":
        return <Sparkles size={20} color="#1976D2" />;
      case "event_update":
      case "event_updated":
        return <RefreshCw size={20} color="#00838F" />;
      case "event_join":
        return <Users size={20} color="#2E7D32" />;
      case "event_leave":
        return <XCircle size={20} color="#EF6C00" />;
      case "event_cancelled":
        return <XCircle size={20} color="#C62828" />;
      case "event_completed":
        return <CheckCircle2 size={20} color="#558B2F" />;
      case "event_status_change":
        return <Flag size={20} color="#5D4037" />;
      case "chat_message":
      case "new_message":
        return <MessageCircle size={20} color="#2ecc71" />;
      case "friend_request":
        return <User size={20} color="#7B1FA2" />;
      case "friend_request_accepted":
        return <Users size={20} color="#512DA8" />;
      case "system":
      case "system_notification":
        return <Bell size={20} color="#f39c12" />;
      case "like":
        return <ThumbsUp size={20} color="#e74c3c" />;
      case "warning":
        return <AlertTriangle size={20} color="#f39c12" />;
      default:
        return <Info size={20} color="#616161" />;
    }
  };

  // Convert notification type to human readable format
  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case "event_update":
      case "event_updated":
        return "Etkinlik Güncellendi";
      case "new_event":
        return "Yeni Etkinlik";
      case "event_join":
        return "Etkinliğe Katılım";
      case "event_leave":
        return "Etkinlikten Ayrılma";
      case "event_cancelled":
        return "Etkinlik İptal Edildi";
      case "event_completed":
        return "Etkinlik Tamamlandı";
      case "event_status_change":
        return "Etkinlik Durumu";
      case "chat_message":
      case "new_message":
        return "Yeni Mesaj";
      case "friend_request":
        return "Arkadaşlık İsteği";
      case "friend_request_accepted":
        return "Arkadaşlık İsteği";
      case "system":
      case "system_notification":
        return "Sistem";
      case "like":
        return "Beğeni";
      default:
        return "Bildirim";
    }
  };

  const colors = getNotificationColors(notification.notification_type);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.notificationItem,
        !notification.read_status && styles.unreadItem,
      ]}
      onPress={() => onPress(notification)}
    >
      <View style={styles.container}>
        <View
          style={[styles.iconContainer, { backgroundColor: colors.iconBg }]}
        >
          {getNotificationIcon(notification.notification_type)}
          {!notification.read_status && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.contentContainer}>
          <Text style={styles.content} numberOfLines={2} ellipsizeMode="tail">
            {getFormattedContent(notification)}
          </Text>

          <View style={styles.metaContainer}>
            <LinearGradient
              colors={[colors.gradient[0], colors.gradient[1]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.badgeContainer}
            >
              <Text style={styles.notificationType}>
                {getNotificationTypeText(notification.notification_type)}
              </Text>
            </LinearGradient>
            <Text style={styles.time}>
              {getFormattedTime(notification.created_at)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  notificationItem: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  unreadItem: {
    backgroundColor: "#f7faff",
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    right: -3,
    top: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF3B30",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  content: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginBottom: 6,
    fontWeight: "500",
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  notificationType: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  time: {
    fontSize: 11,
    color: "#95a5a6",
    fontWeight: "400",
  },
});

export default NotificationItem;
