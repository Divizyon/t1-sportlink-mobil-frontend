import React from "react";
import { StyleSheet, FlatList, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Center } from "@/components/ui/center";
import EventCard from "./EventCard";
import LoadingAnimation from "../animations/LoadingAnimations";

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

interface EventListProps {
  events: Event[];
  isLoading?: boolean;
  onEventPress: (eventId: number) => void;
  onJoinEvent: (eventId: number) => void;
  onRateEvent?: (eventId: number) => void;
}

const EventList: React.FC<EventListProps> = ({
  events,
  isLoading = false,
  onEventPress,
  onJoinEvent,
  onRateEvent,
}) => {
  if (isLoading) {
    return (
      <Center style={styles.loadingContainer}>
        <LoadingAnimation size={60} />
        <Text style={styles.loadingText}>Etkinlikler yükleniyor...</Text>
      </Center>
    );
  }

  if (events.length === 0) {
    return (
      <Center style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Bu kriterlere uygun etkinlik bulunamadı.
        </Text>
      </Center>
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.eventCardContainer}>
          <EventCard
            event={item}
            onPress={onEventPress}
            onJoin={onJoinEvent}
            onRate={onRateEvent}
          />
        </View>
      )}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  eventCardContainer: {
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
  },
  emptyContainer: {
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
});

export default EventList;
