import React from "react";
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
import { Box } from "@/components/ui/box";
import { Calendar, Clock, ChevronLeft } from "lucide-react-native";

// Güncellenen etkinlik tipi
interface UpdatedEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  updateType: string;
}

// Örnek güncellenen etkinlikler verisi
const updatedEvents: UpdatedEvent[] = [
  {
    id: 2,
    title: "Futbol Turnuvası",
    date: "15 Ağustos 2023",
    time: "10:00 - 13:00",
    updateType: "Konum değişikliği"
  },
  {
    id: 3,
    title: "Yüzme Etkinliği",
    date: "20 Ağustos 2023",
    time: "14:00 - 16:00",
    updateType: "Saat değişikliği"
  },
  {
    id: 1,
    title: "Basketbol Maçı",
    date: "12 Ağustos 2023",
    time: "15:00 - 17:00",
    updateType: "Katılımcı sınırı değişikliği"
  },
  {
    id: 4,
    title: "Voleybol Maçı",
    date: "25 Ağustos 2023",
    time: "18:00 - 20:00",
    updateType: "Açıklama değişikliği"
  },
  {
    id: 5,
    title: "Tenis Turnuvası",
    date: "1 Eylül 2023",
    time: "09:00 - 12:00",
    updateType: "Organizatör değişikliği"
  }
];

export default function UpdatedEventsScreen() {
  const handleBackPress = () => {
    router.back();
  };
  
  const handleEventPress = (eventId: number) => {
    router.push({
      pathname: "/(tabs)/reminders/[id]",
      params: { id: eventId }
    });
  };

  const renderEventItem = ({ item }: { item: UpdatedEvent }) => (
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
      <Box style={styles.updateBadge}>
        <Text style={styles.updateBadgeText}>{item.updateType}</Text>
      </Box>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Güncellenen Etkinlikler</Text>
      </View>
      
      <FlatList
        data={updatedEvents}
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 16,
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
    borderLeftColor: "#e67e22",
    position: "relative",
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
  updateBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#e67e22",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  updateBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
}); 