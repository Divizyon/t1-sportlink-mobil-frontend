import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { Calendar, Clock, MapPin, Users, ChevronLeft } from "lucide-react-native";
import { UPCOMING_EVENTS } from "@/mocks/events";
import { Event } from "@/types/app";

export default function UpcomingEventsScreen() {
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('tr-TR', options);
  };

  const handleEventPress = (eventId: number) => {
    router.push({
      pathname: "/event-detail/[id]",
      params: { id: eventId }
    });
  };

  const handleBackPress = () => {
    router.back();
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      style={styles.eventItem}
      onPress={() => handleEventPress(item.id)}
    >
      <View style={styles.eventImageContainer}>
        <Image 
          source={item.image} 
          style={styles.eventImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.eventContent}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Calendar size={16} color="#3498db" />
            <Text style={styles.eventInfo}>{formatDate(item.date)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Clock size={16} color="#3498db" />
            <Text style={styles.eventInfo}>{item.time} - {item.endTime}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <MapPin size={16} color="#3498db" />
            <Text style={styles.eventInfo}>{item.location}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Users size={16} color="#3498db" />
            <Text style={styles.eventInfo}>{item.participants}/{item.maxParticipants} Katılımcı</Text>
          </View>
        </View>
        
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yaklaşan Etkinlikler</Text>
      </View>
      
      <FlatList
        data={UPCOMING_EVENTS}
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
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventImageContainer: {
    width: "100%",
    height: 160,
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  infoContainer: {
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventInfo: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  categoryBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#3498db",
    borderRadius: 20,
  },
  categoryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
}); 