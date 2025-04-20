import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { 
  ChevronLeft, 
  MessageCircle, 
  Search,
  Circle,
  Clock,
  MoreVertical,
} from "lucide-react-native";

// Mesaj arayüzü
interface Message {
  id: number;
  senderId: number;
  senderName: string;
  senderAvatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
}

// Örnek mesaj verileri
const MESSAGES: Message[] = [
  {
    id: 1,
    senderId: 101,
    senderName: "Ahmet Yılmaz",
    senderAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    lastMessage: "Merhaba, yarın basketbol maçına katılacak mısın?",
    time: "10 dk önce",
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: 2,
    senderId: 102,
    senderName: "Zeynep Kaya",
    senderAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    lastMessage: "Voleybol antrenmanına bekliyoruz. Unutma!",
    time: "30 dk önce",
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: 3,
    senderId: 103,
    senderName: "Mehmet Öztürk",
    senderAvatar: "https://randomuser.me/api/portraits/men/68.jpg",
    lastMessage: "Futbol turnuvası için takım oluşturuyorum. İlgilenir misin?",
    time: "2 saat önce",
    unreadCount: 1,
    isOnline: false,
  },
  {
    id: 4,
    senderId: 104,
    senderName: "Ayşe Demir",
    senderAvatar: "https://randomuser.me/api/portraits/women/65.jpg",
    lastMessage: "Yüzme etkinliğinin yeri değişti, haberiniz olsun.",
    time: "Dün",
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: 5,
    senderId: 105,
    senderName: "Can Yıldız",
    senderAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
    lastMessage: "Geçen haftaki tenis maçı çok güzeldi, tekrar ne zaman oynayalım?",
    time: "2 gün önce",
    unreadCount: 0,
    isOnline: true,
  },
  {
    id: 6,
    senderId: 106,
    senderName: "Selin Arslan",
    senderAvatar: "https://randomuser.me/api/portraits/women/90.jpg",
    lastMessage: "Bisiklet turu için hazırlıklar tamam mı?",
    time: "1 hafta önce",
    unreadCount: 0,
    isOnline: false,
  },
];

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleBackPress = () => {
    router.back();
  };

  const handleMessagePress = (messageId: number, senderId: number) => {
    // Gerçek uygulamada okunmamış mesaj sayısını sıfırla
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, unreadCount: 0 } 
          : msg
      )
    );
    
    // Mesaj detay sayfasına yönlendir
    // @ts-ignore - Expo Router tip sorununu geçici olarak görmezden geliyoruz
    router.push(`/chat/${senderId}`);
  };

  const filteredMessages = searchQuery
    ? messages.filter(message => 
        message.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const renderMessageItem = ({ item }: { item: Message }) => (
    <TouchableOpacity 
      style={[styles.messageItem, item.unreadCount > 0 && styles.unreadItem]}
      onPress={() => handleMessagePress(item.id, item.senderId)}
    >
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: item.senderAvatar }} 
          style={styles.avatar} 
        />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.senderName}>{item.senderName}</Text>
          <View style={styles.timeContainer}>
            <Clock size={12} color="#95a5a6" />
            <Text style={styles.messageTime}>{item.time}</Text>
          </View>
        </View>
        
        <Text 
          style={[styles.messageText, item.unreadCount > 0 && styles.unreadText]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.lastMessage}
        </Text>
      </View>
      
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mesajlar</Text>
        <TouchableOpacity style={styles.optionsButton}>
          <MoreVertical size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={18} color="#95a5a6" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Mesajlarda ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      
      {filteredMessages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MessageCircle size={64} color="#d5d5d5" />
          <Text style={styles.emptyText}>Mesaj Bulunamadı</Text>
          <Text style={styles.emptySubText}>
            {searchQuery 
              ? "Arama kriterlerine uygun mesaj bulunamadı."
              : "Henüz mesajınız bulunmuyor."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMessages}
          renderItem={renderMessageItem}
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  optionsButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    padding: 0,
  },
  listContent: {
    padding: 16,
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  unreadItem: {
    backgroundColor: "#f5faff",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#2ecc71",
    borderWidth: 2,
    borderColor: "#fff",
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  senderName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  messageTime: {
    fontSize: 12,
    color: "#95a5a6",
    marginLeft: 4,
  },
  messageText: {
    fontSize: 14,
    color: "#666",
  },
  unreadText: {
    color: "#333",
    fontWeight: "500",
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  unreadCount: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
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
}); 