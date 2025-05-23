import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { ChevronRight } from "lucide-react-native";
import EventCard from "./EventCard";
import { router } from "expo-router";

// Event tipi tanımlama
interface Event {
  id: string;
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
  participantCount: number;
  maxParticipants: number;
  isJoined: boolean;
  organizer: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  description: string;
  calculatedDistance?: number;
  image_url?: string;
}

interface CurrentEventsProps {
  title: string;
  events: Event[];
  onEventPress: (eventId: string) => void;
  onSeeAllPress?: () => void;
  emptyMessage?: string;
  loading?: boolean;
}

const CurrentEvents: React.FC<CurrentEventsProps> = ({
  title,
  events,
  onEventPress,
  onSeeAllPress,
  emptyMessage = "Şu an etkinlik bulunmuyor",
  loading = false,
}) => {
  const handleSeeAllPress = () => {
    if (onSeeAllPress) {
      onSeeAllPress();
    } else {
      router.push("/all-events");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          onPress={handleSeeAllPress}
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAllText}>Tümünü Gör</Text>
          <ChevronRight size={16} color="#10B981" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          {/* Skeleton loading placeholders */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[1, 2, 3]}
            keyExtractor={(item) => item.toString()}
            renderItem={() => (
              <View style={styles.skeletonCard}>
                <View style={styles.skeletonImage} />
                <View style={styles.skeletonContent}>
                  <View style={styles.skeletonTitle} />
                  <View style={styles.skeletonText} />
                  <View style={styles.skeletonText} />
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        </View>
      ) : events.length > 0 ? (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={events}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => onEventPress(item.id.toString())}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
    marginRight: 2,
  },
  listContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  emptyContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    marginHorizontal: 16,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
  },
  loadingContainer: {
    height: 200,
  },
  skeletonCard: {
    width: 280,
    height: 180,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
  },
  skeletonImage: {
    height: 100,
    backgroundColor: "#E2E8F0",
  },
  skeletonContent: {
    padding: 12,
  },
  skeletonTitle: {
    height: 18,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginBottom: 8,
    width: "80%",
  },
  skeletonText: {
    height: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginBottom: 6,
    width: "60%",
  },
});

export default CurrentEvents;
