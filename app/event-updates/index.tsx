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
import { Calendar, Clock, ChevronLeft, AlertCircle, X, MapPin, Filter } from "lucide-react-native";
import { ALL_EVENTS } from "@/mocks/events";
import { Event } from "@/types/app";

// Örnek olarak güncellenen etkinlikler
// Gerçek uygulamada bu veri API'dan gelecektir
const UPDATED_EVENTS = ALL_EVENTS.filter((_, index) => index % 3 === 0).map((event, index) => ({
  ...event,
  updateType: index % 2 === 0 ? "Tarih Değişikliği" : "Konum Değişikliği",
  updateTime: "2 gün önce",
  status: "updated" as EventStatus
}));

// Örnek olarak iptal edilen etkinlikler
const CANCELLED_EVENTS = ALL_EVENTS.filter((_, index) => index % 5 === 0 && index % 3 !== 0).map((event) => ({
  ...event,
  updateType: "Etkinlik İptali",
  updateTime: "3 gün önce",
  status: "cancelled" as EventStatus,
  cancelReason: "Yetersiz katılımcı sayısı nedeniyle iptal edildi."
}));

// Tüm etkinlik değişikliklerini birleştir
const ALL_EVENT_CHANGES = [...UPDATED_EVENTS, ...CANCELLED_EVENTS];

// Filtre seçenekleri
const FILTER_OPTIONS = [
  { key: "all", label: "Tümü" },
  { key: "updated", label: "Güncellenen" },
  { key: "cancelled", label: "İptal Edilen" }
];

type EventStatus = "updated" | "cancelled";
type EventChange = Event & { 
  updateType: string, 
  updateTime: string, 
  status: EventStatus,
  cancelReason?: string 
};

export default function EventUpdatesScreen() {
  const [activeFilter, setActiveFilter] = useState<"all" | "updated" | "cancelled">("all");

  const handleBackPress = () => {
    router.back();
  };

  const handleEventPress = (eventId: number) => {
    router.push({
      pathname: "/(tabs)/reminders/[id]",
      params: { id: eventId }
    });
  };

  const handleFilterChange = (filter: "all" | "updated" | "cancelled") => {
    setActiveFilter(filter);
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    return date.toLocaleDateString('tr-TR', options);
  };

  // Filtrelemeye göre etkinlikleri getir
  const getFilteredEvents = () => {
    if (activeFilter === "all") return ALL_EVENT_CHANGES;
    return ALL_EVENT_CHANGES.filter(event => event.status === activeFilter);
  };

  const renderEventItem = ({ item }: { item: EventChange }) => (
    <TouchableOpacity 
      style={[
        styles.eventItem,
        item.status === "updated" ? styles.updatedEventItem : styles.cancelledEventItem
      ]}
      onPress={() => handleEventPress(item.id)}
    >
      <View style={[
        styles.updateBadge,
        item.status === "cancelled" ? styles.cancelledBadge : styles.updatedBadge
      ]}>
        {item.status === "updated" ? 
          <AlertCircle size={12} color="#fff" /> : 
          <X size={12} color="#fff" />
        }
        <Text style={styles.updateBadgeText}>{item.updateType}</Text>
      </View>
      
      <Text style={styles.eventTitle}>{item.title}</Text>
      
      <View style={styles.eventDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color="#666" />
          <Text style={styles.detailText}>{formatDate(item.date)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Clock size={16} color="#666" />
          <Text style={styles.detailText}>{item.time} - {item.endTime}</Text>
        </View>

        <View style={styles.detailRow}>
          <MapPin size={16} color="#666" />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
      </View>
      
      {item.status === "cancelled" && item.cancelReason && (
        <View style={styles.cancelReasonContainer}>
          <Text style={styles.cancelReasonText}>{item.cancelReason}</Text>
        </View>
      )}
      
      <Text style={styles.updateTime}>Güncelleme: {item.updateTime}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Etkinlik Değişiklikleri</Text>
      </View>
      
      {/* Filtre Seçenekleri */}
      <View style={styles.filterContainer}>
        <Filter size={16} color="#666" style={styles.filterIcon} />
        <View style={styles.filterOptions}>
          {FILTER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterOption,
                activeFilter === option.key && styles.activeFilterOption
              ]}
              onPress={() => handleFilterChange(option.key as "all" | "updated" | "cancelled")}
            >
              <Text 
                style={[
                  styles.filterOptionText,
                  activeFilter === option.key && styles.activeFilterOptionText
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {getFilteredEvents().length > 0 ? (
        <FlatList
          data={getFilteredEvents()}
          renderItem={renderEventItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <AlertCircle size={48} color="#ccc" />
          <Text style={styles.emptyText}>
            {activeFilter === "all" 
              ? "Hiç etkinlik değişikliği bulunmuyor" 
              : activeFilter === "updated" 
                ? "Hiç güncellenen etkinlik bulunmuyor" 
                : "Hiç iptal edilen etkinlik bulunmuyor"}
          </Text>
        </View>
      )}
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
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterIcon: {
    marginRight: 8,
  },
  filterOptions: {
    flexDirection: "row",
    flex: 1,
  },
  filterOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#f5f5f5",
  },
  activeFilterOption: {
    backgroundColor: "#3498db",
  },
  filterOptionText: {
    fontSize: 14,
    color: "#666",
  },
  activeFilterOptionText: {
    color: "#fff",
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
  },
  eventItem: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
  },
  updatedEventItem: {
    borderLeftColor: "#f39c12",
  },
  cancelledEventItem: {
    borderLeftColor: "#e74c3c",
  },
  updateBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  updatedBadge: {
    backgroundColor: "#f39c12",
  },
  cancelledBadge: {
    backgroundColor: "#e74c3c",
  },
  updateBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  eventDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
    color: "#666",
  },
  cancelReasonContainer: {
    backgroundColor: "#ffecec",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  cancelReasonText: {
    fontSize: 14,
    color: "#e74c3c",
    fontStyle: "italic",
  },
  updateTime: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    marginTop: 12,
    textAlign: "center",
  },
}); 