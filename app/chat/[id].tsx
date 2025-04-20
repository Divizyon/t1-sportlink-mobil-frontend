import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, router } from "expo-router";
import { Text } from "@/components/ui/text";
import { 
  ChevronLeft, 
  Send, 
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Mic
} from "lucide-react-native";

// Mesaj türü arayüzü
interface ChatMessage {
  id: number;
  text: string;
  isSent: boolean; // true: kullanıcı tarafından gönderildi, false: alındı
  timestamp: string;
  isRead: boolean;
}

// Kullanıcı profili arayüzü
interface UserProfile {
  id: number;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
}

// Örnek sohbet kullanıcı profilleri
const CHAT_PROFILES: Record<string, UserProfile> = {
  "101": {
    id: 101,
    name: "Ahmet Yılmaz",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    isOnline: true,
  },
  "102": {
    id: 102,
    name: "Zeynep Kaya",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    isOnline: true,
  },
  "103": {
    id: 103,
    name: "Mehmet Öztürk",
    avatar: "https://randomuser.me/api/portraits/men/68.jpg",
    isOnline: false,
    lastSeen: "2 saat önce",
  },
  "104": {
    id: 104,
    name: "Ayşe Demir",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    isOnline: false,
    lastSeen: "Dün",
  },
  "105": {
    id: 105,
    name: "Can Yıldız",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    isOnline: true,
  },
  "106": {
    id: 106,
    name: "Selin Arslan",
    avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    isOnline: false,
    lastSeen: "3 gün önce",
  },
};

// Örnek sohbet mesajları verileri
const CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  "101": [
    {
      id: 1,
      text: "Merhaba, yarın basketbol maçına katılacak mısın?",
      isSent: false,
      timestamp: "10:30",
      isRead: true,
    },
    {
      id: 2,
      text: "Evet, katılmayı düşünüyorum. Saat kaçta buluşacağız?",
      isSent: true,
      timestamp: "10:32",
      isRead: true,
    },
    {
      id: 3,
      text: "Saat 14:00'te sahada olalım. Başlangıç 14:30.",
      isSent: false,
      timestamp: "10:35",
      isRead: true,
    },
    {
      id: 4,
      text: "Tamam, orada olacağım. Başka kimler geliyor?",
      isSent: true,
      timestamp: "10:38",
      isRead: true,
    },
    {
      id: 5,
      text: "Mehmet, Ali, Zeynep ve Ayşe de gelecek. Toplam 6 kişi olacağız.",
      isSent: false,
      timestamp: "10:40",
      isRead: true,
    },
    {
      id: 6,
      text: "Harika! Yarın görüşürüz.",
      isSent: true,
      timestamp: "10:45",
      isRead: true,
    },
  ],
  "102": [
    {
      id: 1,
      text: "Voleybol antrenmanına bekliyoruz. Unutma!",
      isSent: false,
      timestamp: "15:20",
      isRead: true,
    },
    {
      id: 2,
      text: "Teşekkürler hatırlattığın için. Saat kaçta?",
      isSent: true,
      timestamp: "15:25",
      isRead: true,
    },
    {
      id: 3,
      text: "18:00'de başlıyoruz, 17:45'te orada olursan iyi olur.",
      isSent: false,
      timestamp: "15:30",
      isRead: true,
    },
  ],
  "103": [
    {
      id: 1,
      text: "Futbol turnuvası için takım oluşturuyorum. İlgilenir misin?",
      isSent: false,
      timestamp: "Dün, 14:22",
      isRead: true,
    },
    {
      id: 2,
      text: "Ne zaman başlıyor turnuva?",
      isSent: true,
      timestamp: "Dün, 15:30",
      isRead: true,
    },
    {
      id: 3,
      text: "Önümüzdeki ay, 15 Temmuz'da. 6 hafta sürecek, her hafta bir maç.",
      isSent: false,
      timestamp: "Dün, 16:05",
      isRead: true,
    },
  ],
};

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Profil bilgisini yükle
    if (id && CHAT_PROFILES[id]) {
      setProfile(CHAT_PROFILES[id]);
    }

    // Mesajları yükle
    if (id && CHAT_MESSAGES[id]) {
      setChatMessages(CHAT_MESSAGES[id]);
    }
  }, [id]);

  const handleBackPress = () => {
    router.back();
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    const newMessage: ChatMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      isSent: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };

    setChatMessages(prevMessages => [...prevMessages, newMessage]);
    setInputMessage("");

    // Listeyi en alta kaydır
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View style={[
      styles.messageContainer, 
      item.isSent ? styles.sentMessage : styles.receivedMessage
    ]}>
      <View style={[
        styles.messageBubble, 
        item.isSent ? styles.sentBubble : styles.receivedBubble
      ]}>
        <Text style={[
          styles.messageText,
          item.isSent ? styles.sentMessageText : styles.receivedMessageText
        ]}>
          {item.text}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
          {item.isSent && (
            <View style={styles.readStatus}>
              {item.isRead ? (
                <View style={styles.readIcon}>
                  <View style={styles.readIconInner} />
                </View>
              ) : (
                <View style={styles.unreadIcon}>
                  <View style={styles.unreadIconInner} />
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  if (!profile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar style="dark" />
        <Text>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ChevronLeft size={24} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.profileSection}>
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileStatus}>
                {profile.isOnline ? "Çevrimiçi" : `Son görülme: ${profile.lastSeen}`}
              </Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Phone size={20} color="#3498db" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Video size={20} color="#3498db" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MoreVertical size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>
        
        <FlatList
          ref={flatListRef}
          data={chatMessages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
        
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton}>
            <Paperclip size={20} color="#95a5a6" />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Mesajınızı yazın..."
              value={inputMessage}
              onChangeText={setInputMessage}
              multiline
            />
            <TouchableOpacity style={styles.emojiButton}>
              <Smile size={20} color="#95a5a6" />
            </TouchableOpacity>
          </View>
          
          {inputMessage.trim() === "" ? (
            <TouchableOpacity style={styles.micButton}>
              <Mic size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Send size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  profileSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileInfo: {
    marginLeft: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  profileStatus: {
    fontSize: 12,
    color: "#95a5a6",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: "row",
  },
  sentMessage: {
    justifyContent: "flex-end",
  },
  receivedMessage: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  sentBubble: {
    backgroundColor: "#3498db",
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: "#f1f1f1",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  sentMessageText: {
    color: "#fff",
  },
  receivedMessageText: {
    color: "#333",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    marginRight: 4,
  },
  readStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  readIcon: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  readIconInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2ecc71",
  },
  unreadIcon: {
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadIconInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  attachButton: {
    padding: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 20,
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 8,
  },
  emojiButton: {
    padding: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
  },
  micButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
  },
}); 