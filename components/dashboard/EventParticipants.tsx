import React from "react";
import { StyleSheet } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Users } from "lucide-react-native";

interface EventParticipantsProps {
  participantCount: number;
  maxParticipants: number;
}

const EventParticipants: React.FC<EventParticipantsProps> = ({
  participantCount,
  maxParticipants,
}) => {
  // Create a filled array to show remaining slots
  const occupancyPercentage = (participantCount / maxParticipants) * 100;

  return (
    <Box style={styles.section}>
      <Text style={styles.sectionTitle}>Katılımcılar</Text>

      <Box style={styles.participantStats}>
        <HStack style={styles.participantCount}>
          <Users size={20} color="#4F46E5" style={{ marginRight: 8 }} />
          <Text style={styles.countText}>
            {participantCount}/{maxParticipants} Katılımcı
          </Text>
        </HStack>

        <Box style={styles.progressBarContainer}>
          <Box
            style={[styles.progressBar, { width: `${occupancyPercentage}%` }]}
          />
        </Box>

        <Text style={styles.availabilityText}>
          {maxParticipants - participantCount} kişilik yer kaldı
        </Text>
      </Box>
    </Box>
  );
};

const styles = StyleSheet.create({
  section: {
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 16,
  },
  participantStats: {
    marginBottom: 16,
  },
  participantCount: {
    alignItems: "center",
    marginBottom: 8,
  },
  countText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 4,
  },
  availabilityText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "right",
  },
});

export default EventParticipants;
