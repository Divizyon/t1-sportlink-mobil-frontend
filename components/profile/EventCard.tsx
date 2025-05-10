import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text as RNText,
  Image,
} from "react-native";
import { Text } from "@/components/ui/text";
import { MapPin, Clock, Calendar, Users, Tag } from "lucide-react-native";
import { router } from "expo-router";

// Tema renkleri
const theme = {
  primary: "#10B981", // Ana yeşil renk
  primaryLight: "#A7F3D0", // Açık yeşil
  secondary: "#F59E0B", // İkincil renk (turuncu)
  secondaryLight: "#FEF3C7", // Açık turuncu
  tertiary: "#64748B", // Üçüncül renk (gri)
  tertiaryLight: "#E2E8F0", // Açık gri
  background: "#FFFFFF", // Kart arkaplanı
  surface: "#F1F5F9", // Yüzey rengi
  text: "#0F172A", // Ana metin
  textSecondary: "#64748B", // İkincil metin
  border: "#E2E8F0", // Kenar rengi
};

interface EventCardProps {
  event: {
    id: number;
    title: string;
    sport?: {
      id: number;
      icon: string;
      name: string;
    };
    status: string;
    event_date: string;
    start_time: string;
    end_time: string;
    location_name: string;
  };
  onPress: (id: number) => void;
  onJoin?: (id: number) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onPress, onJoin }) => {
  // Emoji'yi alma
  const getSportEmoji = (sportName: string) => {
    switch (sportName) {
      case "Futbol":
        return "⚽";
      case "Basketbol":
        return "🏀";
      case "Yüzme":
        return "🏊";
      case "Tenis":
        return "🎾";
      case "Voleybol":
        return "🏐";
      case "Koşu":
        return "🏃";
      case "Yoga":
        return "🧘";
      case "Bisiklet":
        return "🚴";
      case "Yürüyüş":
        return "🚶";
      case "Akıl Oyunları":
        return "🧠";
      case "Okçuluk":
        return "🏹";
      case "Masa Tenisi":
        return "🏓";
      case "Golf":
        return "⛳";
      case "Boks":
        return "🥊";
      case "Balık Tutma":
        return "🎣";
      case "Dağcılık":
        return "🧗";
      case "Kayak":
        return "⛷️";
      case "Snowboard":
        return "🏂";
      case "Sörf":
        return "🏄";
      case "Dalış":
        return "🤿";
      case "Kano":
        return "🛶";
      case "Kürek":
        return "🚣";
      case "Dans":
        return "💃";
      case "Plates":
        return "🤸";
      default:
        return "🏆";
    }
  };

  // Kartın durumuna göre stil belirle
  const cardStyle = () => {
    if (event.status === "ACTIVE") {
      return [styles.eventCard, styles.activeEventCard];
    } else if (event.status === "COMPLETED") {
      return [styles.eventCard, styles.completedEventCard];
    } else if (event.status === "PENDING") {
      return [styles.eventCard, styles.pendingEventCard];
    } else {
      return styles.eventCard;
    }
  };

  // Durum metnini görüntüle
  const getStatusText = () => {
    if (event.status === "ACTIVE") {
      return "Aktif";
    } else if (event.status === "COMPLETED") {
      return "Tamamlandı";
    } else if (event.status === "PENDING") {
      return "Beklemede";
    } else {
      return "";
    }
  };

  // Durum rengini belirle
  const getStatusColor = () => {
    if (event.status === "ACTIVE") {
      return { backgroundColor: theme.primaryLight, color: theme.primary };
    } else if (event.status === "COMPLETED") {
      return { backgroundColor: theme.secondaryLight, color: theme.secondary };
    } else if (event.status === "PENDING") {
      return { backgroundColor: theme.tertiaryLight, color: theme.tertiary };
    } else {
      return { backgroundColor: theme.tertiaryLight, color: theme.tertiary };
    }
  };

  // Tarih formatı için yardımcı fonksiyon
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Eğer geçerli bir tarih değilse bugünün tarihini kullan
      if (isNaN(date.getTime())) {
        const today = new Date();
        return {
          day: today.getDate(),
          month: today.toLocaleString("tr-TR", { month: "short" }).slice(0, 3),
        };
      }
      return {
        day: date.getDate(),
        month: date.toLocaleString("tr-TR", { month: "short" }).slice(0, 3),
      };
    } catch (e) {
      const today = new Date();
      return {
        day: today.getDate(),
        month: today.toLocaleString("tr-TR", { month: "short" }).slice(0, 3),
      };
    }
  };

  // Saat formatla
  const formatTime = (timeString: string) => {
    try {
      if (!timeString || timeString.length < 5) return "--:--";
      // HH:MM formatında ise direkt kullan
      if (timeString.length === 5 && timeString.includes(":")) {
        return timeString;
      }
      // Tarih stringiyse
      return new Date(timeString).toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "--:--";
    }
  };

  const { day, month } = formatDate(event.event_date);

  const handlePress = () => {
    if (onPress) {
      onPress(event.id);
    } else {
      router.push({
        pathname: "/(tabs)/dashboard/event-details",
        params: { id: event.id },
      });
    }
  };

  return (
    <TouchableOpacity
      key={event.id}
      style={cardStyle()}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.eventHeader}>
        <View style={styles.dateBox}>
          <Calendar size={14} color="#ffffff" style={{ marginBottom: 4 }} />
          <Text style={styles.dateNumber}>{day}</Text>
          <Text style={styles.dateMonth}>{month}</Text>
        </View>

        <View style={styles.eventDetails}>
          <View style={styles.eventTitleRow}>
            <Text style={styles.eventTitle}>{event.title}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor().backgroundColor },
              ]}
            >
              <Text
                style={[styles.statusText, { color: getStatusColor().color }]}
              >
                {getStatusText()}
              </Text>
            </View>
          </View>

          {event.sport && (
            <View style={styles.sportInfoContainer}>
              <RNText style={styles.sportEmoji}>
                {getSportEmoji(event.sport.name)}
              </RNText>
              <Text style={styles.sportName}>{event.sport.name}</Text>
            </View>
          )}

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Clock
                size={14}
                color={theme.textSecondary}
                style={styles.infoIcon}
              />
              <Text style={styles.infoText}>
                {formatTime(event.start_time)} - {formatTime(event.end_time)}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MapPin
                size={14}
                color={theme.textSecondary}
                style={styles.infoIcon}
              />
              <Text style={styles.infoText} numberOfLines={1}>
                {event.location_name}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  activeEventCard: {
    borderWidth: 2,
    borderColor: "#10B981", // Belirgin yeşil çerçeve
  },
  completedEventCard: {
    borderWidth: 2,
    borderColor: "#F59E0B", // Belirgin sarı çerçeve
  },
  pendingEventCard: {
    borderWidth: 2,
    borderColor: "#64748B", // Belirgin gri çerçeve
  },
  eventHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  dateBox: {
    width: 50,
    height: 70,
    backgroundColor: "#1a1a1a", // Siyah arkaplan
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  dateMonth: {
    fontSize: 12,
    color: "#ffffff",
    textTransform: "uppercase",
  },
  eventDetails: {
    flex: 1,
  },
  eventTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  sportInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  sportEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  sportName: {
    fontSize: 14,
    color: "#444444",
    fontWeight: "500",
  },
  infoContainer: {
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#64748B",
    flex: 1,
  },
});

export default EventCard;
