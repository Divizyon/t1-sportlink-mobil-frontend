import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { Calendar, Clock } from "lucide-react-native";

// Event interface
interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
}

// Example event data
const mockEvents: Event[] = [
  {
    id: 1,
    title: "Basketbol Maçı",
    date: "12 Ağustos 2023",
    time: "15:00 - 17:00",
  },
  {
    id: 2,
    title: "Futbol Turnuvası",
    date: "15 Ağustos 2023",
    time: "10:00 - 13:00",
  },
  {
    id: 3,
    title: "Yüzme Etkinliği",
    date: "20 Ağustos 2023",
    time: "14:00 - 16:00",
  },
  {
    id: 4,
    title: "Voleybol Maçı",
    date: "25 Ağustos 2023",
    time: "18:00 - 20:00",
  },
  {
    id: 5,
    title: "Tenis Turnuvası",
    date: "1 Eylül 2023",
    time: "09:00 - 12:00",
  },
];

export default function RemindersScreen() {
  const [events] = useState<Event[]>(mockEvents);

  const handleEventPress = (eventId: number) => {
    router.push({
      pathname: "/reminders/[id]",
      params: { id: eventId }
    });
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      style={styles.eventItem}
      onPress={() => handleEventPress(item.id)}
    >
      <Text style={styles.eventTitle}>{item.title}</Text>
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Calendar size={16} color="#3498db" />
          <Text style={styles.eventInfo}>{item.date}</Text>
        </View>
        <View style={styles.infoRow}>
          <Clock size={16} color="#3498db" />
          <Text style={styles.eventInfo}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Etkinlik Hatırlatıcılar</Text>
      </View>
      
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  listContent: {
    padding: 16,
  },
  eventItem: {
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  infoContainer: {
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  eventInfo: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
}); 