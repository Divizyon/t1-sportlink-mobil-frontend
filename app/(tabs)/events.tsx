import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import EventsScreen from "../../components/EventsScreen";
import { router } from "expo-router";

export default function Events() {
  const handleEventPress = (eventId: string) => {
    router.push(`/event-details/${eventId}`);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["right", "left"]}>
      <EventsScreen initialTab="active" onEventPress={handleEventPress} />
    </SafeAreaView>
  );
}
