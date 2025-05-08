import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, router } from "expo-router";
import { Text } from "@/components/ui/text";
import { ChevronLeft, Send } from "lucide-react-native";
import { apiClient } from "@/services/api/client";

interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  content_type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface Peer {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
  is_online: boolean;
  last_seen_at: string;
}

export default function MessageDetailScreen() {
  const { id } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [peer, setPeer] = useState<Peer | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Mesajları çek
  const fetchMessages = useCallback(async (showLoading = false) => {
    if (!id) return;
    if (showLoading) setLoading(true);
    try {
      const res = await apiClient.get(`/mobile/messages/${id}?limit=50&offset=0`);
      if (res.data?.data) {
        // Mesajları tarihe göre artan sırada sırala (eskiden yeniye)
        const sortedMessages = [...res.data.data.messages].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        setMessages(sortedMessages);
        setPeer(res.data.data.peer);
        // İlk yüklemede veya yeni mesaj varsa scroll en alta
        if (isFirstLoad || messages.length < sortedMessages.length) {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
        setIsFirstLoad(false);
        // Mesajları okundu olarak işaretle
        await apiClient.put(`/mobile/messages/${id}/read`);
      }
    } catch (error) {
      console.error('Mesajlar alınırken hata:', error);
      setError('Mesajlar yüklenirken bir hata oluştu');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [id, messages.length, isFirstLoad]);

  useEffect(() => {
    fetchMessages(true);
    // Her 15 saniyede bir sessizce güncelle
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = async () => {
    if (!input.trim() || !id || sending) return;
    setSending(true);
    try {
      const res = await apiClient.post(`/mobile/messages/${id}`, {
        content: input.trim(),
        content_type: "text"
      });
      
      if (res.data?.data) {
        // Yeni mesajı en alta ekle
        setMessages(prev => [...prev, res.data.data]);
      setInput("");
        // Scroll en alta
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      }
    } catch (error: any) {
      console.error('Mesaj gönderme hatası:', error);
      setError('Mesaj gönderilemedi');
    } finally {
      setSending(false);
    }
  };

  if (!peer && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
          {peer && (
        <View style={styles.userInfo}>
              <Image 
                source={{ uri: peer.profile_picture || 'https://via.placeholder.com/100' }} 
                style={styles.avatar} 
              />
              <View>
                <Text style={styles.userName}>{`${peer.first_name} ${peer.last_name}`}</Text>
                <Text style={[styles.userStatus, peer.is_online && styles.userStatusOnline]}>
                  {peer.is_online ? 'Çevrimiçi' : 'Çevrimdışı'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4dabf7" />
          </View>
        ) : (
          <ScrollView 
            style={styles.messagesContainer}
            ref={scrollViewRef}
            onContentSizeChange={() => {
              if (isFirstLoad) {
                scrollViewRef.current?.scrollToEnd({ animated: false });
              }
            }}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 10
            }}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyMessagesContainer}>
                <Text style={styles.emptyMessagesText}>Henüz mesaj yok</Text>
      </View>
      ) : (
              messages.map((msg, index) => (
            <View
                  key={`${msg.id}-${index}`}
              style={[
                styles.messageBubble,
                msg.sender_id === id ? styles.incomingMessage : styles.outgoingMessage
              ]}
            >
                  <Text style={[
                    styles.messageText,
                    msg.sender_id === id ? styles.incomingMessageText : styles.outgoingMessageText
                  ]}>
                    {msg.content}
                  </Text>
                  <Text style={[
                    styles.messageTime,
                    msg.sender_id === id ? styles.incomingMessageTime : styles.outgoingMessageTime
                  ]}>
                    {new Date(msg.created_at).toLocaleTimeString('tr-TR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
              </Text>
            </View>
              ))
            )}
        </ScrollView>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Mesaj yazın..."
          value={input}
          onChangeText={setInput}
          editable={!sending}
            multiline
            maxLength={1000}
        />
          <TouchableOpacity 
            style={[styles.sendButton, (!input.trim() || sending) && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!input.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
          <Send size={20} color="#fff" />
            )}
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  userInfo: {
    flex: 1,
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
    color: "#333",
  },
  userStatus: {
    fontSize: 12,
    color: "#95a5a6",
    marginTop: 2,
  },
  userStatusOnline: {
    color: "#2ecc71",
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
    marginBottom: 8,
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
    lineHeight: 20,
  },
  incomingMessageText: {
    color: "#333",
  },
  outgoingMessageText: {
    color: "#fff",
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  incomingMessageTime: {
    color: "#95a5a6",
  },
  outgoingMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "flex-end",
    backgroundColor: "#fff",
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#95a5a6",
  },
  emptyMessagesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyMessagesText: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
  },
}); 