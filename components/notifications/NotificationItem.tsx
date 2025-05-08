import { Text } from "@/components/ui/text";
import { formatDistanceToNow } from "date-fns";
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
} from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { NotificationResponse } from "../../services/api/notifications";

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

  // Get the appropriate icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "event_update":
        return <Calendar size={24} color="#3498db" />;
      case "chat_message":
        return <MessageCircle size={24} color="#2ecc71" />;
      case "friend_request":
        return <User size={24} color="#9b59b6" />;
      case "system":
        return <Bell size={24} color="#f39c12" />;
      case "like":
        return <ThumbsUp size={24} color="#e74c3c" />;
      case "warning":
        return <AlertTriangle size={24} color="#f39c12" />;
      default:
        return <Info size={24} color="#95a5a6" />;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !notification.read_status && styles.unreadItem,
      ]}
      onPress={() => onPress(notification)}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={styles.iconContainer}>
          {getNotificationIcon(notification.notification_type)}
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={styles.title}>{notification.title}</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Clock size={12} color="#95a5a6" />
              <Text style={styles.time}>
                {getFormattedTime(notification.created_at)}
              </Text>
            </View>
          </View>

          <Text style={styles.message}>{notification.body}</Text>

          {notification.data && notification.data.eventTitle && (
            <Text style={styles.eventTitle}>
              Etkinlik: {notification.data.eventTitle}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  eventTitle: {
    fontSize: 12,
    color: "#3498db",
    marginTop: 6,
    fontStyle: "italic",
  },
});

export default NotificationItem;
