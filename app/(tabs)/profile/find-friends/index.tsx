import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import {
  MapPin,
  MessageCircle,
  Search,
  ArrowLeft,
  UserPlus,
  CheckCircle,
  X,
} from "lucide-react-native";
import { router } from "expo-router";

// Kullanıcı tipi tanımlama
interface User {
  id: number;
  name: string;
  age: number;
  location: string;
  distance: number;
  sportsInterested: string[];
  avatarUrl: string;
  isOnline: boolean;
}

// Spor kategorisi tipi tanımlama
interface SportCategory {
  id: string;
  name: string;
  icon: string; // Bu bir icon adı veya URL olabilir
}

// Örnek kullanıcı verileri
const usersData: User[] = [
  {
    id: 1,
    name: "Ahmet Yılmaz",
    age: 28,
    location: "Kadıköy, İstanbul",
    distance: 2.3,
    sportsInterested: ["Futbol", "Basketbol", "Koşu"],
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    isOnline: true,
  },
  {
    id: 2,
    name: "Zeynep Kaya",
    age: 25,
    location: "Beşiktaş, İstanbul",
    distance: 3.7,
    sportsInterested: ["Tenis", "Yüzme", "Pilates"],
    avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    isOnline: false,
  },
  {
    id: 3,
    name: "Burak Demir",
    age: 32,
    location: "Ataşehir, İstanbul",
    distance: 5.1,
    sportsInterested: ["Fitness", "Yoga", "Bisiklet"],
    avatarUrl: "https://randomuser.me/api/portraits/men/67.jpg",
    isOnline: true,
  },
  {
    id: 4,
    name: "Elif Şahin",
    age: 27,
    location: "Üsküdar, İstanbul",
    distance: 4.2,
    sportsInterested: ["Pilates", "Koşu", "Dağ Yürüyüşü"],
    avatarUrl: "https://randomuser.me/api/portraits/women/28.jpg",
    isOnline: true,
  },
  {
    id: 5,
    name: "Mert Öztürk",
    age: 30,
    location: "Şişli, İstanbul",
    distance: 6.8,
    sportsInterested: ["Basketbol", "Futbol", "Fitness"],
    avatarUrl: "https://randomuser.me/api/portraits/men/22.jpg",
    isOnline: false,
  },
];

// Spor Kategorileri
const sportsCategories: SportCategory[] = [
  { id: "1", name: "Futbol", icon: "⚽" },
  { id: "2", name: "Basketbol", icon: "🏀" },
  { id: "3", name: "Tenis", icon: "🎾" },
  { id: "4", name: "Yüzme", icon: "🏊‍♂️" },
  { id: "5", name: "Koşu", icon: "🏃‍♂️" },
  { id: "6", name: "Bisiklet", icon: "🚴‍♂️" },
  { id: "7", name: "Fitness", icon: "💪" },
  { id: "8", name: "Yoga", icon: "🧘‍♀️" },
  { id: "9", name: "Pilates", icon: "🤸‍♀️" },
  { id: "10", name: "Dağ Yürüyüşü", icon: "🥾" },
];

