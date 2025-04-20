import React, { useState } from "react";
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
import { 
  ChevronLeft, 
  User, 
  Check, 
  X, 
  Clock,
  AlertCircle
} from "lucide-react-native";

// Arkadaşlık isteği arayüzü
interface FriendRequest {
  id: number;
  name: string;
  username: string;
  avatar: string;
  mutualFriends: number;
  time: string;
  status?: "pending" | "accepted" | "rejected";
}

// Örnek arkadaşlık istekleri verisi
const FRIEND_REQUESTS: FriendRequest[] = [
  {
    id: 1,
    name: "Zeynep Şahin",
    username: "zeynepshn",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    mutualFriends: 3,
    time: "2 saat önce",
    status: "pending"
  },
  {
    id: 2,
    name: "Mehmet Yılmaz",
    username: "mehmetyilmaz",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    mutualFriends: 5,
    time: "1 gün önce",
    status: "pending"
  },
  {
    id: 3,
    name: "Ayşe Kaya",
    username: "aysekaya",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    mutualFriends: 2,
    time: "2 gün önce",
    status: "pending"
  },
  {
    id: 4,
    name: "Can Demir",
    username: "candemir",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    mutualFriends: 8,
    time: "3 gün önce",
    status: "pending"
  },
  {
    id: 5,
    name: "Elif Yıldız",
    username: "elifyildiz",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    mutualFriends: 1,
    time: "5 gün önce",
    status: "pending"
  }
];

export default function FriendRequestsScreen() {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(FRIEND_REQUESTS);

  const handleBackPress = () => {
    router.back();
  };

  const handleViewProfile = (userId: number) => {
    router.push({
      pathname: "/(tabs)/profile",
      params: { id: userId }
    });
  };

  const handleAcceptRequest = (id: number) => {
    // Burada normalde bir API isteği yapılır
    // Artık listeden kaldırmak yerine durumu güncelliyoruz
    setFriendRequests(prev => 
      prev.map(request => 
        request.id === id 
          ? { ...request, status: "accepted" } 
          : request
      )
    );
  };

  const handleRejectRequest = (id: number) => {
    // Burada normalde bir API isteği yapılır
    // Artık listeden kaldırmak yerine durumu güncelliyoruz
    setFriendRequests(prev => 
      prev.map(request => 
        request.id === id 
          ? { ...request, status: "rejected" } 
          : request
      )
    );
  };

  const renderFriendRequestItem = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestItem}>
      <TouchableOpacity 
        style={styles.profileSection}
        onPress={() => handleViewProfile(item.id)}
      >
        <Image 
          source={{ uri: item.avatar }} 
          style={styles.avatar} 
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.username}>@{item.username}</Text>
          {item.mutualFriends > 0 && (
            <Text style={styles.mutualFriends}>
              {item.mutualFriends} ortak arkadaş
            </Text>
          )}
          <View style={styles.timeContainer}>
            <Clock size={12} color="#95a5a6" />
            <Text style={styles.time}>{item.time}</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {item.status === "accepted" ? (
        <View style={styles.statusContainer}>
          <Check size={18} color="#2ecc71" />
          <Text style={styles.acceptedText}>Kabul edildi</Text>
        </View>
      ) : item.status === "rejected" ? (
        <View style={styles.statusContainer}>
          <X size={18} color="#e74c3c" />
          <Text style={styles.rejectedText}>Reddedildi</Text>
        </View>
      ) : (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAcceptRequest(item.id)}
          >
            <Check size={18} color="#fff" />
            <Text style={styles.acceptButtonText}>Kabul Et</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectRequest(item.id)}
          >
            <X size={18} color="#666" />
            <Text style={styles.rejectButtonText}>Reddet</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Arkadaşlık İstekleri</Text>
      </View>
      
      {friendRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <User size={64} color="#d5d5d5" />
          <Text style={styles.emptyText}>Arkadaşlık İsteği Yok</Text>
          <Text style={styles.emptySubText}>
            Şu anda bekleyen arkadaşlık isteği bulunmuyor.
          </Text>
        </View>
      ) : (
        <FlatList
          data={friendRequests}
          renderItem={renderFriendRequestItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
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
  listContent: {
    padding: 16,
  },
  requestItem: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileSection: {
    flexDirection: "row",
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  username: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  mutualFriends: {
    fontSize: 13,
    color: "#3498db",
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    fontSize: 12,
    color: "#95a5a6",
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  acceptButton: {
    backgroundColor: "#2ecc71",
  },
  rejectButton: {
    backgroundColor: "#f1f1f1",
  },
  acceptButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
  rejectButtonText: {
    color: "#666",
    fontWeight: "600",
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#95a5a6",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#bdc3c7",
    textAlign: "center",
    paddingHorizontal: 32,
    marginTop: 8,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    marginTop: 8
  },
  acceptedText: {
    color: "#2ecc71",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16
  },
  rejectedText: {
    color: "#e74c3c",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16
  },
}); 