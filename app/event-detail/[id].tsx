import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  ChevronLeft,
  Bell,
  Share2,
  Info,
} from "lucide-react-native";

// Example event type
interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  image?: string;
  participants: number;
  organizerName: string;
  status: "active" | "cancelled" | "completed";
}

// Örnek etkinlik verisi
const mockEventData: Record<string, Event> = {
  "1": {
    id: 1,
    title: "Basketbol Maçı",
    description:
      "Haftalık basketbol maçı etkinliği. Herkesin katılımını bekliyoruz!",
    location: "Ankara Spor Salonu",
    date: "12 Ağustos 2023",
    time: "15:00 - 17:00",
    image:
      "https://images.unsplash.com/photo-1546519638-68e109acd27d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1780&q=80",
    participants: 12,
    organizerName: "Mehmet Aydın",
    status: "active",
  },
  "2": {
    id: 2,
    title: "Futbol Turnuvası",
    description:
      "Arkadaşlar arasında futbol turnuvası. Takımlar önceden belirlenecek.",
    location: "İstanbul Park Sahası",
    date: "15 Ağustos 2023",
    time: "10:00 - 13:00",
    image:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    participants: 22,
    organizerName: "Ali Yılmaz",
    status: "active",
  },
  "3": {
    id: 3,
    title: "Yüzme Etkinliği",
    description:
      "Havuz başında eğlenceli bir gün geçirmek için organize edilen yüzme etkinliği.",
    location: "İzmir Olimpik Havuz",
    date: "20 Ağustos 2023",
    time: "14:00 - 16:00",
    image:
      "https://images.unsplash.com/photo-1560090995-01632a28895b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80",
    participants: 8,
    organizerName: "Zeynep Kaya",
    status: "active",
  },
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [reminderSet, setReminderSet] = useState(true); // Varsayılan olarak hatırlatıcı ayarlanmış

  useEffect(() => {
    // Gerçek uygulamada burada API isteği yapılır
    if (id) {
      // Mock veri kullanıyoruz
      setTimeout(() => {
        setEvent(mockEventData[id] || null);
        setLoading(false);
      }, 1000);
    }
  }, [id]);

  const handleToggleReminder = () => {
    setReminderSet((prev) => !prev);
    // Gerçek uygulamada, burada hatırlatıcı ayarı için API çağrısı yapılır
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Etkinlik bilgileri yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <StatusBar style="dark" />
        <AlertCircle size={60} color="#e74c3c" />
        <Text style={styles.errorText}>Etkinlik bulunamadı</Text>
        <Button style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Etkinlik Detayı</Text>
        <TouchableOpacity style={styles.shareIcon}>
          <Share2 size={20} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Etkinlik Görseli */}
          {event.image && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: event.image }}
                style={styles.eventImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay} />
              <View style={styles.reminderBadge}>
                <Bell size={14} color={reminderSet ? "#fff" : "#666"} />
                <Text style={styles.reminderBadgeText}>
                  {reminderSet ? "Hatırlatılacak" : "Hatırlatıcı Yok"}
                </Text>
              </View>
            </View>
          )}

          {/* Etkinlik Bilgileri */}
          <View style={styles.contentContainer}>
            <Text style={styles.eventTitle}>{event.title}</Text>

            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Calendar size={20} color="#3498db" />
                <Text style={styles.infoText}>{event.date}</Text>
              </View>

              <View style={styles.infoItem}>
                <Clock size={20} color="#3498db" />
                <Text style={styles.infoText}>{event.time}</Text>
              </View>

              <View style={styles.infoItem}>
                <MapPin size={20} color="#3498db" />
                <Text style={styles.infoText}>{event.location}</Text>
              </View>

              <View style={styles.infoItem}>
                <Users size={20} color="#3498db" />
                <Text style={styles.infoText}>
                  {event.participants} Katılımcı
                </Text>
              </View>
            </View>

            <View style={styles.descriptionContainer}>
              <Text style={styles.sectionTitle}>Etkinlik Açıklaması</Text>
              <Text style={styles.descriptionText}>{event.description}</Text>
            </View>

            <View style={styles.organizerContainer}>
              <Text style={styles.sectionTitle}>Organizatör</Text>
              <View style={styles.organizerInfo}>
                <View style={styles.organizerAvatar}>
                  <Text style={styles.organizerInitial}>
                    {event.organizerName.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.organizerName}>{event.organizerName}</Text>
              </View>
            </View>

            <View style={styles.reminderSection}>
              <Text style={styles.sectionTitle}>Hatırlatıcı Durumu</Text>
              <View style={styles.reminderInfo}>
                <Info size={18} color="#666" />
                <Text style={styles.reminderInfoText}>
                  Bu etkinlik için bir hatırlatıcı
                  {reminderSet ? " ayarlanmış" : " ayarlanmamış"}.
                </Text>
              </View>
            </View>
          </View>

          {/* En az 50px boşluk bırak */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </View>

      {/* Alt Butonlar - SafeAreaView'in dışında sabit pozisyonda */}
      <View style={styles.absoluteFooter}>
        <TouchableOpacity
          style={[
            styles.reminderButton,
            reminderSet
              ? styles.reminderActiveButton
              : styles.reminderInactiveButton,
          ]}
          onPress={handleToggleReminder}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <Bell size={20} color={reminderSet ? "#fff" : "#333"} />
            <Text
              style={[
                styles.reminderButtonText,
                reminderSet
                  ? styles.reminderActiveText
                  : styles.reminderInactiveText,
              ]}
            >
              {reminderSet ? "Hatırlatıcıyı Kapat" : "Hatırlatıcı Ayarla"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#e74c3c",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
  },
  backButtonText: {
    fontWeight: "600",
    color: "#333",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  backIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  shareIcon: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 220,
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  reminderBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3498db",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  reminderBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  contentContainer: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoSection: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 15,
    color: "#333",
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#555",
  },
  organizerContainer: {
    marginBottom: 24,
  },
  organizerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  organizerInitial: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  organizerName: {
    fontSize: 16,
    fontWeight: "600",
  },
  reminderSection: {
    marginBottom: 24,
  },
  reminderInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 12,
  },
  reminderInfoText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#555",
  },
  absoluteFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f1f1f1",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reminderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  reminderActiveButton: {
    backgroundColor: "#3498db",
  },
  reminderInactiveButton: {
    backgroundColor: "#f1f1f1",
  },
  reminderButtonText: {
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 16,
  },
  reminderActiveText: {
    color: "#fff",
  },
  reminderInactiveText: {
    color: "#333",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});