export default function FindFriendsScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>(usersData);
  const [pendingRequests, setPendingRequests] = useState<number[]>([]);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, selectedCategories]);

  const filterUsers = () => {
    let result = usersData;

    // Arama sorgusuna göre filtrele
    if (searchQuery.trim() !== "") {
      result = result.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Seçili kategorilere göre filtrele
    if (selectedCategories.length > 0) {
      result = result.filter((user) =>
        user.sportsInterested.some((sport) =>
          selectedCategories.includes(sport)
        )
      );
    }

    setFilteredUsers(result);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userAvatarContainer}>
          <Image source={{ uri: item.avatarUrl }} style={styles.userAvatar} />
          {item.isOnline && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MapPin size={14} color="#888" />
            <Text style={styles.userLocation}>
              {item.location} · {item.distance} km
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.userBody}>
        <View style={styles.sportTagsContainer}>
          {item.sportsInterested.map((sport, index) => (
            <View
              key={index}
              style={[
                styles.sportTag,
                selectedCategories.includes(sport) && styles.selectedSportTag,
              ]}
            >
              <Text
                style={[
                  styles.sportTagText,
                  selectedCategories.includes(sport) &&
                    styles.selectedSportTagText,
                ]}
              >
                {sport}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[
            styles.friendRequestButton, 
            pendingRequests.includes(item.id) && styles.requestSentButton
          ]}
          onPress={() => 
            pendingRequests.includes(item.id)
              ? handleCancelRequest(item.id)
              : handleFriendRequest(item.id)
          }
        >
          {pendingRequests.includes(item.id) ? (
            <>
              <X size={16} color="#fff" />
              <Text style={styles.friendRequestButtonText}>İsteği İptal Et</Text>
            </>
          ) : (
            <>
              <UserPlus size={16} color="#fff" />
              <Text style={styles.friendRequestButtonText}>Takip Et</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.messageButton}
          onPress={() => handleSendMessage(item.id)}
        >
          <MessageCircle size={16} color="#fff" />
          <Text style={styles.messageButtonText}>Mesaj Gönder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategoryItem = ({ item }: { item: SportCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategories.includes(item.name) && styles.selectedCategoryItem,
      ]}
      onPress={() => toggleCategory(item.name)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text
        style={[
          styles.categoryName,
          selectedCategories.includes(item.name) && styles.selectedCategoryName,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Add these functions to handle button presses
  const handleFriendRequest = (userId: number) => {
    console.log(`Arkadaşlık isteği gönderildi: ${userId}`);
    setPendingRequests(prev => [...prev, userId]);
    // Friend request logic will be implemented here
  };

  const handleCancelRequest = (userId: number) => {
    console.log(`Arkadaşlık isteği iptal edildi: ${userId}`);
    setPendingRequests(prev => prev.filter(id => id !== userId));
    // Request cancellation logic will be implemented here
  };

  const handleSendMessage = (userId: number) => {
    console.log(`Mesaj gönderilecek: ${userId}`);
    // Message sending logic will be implemented here
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Arkadaş Bul</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#888" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="İsim veya konum ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Spor Kategorileri</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollContent}
        >
          {sportsCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                selectedCategories.includes(category.name) &&
                  styles.selectedCategoryItem,
              ]}
              onPress={() => toggleCategory(category.name)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text
                style={[
                  styles.categoryName,
                  selectedCategories.includes(category.name) &&
                    styles.selectedCategoryName,
                ]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.resultsContainer}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultCount}>
            {filteredUsers.length} kişi bulundu
          </Text>
          <Text style={styles.sortText}>En yakın</Text>
        </View>

        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.usersList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f3f5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  categoriesContainer: {
    padding: 16,
    backgroundColor: "#fff",
    marginTop: 8,
  },
  categoriesScrollContent: {
    paddingVertical: 12,
    paddingRight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  categoryItem: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f1f3f5",
    borderRadius: 20,
    minWidth: 90,
  },
  selectedCategoryItem: {
    backgroundColor: "#4dabf7",
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  selectedCategoryName: {
    color: "#fff",
    fontWeight: "500",
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: 8,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultCount: {
    fontSize: 14,
    color: "#666",
  },
  sortText: {
    fontSize: 14,
    color: "#4dabf7",
    fontWeight: "500",
  },
  usersList: {
    padding: 16,
    paddingTop: 8,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userAvatarContainer: {
    position: "relative",
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineIndicator: {
    position: "absolute",
    width: 12,
    height: 12,
    backgroundColor: "#4cd137",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
    right: 0,
    bottom: 0,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  userBody: {
    marginBottom: 12,
  },
  sportTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  sportTag: {
    backgroundColor: "#f1f3f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedSportTag: {
    backgroundColor: "#e3f2fd",
  },
  sportTagText: {
    fontSize: 12,
    color: "#666",
  },
  selectedSportTagText: {
    color: "#1c7ed6",
    fontWeight: "500",
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  messageButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#4dabf7",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  messageButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
  friendRequestButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#12b886",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  requestSentButton: {
    backgroundColor: "#ff6b6b",
  },
  friendRequestButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
}); 