import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, router } from "expo-router";
import { Text } from "@/components/ui/text";
import { ChevronLeft, Send } from "lucide-react-native";
import { apiClient } from "@/services/api/client";

export default function MessageDetailScreen() {
  const { id, name, avatar } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Mesajları çek
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient
      .get(`/mobile/messages/${id}?limit=50&offset=0`)
      .then(res => {
        setMessages(res.data.data.messages);
      })
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [id]);

  // Mesaj gönder
  const sendMessage = async () => {
    if (!input.trim() || !id) return;
    setSending(true);
    try {
      const res = await apiClient.post(`/mobile/messages/${id}`,
        {
          content: input,
          content_type: "text",
        }
      );
      setMessages(prev => [
        ...prev,
        res.data.data
      ]);
      setInput("");
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (e) {
      alert("Mesaj gönderilemedi");
    } finally {
      setSending(false);
    }
  };

  if (!name) {
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Image source={{ uri: avatar as string || 'https://via.placeholder.com/100' }} style={styles.avatar} />
          <Text style={styles.userName}>{name}</Text>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#4dabf7" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView style={styles.messagesContainer} ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}>
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender_id === id ? styles.incomingMessage : styles.outgoingMessage
              ]}
            >
              <Text style={styles.messageText}>{msg.content}</Text>
              <Text style={styles.messageTime}>
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Mesaj yazın..."
          value={input}
          onChangeText={setInput}
          editable={!sending}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={sending}>
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