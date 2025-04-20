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
import { MessageCircle, Clock } from "lucide-react-native";

// Message interface
interface Message {
  id: number;
  senderName: string;
  senderAvatar: string;
  content: string;
  time: string;
  isRead: boolean;
}

// Example message data
const mockMessages: Message[] = [
  {
    id: 1,
    senderName: "Ahmet Yılmaz",
    senderAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    content: "Merhaba, bugünkü basketbol antrenmanına gelecek misin?",
    time: "10:30",
    isRead: false,
  },
  {
    id: 2,
    senderName: "Zeynep Kaya",
    senderAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    content: "Koşu etkinliği için kayıt oldun mu?",
    time: "Dün",
    isRead: true,
  },
  {
    id: 3,
    senderName: "Mehmet Demir",
    senderAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
    content: "Geçen haftaki maç hakkında konuşabilir miyiz?",
    time: "2 gün önce",
    isRead: true,
  },
  {
    id: 4,
    senderName: "Ayşe Yıldız",
    senderAvatar: "https://randomuser.me/api/portraits/women/26.jpg",
    content: "Yeni paylaştığın fotoğraflar harika görünüyor!",
    time: "3 gün önce",
    isRead: true,
  },
  {
    id: 5,
    senderName: "Murat Öztürk",
    senderAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
    content: "Etkinlik takvimini güncelledin mi?",
    time: "5 gün önce",
    isRead: true,
  },
];

export default function MessagesScreen() {
  const [messages] = useState<Message[]>(mockMessages);

  const handleMessagePress = (messageId: number) => {
    router.navigate(`/messages/${messageId}`);
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <TouchableOpacity 
      style={[styles.messageItem, !item.isRead && styles.unreadItem]}
      onPress={() => handleMessagePress(item.id)}
    >
      <Image source={{ uri: item.senderAvatar }} style={styles.avatar} />
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.senderName}>{item.senderName}</Text>
          <View style={styles.timeContainer}>
            <Clock size={12} color="#95a5a6" />
            <Text style={styles.time}>{item.time}</Text>
          </View>
        </View>
        <Text 
          style={[styles.messageContent, !item.isRead && styles.unreadContent]}
          numberOfLines={1}
        >
          {item.content}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mesajlarım</Text>
      </View>
      
      <FlatList
        data={messages}
        renderItem={renderMessageItem}
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
  messageItem: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  unreadItem: {
    backgroundColor: "#f5faff",
    borderLeftWidth: 4,
    borderLeftColor: "#3498db",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  senderName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
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
  messageContent: {
    fontSize: 14,
    color: "#666",
  },
  unreadContent: {
    color: "#333",
    fontWeight: "500",
  },
}); 