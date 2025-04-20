import React, { useState } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, router } from "expo-router";
import { Text } from "@/components/ui/text";
import { ChevronLeft, Send } from "lucide-react-native";

// Mesaj tipi tanımlama
interface MessageItem {
  id: number;
  text: string;
  time: string;
  isIncoming: boolean;
}

// Kullanıcı tipi tanımlama
interface User {
  id: number;
  name: string;
  avatar: string;
}

// Örnek kullanıcı verileri
const mockUsers: Record<string, User> = {
  "1": {
    id: 1,
    name: "Ahmet Yılmaz",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  "2": {
    id: 2,
    name: "Zeynep Kaya",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  "3": {
    id: 3,
    name: "Mehmet Demir",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  "4": {
    id: 4,
    name: "Ayşe Yıldız",
    avatar: "https://randomuser.me/api/portraits/women/26.jpg",
  },
  "5": {
    id: 5,
    name: "Murat Öztürk",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
};

// Örnek mesaj konuşmaları
const generateConversation = (userId: number): MessageItem[] => {
  switch (userId) {
    case 1:
      return [
        {
          id: 1,
          text: "Merhaba, bugünkü basketbol antrenmanına gelecek misin?",
          time: "10:30",
          isIncoming: true,
        },
        {
          id: 2,
          text: "Evet, gelirim. Saat kaçta başlıyor?",
          time: "10:35",
          isIncoming: false,
        },
        {
          id: 3,
          text: "18:00'da başlıyor. Erken gelirsen ısınma yapabiliriz.",
          time: "10:40",
          isIncoming: true,
        },
      ];
    case 2:
      return [
        {
          id: 1,
          text: "Koşu etkinliği için kayıt oldun mu?",
          time: "Dün",
          isIncoming: true,
        },
        {
          id: 2,
          text: "Henüz kayıt olmadım. Son kayıt tarihi ne zaman?",
          time: "Dün",
          isIncoming: false,
        },
      ];
    default:
      return [
        {
          id: 1,
          text: "Merhaba, nasılsın?",
          time: "12:00",
          isIncoming: true,
        },
      ];
  }
};

export default function MessageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const userId = id ? parseInt(id as string) : 0;
  
  const [user, setUser] = useState<User | null>(
    userId && mockUsers[userId.toString()] 
      ? mockUsers[userId.toString()] 
      : null
  );
  
  const [messages, setMessages] = useState<MessageItem[]>(
    userId ? generateConversation(userId) : []
  );
  
  const handleBackPress = () => {
    router.back();
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <ChevronLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mesaj</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Kullanıcı bulunamadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.userName}>{user.name}</Text>
        </View>
      </View>
      
      <ScrollView style={styles.messagesContainer}>
        {messages.map(message => (
          <View 
            key={message.id}
            style={[
              styles.messageBubble,
              message.isIncoming ? styles.incomingMessage : styles.outgoingMessage
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
            <Text style={styles.messageTime}>{message.time}</Text>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.textInput}
          placeholder="Mesaj yazın..."
        />
        <TouchableOpacity style={styles.sendButton}>
          <Send size={20} color="#fff" />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#95a5a6",
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  incomingMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f0f0f0",
    borderBottomLeftRadius: 4,
  },
  outgoingMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#3498db",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#333",
  },
  messageTime: {
    fontSize: 12,
    color: "#95a5a6",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
  },
}); 