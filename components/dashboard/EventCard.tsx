import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { MapPin, Users, Calendar, Clock } from "lucide-react-native";
import { getSportImage } from "@/utils/imageUtils";
import { formatTime } from "@/utils/dateUtils";

// Event tipi tanımlama
interface Event {
  id: string;
  title: string;
  type: string;
  category: string;
  date: string;
  time: string;
  start_time?: string;
  end_time?: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  distance?: string | number;
  participantCount: number;
  maxParticipants: number;
  isJoined?: boolean;
  organizer?: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  description?: string;
  calculatedDistance?: number;
  image_url?: string;
}

interface EventCardProps {
  event: Event;
  onPress: () => void;
  compact?: boolean;
}

// Kategori renkleri
const categoryColors: { [key: string]: string } = {
  Basketbol: "#F97316", // Turuncu
  Futbol: "#22C55E", // Yeşil
  Yüzme: "#3B82F6", // Mavi
  Tenis: "#EAB308", // Sarı
  Voleybol: "#EC4899", // Pembe
  Koşu: "#8B5CF6", // Mor
  Yoga: "#14B8A6", // Turkuaz
  Bisiklet: "#EF4444", // Kırmızı
  Okçuluk: "#6366F1", // İndigo
  "Akıl Oyunları": "#8B5CF6", // Mor
  Diğer: "#64748B", // Gri
  Yürüyüş: "#10B981", // Yeşil
};

// Varsayılan kategori rengi
const defaultCategoryColor = "#64748B";

// Varsayılan etkinlik görseli
const DEFAULT_IMAGE =
  "https://sportlink-assets.s3.amazonaws.com/default-event-image.jpg";

const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  compact = false,
}) => {
  // Kategori rengini belirle
  const categoryColor = categoryColors[event.category] || defaultCategoryColor;

  // Etkinlik görselini belirle - önce özel resmi kontrol et, yoksa kategoriye göre varsayılan resmi kullan
  const imageSource =
    event.image_url && event.image_url.trim() !== ""
      ? { uri: event.image_url }
      : { uri: getSportImage(event.category) };

  // Katılımcı durumu bilgisi
  const participantInfo = `${event.participantCount}/${event.maxParticipants}`;

  // Mesafe bilgisi
  const distanceText = event.distance
    ? typeof event.distance === "number"
      ? `${event.distance.toFixed(1)} km`
      : event.distance
    : event.calculatedDistance
    ? `${event.calculatedDistance.toFixed(1)} km`
    : "";

  // Saat formatı: Start_time ve end_time varsa onları kullan, yoksa event.time'ı kullan
  const getTimeDisplay = () => {
    // Eğer başlangıç ve bitiş saatleri varsa, onları formatlayarak göster
    if (event.start_time && event.end_time) {
      return formatTime(event.start_time, event.end_time);
    }

    // time formatı içerisinde tarih bilgisi olabilir (2024-04-21T20:30:00 - 2024-04-21T22:00:00)
    if (event.time && event.time.includes("T") && event.time.includes(" - ")) {
      const [startTimeStr, endTimeStr] = event.time.split(" - ");
      return formatTime(startTimeStr, endTimeStr);
    }

    // Eğer zaten formatlanmış time varsa direkt onu kullan
    return event.time || "Belirtilmemiş";
  };

  return (
    <TouchableOpacity
      style={[styles.container, compact && styles.compactContainer]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={imageSource}
        style={styles.imageBackground}
        imageStyle={styles.image}
        onError={() =>
          console.log(`Resim yüklenemedi: ${event.category} - ${event.title}`)
        }
      >
        <View style={styles.overlay} />
        <View
          style={[styles.categoryBadge, { backgroundColor: categoryColor }]}
        >
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
      </ImageBackground>

      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Calendar size={14} color="#64748B" />
            <Text style={styles.detailText}>{event.date}</Text>
          </View>

          <View style={styles.detailRow}>
            <Clock size={14} color="#64748B" />
            <Text style={styles.detailText}>{getTimeDisplay()}</Text>
          </View>

          <View style={styles.detailRow}>
            <MapPin size={14} color="#64748B" />
            <Text style={styles.detailText} numberOfLines={1}>
              {event.location}
              {distanceText ? ` • ${distanceText}` : ""}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Users size={14} color="#64748B" />
            <Text style={styles.detailText}>{participantInfo} Katılımcı</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  compactContainer: {
    width: 240,
  },
  imageBackground: {
    height: 140,
    justifyContent: "flex-end",
  },
  image: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  contentContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  detailsContainer: {
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 13,
    color: "#64748B",
    marginLeft: 6,
  },
});

export default EventCard;
