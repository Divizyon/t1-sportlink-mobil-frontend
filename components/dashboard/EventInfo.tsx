import React from "react";
import { StyleSheet, Image } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Building,
} from "lucide-react-native";

interface EventOrganizer {
  id: number;
  name: string;
  isVerified: boolean;
  logoUrl: string;
}

interface EventInfoProps {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  distance: string;
  organizer: EventOrganizer;
  tags: string[];
}

const EventInfo: React.FC<EventInfoProps> = ({
  title,
  description,
  date,
  time,
  location,
  distance,
  organizer,
  tags,
}) => {
  return (
    <>
      <VStack style={styles.eventHeaderSection}>
        <Text style={styles.eventTitle}>{title}</Text>
        <Text style={styles.eventDescription}>{description}</Text>

        {/* Tags */}
        <HStack style={styles.tagContainer}>
          {tags.map((tag, index) => (
            <Box key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </Box>
          ))}
        </HStack>
      </VStack>

      {/* Organizer */}
      <Box style={styles.section}>
        <HStack style={styles.organizerContainer}>
          <Image
            source={{ uri: organizer.logoUrl }}
            style={styles.organizerLogo}
          />
          <VStack style={{ flex: 1, marginLeft: 12 }}>
            <HStack style={{ alignItems: "center" }}>
              <Text style={styles.organizerName}>{organizer.name}</Text>
              {organizer.isVerified && (
                <CheckCircle
                  size={16}
                  color="#047857"
                  style={{ marginLeft: 6 }}
                />
              )}
            </HStack>
            <Text style={styles.organizerType}>Spor Kulübü</Text>
          </VStack>
          <Building size={24} color="#64748B" />
        </HStack>
      </Box>

      {/* Event Details */}
      <Box style={styles.section}>
        <Text style={styles.sectionTitle}>Etkinlik Bilgileri</Text>
        <VStack style={styles.detailsContainer}>
          <HStack style={styles.detailRow}>
            <Calendar size={20} color="#4F46E5" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Tarih:</Text>
            <Text style={styles.detailText}>{date}</Text>
          </HStack>
          <HStack style={styles.detailRow}>
            <Clock size={20} color="#4F46E5" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Saat:</Text>
            <Text style={styles.detailText}>{time}</Text>
          </HStack>
          <HStack style={styles.detailRow}>
            <MapPin size={20} color="#4F46E5" style={styles.detailIcon} />
            <Text style={styles.detailLabel}>Konum:</Text>
            <Text style={styles.detailText}>
              {location} ({distance})
            </Text>
          </HStack>
        </VStack>
      </Box>
    </>
  );
};

const styles = StyleSheet.create({
  eventHeaderSection: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 16,
    color: "#334155",
    lineHeight: 24,
    marginBottom: 16,
  },
  tagContainer: {
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    padding: 16,
  },
  organizerContainer: {
    alignItems: "center",
  },
  organizerLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },
  organizerType: {
    fontSize: 12,
    color: "#64748B",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 16,
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    alignItems: "center",
  },
  detailIcon: {
    marginRight: 12,
  },
  detailLabel: {
    width: 60,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
  },
});

export default EventInfo;
