import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Image,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getSportImage } from "../utils/imageUtils"; // Kategori bazlı resim fonksiyonu

interface EventProps {
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    current_participants: number;
    maxParticipants: number;
    organizer: string;
    category: string;
    sport?: {
      icon: string;
      name: string;
    };
    status?: string;
  };
  onPress: () => void;
  style?: ViewStyle;
}

export const EventCard: React.FC<EventProps> = ({ event, onPress, style }) => {
  // Ayın Türkçe kısaltmaları
  const turkishMonths: { [key: string]: string } = {
    Jan: "Oca",
    Feb: "Şub",
    Mar: "Mar",
    Apr: "Nis",
    May: "May",
    Jun: "Haz",
    Jul: "Tem",
    Aug: "Ağu",
    Sep: "Eyl",
    Oct: "Eki",
    Nov: "Kas",
    Dec: "Ara",
  };

  // Tarih bilgisini parçalara ayırma
  const dateParts = event.date.split(" ");
  const day = dateParts[0];
  const month = dateParts[1];

  // Boş spor verisi için varsayılan değerler
  const sportIcon = event.sport?.icon || "🏆";
  const sportName = event.sport?.name || event.category || "Diğer";

  // Katılımcı doluluk yüzdesi
  const participationPercentage = Math.min(
    Math.round((event.current_participants / event.maxParticipants) * 100),
    100
  );

  // Etkinlik durumuna göre border stili
  const getBorderStyle = () => {
    switch (event.status) {
      case "ACTIVE":
        return styles.activeBorder;
      case "COMPLETED":
        return styles.completedBorder;
      case "CANCELLED":
        return styles.cancelledBorder;
      case "PENDING":
        return styles.pendingBorder;
      case "REJECTED":
        return styles.rejectedBorder;
      default:
        return null;
    }
  };

  // Etkinlik durumu etiketi
  const getStatusBadge = () => {
    switch (event.status) {
      case "ACTIVE":
        return (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Aktif</Text>
          </View>
        );
      case "COMPLETED":
        return (
          <View style={[styles.statusBadge, styles.completedBadge]}>
            <Text style={[styles.statusText, styles.completedStatusText]}>
              Tamamlandı
            </Text>
          </View>
        );
      case "CANCELLED":
        return (
          <View style={[styles.statusBadge, styles.cancelledBadge]}>
            <Text style={[styles.statusText, styles.cancelledStatusText]}>
              İptal Edildi
            </Text>
          </View>
        );
      case "PENDING":
        return (
          <View style={[styles.statusBadge, styles.pendingBadge]}>
            <Text style={[styles.statusText, styles.pendingStatusText]}>
              Onay Bekliyor
            </Text>
          </View>
        );
      case "REJECTED":
        return (
          <View style={[styles.statusBadge, styles.rejectedBadge]}>
            <Text style={[styles.statusText, styles.rejectedStatusText]}>
              Reddedildi
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, getBorderStyle(), style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Tarih Kısmı */}
      <View style={styles.dateContainer}>
        <Text style={styles.day}>{day}</Text>
        <Text style={styles.month}>{month}</Text>
      </View>

      {/* İçerik Kısmı */}
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryIcon}>{sportIcon}</Text>
            <Text style={styles.categoryText}>{sportName}</Text>
          </View>
          {getStatusBadge()}
          <Text style={styles.timeText}>{event.time}</Text>
        </View>

        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={16} color="#64748b" />
            <Text style={styles.infoText}>{event.location}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={16} color="#64748b" />
            <Text style={styles.infoText}>{event.organizer}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.participantsContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${participationPercentage}%` },
                  participationPercentage >= 90 ? styles.redProgress : null,
                ]}
              />
            </View>
            <Text style={styles.participantsText}>
              {event.current_participants}/{event.maxParticipants} Katılımcı
            </Text>
          </View>
          <View style={styles.actionContainer}>
            <MaterialIcons name="arrow-forward-ios" size={16} color="#64748b" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#64748b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  dateContainer: {
    width: 68,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EBF5F0",
    paddingVertical: 18,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  day: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#10b981",
  },
  month: {
    fontSize: 15,
    fontWeight: "500",
    color: "#10b981",
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  categoryIcon: {
    fontSize: 15,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#0f172a",
  },
  timeText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 12,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  infoText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 6,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  participantsContainer: {
    flex: 1,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#e2e8f0",
    borderRadius: 3,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 3,
  },
  redProgress: {
    backgroundColor: "#ef4444",
  },
  participantsText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  actionContainer: {
    marginLeft: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  activeBorder: {
    borderColor: "rgba(16, 185, 129, 0.2)",
    borderWidth: 2,
    borderRadius: 16,
  },
  completedBorder: {
    borderColor: "rgba(234, 179, 8, 0.2)",
    borderWidth: 2,
    borderRadius: 16,
  },
  cancelledBorder: {
    borderColor: "rgba(239, 68, 68, 0.2)",
    borderWidth: 2,
    borderRadius: 16,
  },
  pendingBorder: {
    borderColor: "rgba(59, 130, 246, 0.2)",
    borderWidth: 2,
    borderRadius: 16,
  },
  rejectedBorder: {
    borderColor: "rgba(168, 85, 247, 0.2)",
    borderWidth: 2,
    borderRadius: 16,
  },
  statusBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10b981",
  },
  completedBadge: {
    backgroundColor: "rgba(234, 179, 8, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginRight: 8,
  },
  completedStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#eab308",
  },
  cancelledBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginRight: 8,
  },
  cancelledStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ef4444",
  },
  pendingBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginRight: 8,
  },
  pendingStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3b82f6",
  },
  rejectedBadge: {
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    marginRight: 8,
  },
  rejectedStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#a855f7",
  },
});
