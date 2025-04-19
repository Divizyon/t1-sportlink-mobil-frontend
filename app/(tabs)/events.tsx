import React, { useState } from "react";
import {
  View,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Text } from "@/components/ui/text";
import { Box } from "@/components/ui/box";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { router } from "expo-router";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  UserCheck,
  CheckCircle,
} from "lucide-react-native";

// Event tipi tanımlama
interface Event {
  id: number;
  title: string;
  type: string;
  category: string;
  date: string;
  time: string;
  location: string;
  distance: string;
  participants: number;
  maxParticipants: number;
  organizer: string;
  isJoined: boolean;
}

// Örnek veri
const eventsData: Event[] = [
  {
    id: 1,
    title: "Basketbol Maçı",
    type: "Spor",
    category: "Basketbol",
    date: "23 Ekim",
    time: "11:00-13:00",
    location: "Konya Basket Sahası",
    distance: "1.2 km",
    participants: 10,
    maxParticipants: 12,
    organizer: "Konya Spor Kulübü",
    isJoined: true,
  },
  {
    id: 2,
    title: "Futbol Turnuvası",
    type: "Buluşma",
    category: "Futbol",
    date: "25 Ekim",
    time: "14:00-17:00",
    location: "Meram Futbol Sahası",
    distance: "2.5 km",
    participants: 18,
    maxParticipants: 22,
    organizer: "Meram Spor",
    isJoined: true,
  },
  {
    id: 3,
    title: "Yüzme Etkinliği",
    type: "Kurs",
    category: "Yüzme",
    date: "28 Ekim",
    time: "15:00-16:30",
    location: "Selçuklu Olimpik Havuz",
    distance: "3.7 km",
    participants: 8,
    maxParticipants: 12,
    organizer: "Yüzme Kulübü",
    isJoined: false,
  },
  {
    id: 4,
    title: "Tenis Turnuvası",
    type: "Yarışma",
    category: "Tenis",
    date: "30 Ekim",
    time: "10:00-16:00",
    location: "Konya Tenis Kulübü",
    distance: "4.1 km",
    participants: 12,
    maxParticipants: 16,
    organizer: "Tenis Akademi",
    isJoined: false,
  },
  {
    id: 5,
    title: "Voleybol Antrenmanı",
    type: "Antrenman",
    category: "Voleybol",
    date: "1 Kasım",
    time: "19:00-21:00",
    location: "Selçuklu Spor Salonu",
    distance: "2.8 km",
    participants: 14,
    maxParticipants: 16,
    organizer: "Konya Voleybol Derneği",
    isJoined: true,
  },
];

export default function EventsScreen() {
  const [activeTab, setActiveTab] = useState<string>("joined"); // 'joined', 'past', 'upcoming', 'created'
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(
    eventsData.filter((event) => event.isJoined)
  );

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    switch (tab) {
      case "joined":
        setFilteredEvents(eventsData.filter((event) => event.isJoined));
        break;
      case "past":
        // Gerçek uygulamada geçmiş etkinlikleri filtreleyecek
        setFilteredEvents(eventsData.slice(0, 2));
        break;
      case "upcoming":
        // Gerçek uygulamada gelecek etkinlikleri filtreleyecek
        setFilteredEvents(eventsData.slice(2, 4));
        break;
      case "created":
        // Gerçek uygulamada kullanıcının oluşturduğu etkinlikleri filtreleyecek
        setFilteredEvents([eventsData[4]]);
        break;
      default:
        setFilteredEvents(eventsData);
    }
  };

  const handleEventPress = (eventId: number) => {
    router.push(`/dashboard/event-details?id=${eventId}`);
  };

  const renderEvent = ({ item }: { item: Event }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEventPress(item.id)}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={[
            styles.categoryIndicator,
            { backgroundColor: getCategoryColor(item.category) },
          ]}
        />

        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={styles.eventTitle}>{item.title}</Text>

          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
          >
            <Calendar size={16} color="#666" />
            <Text style={styles.eventDetail}>{item.date}</Text>
            <Clock size={16} color="#666" style={{ marginLeft: 8 }} />
            <Text style={styles.eventDetail}>{item.time}</Text>
          </View>

          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
          >
            <MapPin size={16} color="#666" />
            <Text style={styles.eventDetail}>{item.location}</Text>
            <Text style={styles.distance}>{item.distance}</Text>
          </View>

          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
          >
            <Users size={16} color="#666" />
            <Text style={styles.eventDetail}>
              {item.participants}/{item.maxParticipants} Katılımcı
            </Text>
            {item.isJoined && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: 8,
                }}
              >
                <UserCheck size={16} color="#2ecc71" />
                <Text style={styles.joined}>Katılıyorsun</Text>
              </View>
            )}
          </View>

          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
          >
            <Text style={styles.organizer}>Organizatör: {item.organizer}</Text>
            <CheckCircle size={14} color="#3498db" style={{ marginLeft: 4 }} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Basketbol: "#e74c3c",
      Futbol: "#2ecc71",
      Yüzme: "#3498db",
      Tenis: "#f39c12",
      Voleybol: "#9b59b6",
    };

    return colors[category] || "#95a5a6";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <Text style={styles.title}>Etkinliklerim</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "joined" && styles.activeTab]}
            onPress={() => handleTabChange("joined")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "joined" && styles.activeTabText,
              ]}
            >
              Katıldığım
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "past" && styles.activeTab]}
            onPress={() => handleTabChange("past")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "past" && styles.activeTabText,
              ]}
            >
              Geçmiş
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
            onPress={() => handleTabChange("upcoming")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "upcoming" && styles.activeTabText,
              ]}
            >
              Yaklaşan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "created" && styles.activeTab]}
            onPress={() => handleTabChange("created")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "created" && styles.activeTabText,
              ]}
            >
              Oluşturduğum
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredEvents}
        renderItem={renderEvent}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#2ecc71",
  },
  tabText: {
    color: "#95a5a6",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#2ecc71",
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  categoryIndicator: {
    width: 8,
    height: "85%",
    borderRadius: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  eventDetail: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  distance: {
    fontSize: 14,
    color: "#3498db",
    marginLeft: 8,
  },
  organizer: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  joined: {
    fontSize: 14,
    color: "#2ecc71",
    fontWeight: "500",
    marginLeft: 4,
  },
});
