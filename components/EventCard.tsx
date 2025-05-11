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
    participants: number;
    maxParticipants: number;
    organizer: string;
    category: string;
    sport?: {
      icon: string;
      name: string;
    };
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
    Math.round((event.participants / event.maxParticipants) * 100),
    100
  );

  return (
    <TouchableOpacity
      style={[styles.container, style]}
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
          <Text style={styles.timeText}>{event.time}</Text>
        </View>

        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={14} color="#757575" />
            <Text style={styles.infoText}>{event.location}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={14} color="#757575" />
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
              {event.participants}/{event.maxParticipants} Katılımcı
            </Text>
          </View>
          <View style={styles.actionContainer}>
            <MaterialIcons name="chevron-right" size={20} color="#757575" />
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
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: "hidden",
  },
  dateContainer: {
    width: 65,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EBF3FF",
    paddingVertical: 16,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  day: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0A5196",
  },
  month: {
    fontSize: 14,
    fontWeight: "500",
    color: "#0A5196",
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
    padding: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#616161",
  },
  timeText: {
    fontSize: 13,
    color: "#757575",
    fontWeight: "500",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  infoText: {
    fontSize: 13,
    color: "#757575",
    marginLeft: 4,
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
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginBottom: 6,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
  redProgress: {
    backgroundColor: "#FF5722",
  },
  participantsText: {
    fontSize: 12,
    color: "#757575",
  },
  actionContainer: {
    marginLeft: 8,
  },
});
