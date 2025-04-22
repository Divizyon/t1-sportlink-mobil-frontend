import React from "react";
import { StyleSheet, TouchableOpacity, Image, View } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Star,
  UserCheck,
  CheckCircle,
} from "lucide-react-native";

// Tema renkleri - daha koyu yeşil
const theme = {
  primary: "#10B981", // Ana yeşil renk - daha koyu (eski: #34D399)
  primaryLight: "#A7F3D0", // Çok açık yeşil (eski: #D1FAE5)
  primaryPale: "#D1FAE5", // En açık yeşil tonu (eski: #ECFDF5)
  secondary: "#F59E0B", // İkincil renk (turuncu)
  background: "#FFFFFF", // Kart arkaplanı
  surface: "#F1F5F9", // Yüzey rengi
  text: "#0F172A", // Ana metin
  textSecondary: "#64748B", // İkincil metin
  border: "#E2E8F0", // Kenar rengi
  success: "#10B981", // Başarı rengi (yeşil) - daha koyu (eski: #34D399)
};

// Event tipi tanımlama
interface Event {
  id: number;
  title: string;
  type: string;
  category: string;
  date: string;
  time: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  distance: string;
  participants: string[];
  participantCount: number;
  maxParticipants: number;
  rating: number;
  isJoined: boolean;
  organizer: {
    id: number;
    name: string;
    isVerified: boolean;
    logoUrl: string;
  };
}

interface EventCardProps {
  event: Event;
  onPress: (eventId: number) => void;
  onJoin: (eventId: number) => void;
  onRate?: (eventId: number) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event,
  onPress,
  onJoin,
  onRate,
}) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(event.id)}
      style={styles.eventCard}
      activeOpacity={0.9}
    >
      <VStack>
        <HStack style={styles.eventTypeContainer}>
          <Box style={styles.eventType}>
            <Text style={styles.eventTypeText}>{event.type}</Text>
          </Box>
          <Text style={styles.categoryText}>{event.category}</Text>
        </HStack>
        <Text style={styles.eventTitle}>{event.title}</Text>

        <HStack style={styles.eventInfo}>
          <HStack style={styles.infoItem}>
            <Calendar
              size={14}
              color={theme.textSecondary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>{event.date}</Text>
          </HStack>
          <HStack style={styles.infoItem}>
            <Clock
              size={14}
              color={theme.textSecondary}
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>{event.time}</Text>
          </HStack>
        </HStack>

        <HStack style={styles.eventLocation}>
          <MapPin
            size={14}
            color={theme.textSecondary}
            style={styles.infoIcon}
          />
          <Text style={styles.locationText} numberOfLines={1}>
            {event.location} ({event.distance})
          </Text>
        </HStack>

        <HStack style={styles.participantsSection}>
          <HStack style={styles.avatarGroup}>
            {event.participants.slice(0, 3).map((avatar, index) => (
              <Image
                key={index}
                source={{ uri: avatar }}
                style={[
                  styles.participantAvatar,
                  { marginLeft: index > 0 ? -10 : 0 },
                ]}
              />
            ))}
          </HStack>
          <Text style={styles.participantCount}>
            {event.participantCount}/{event.maxParticipants} Katılımcı
          </Text>
        </HStack>

        <HStack style={styles.bottomRow}>
          <HStack style={styles.ratingContainer}>
            <Star size={16} color={theme.secondary} fill={theme.secondary} />
            <Text style={styles.ratingText}>{event.rating.toFixed(1)}</Text>
          </HStack>

          <HStack>
            {onRate && (
              <TouchableOpacity
                style={styles.rateButton}
                onPress={() => onRate(event.id)}
              >
                <Star size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
            <Button
              size="sm"
              variant={event.isJoined ? "outline" : "solid"}
              style={[
                styles.joinButton,
                event.isJoined
                  ? styles.joinedButton
                  : { backgroundColor: theme.primary },
              ]}
              onPress={() => onJoin(event.id)}
            >
              {event.isJoined ? (
                <UserCheck size={16} color={theme.primary} />
              ) : (
                <Users size={16} color="white" />
              )}
              <ButtonText style={event.isJoined ? styles.joinedText : {}}>
                {event.isJoined ? "Katıldın" : "Katıl"}
              </ButtonText>
            </Button>
          </HStack>
        </HStack>

        <HStack style={styles.organizerInfo}>
          <Image
            source={{ uri: event.organizer.logoUrl }}
            style={styles.organizerLogo}
          />
          <HStack style={styles.organizerName}>
            <Text style={styles.organizerText} numberOfLines={1}>
              {event.organizer.name}
            </Text>
            {event.organizer.isVerified && (
              <CheckCircle
                size={12}
                color={theme.success}
                style={{ marginLeft: 4 }}
              />
            )}
          </HStack>
        </HStack>
      </VStack>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: theme.border,
  },
  eventTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  eventType: {
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  eventTypeText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: "500",
  },
  categoryText: {
    color: theme.textSecondary,
    fontSize: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 8,
  },
  eventInfo: {
    marginBottom: 6,
  },
  infoItem: {
    marginRight: 12,
    alignItems: "center",
  },
  infoIcon: {
    marginRight: 4,
  },
  infoText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  eventLocation: {
    alignItems: "center",
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    color: theme.textSecondary,
    flex: 1,
  },
  participantsSection: {
    alignItems: "center",
    marginBottom: 12,
  },
  avatarGroup: {
    flexDirection: "row",
    marginRight: 8,
  },
  participantAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "white",
  },
  participantCount: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
    color: theme.text,
  },
  rateButton: {
    padding: 8,
    marginRight: 8,
  },
  joinButton: {
    minWidth: 80,
    borderRadius: 8,
  },
  joinedButton: {
    backgroundColor: "transparent",
    borderColor: theme.primary,
  },
  joinedText: {
    color: theme.primary,
  },
  organizerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  organizerLogo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  organizerName: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  organizerText: {
    fontSize: 12,
    color: theme.textSecondary,
  },
});

export default EventCard;
