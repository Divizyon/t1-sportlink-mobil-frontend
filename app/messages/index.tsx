import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import {
  ChevronLeft,
  MessageCircle,
  Search,
  Clock,
  MoreVertical,
} from "lucide-react-native";
import { messagesApi } from "@/app/services/api/messagesApi";

interface Friend {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
  is_online: boolean;
  last_seen_at: string;
}

interface LastMessage {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  content_type: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface ChatItem {
  friend: Friend;
  last_message: LastMessage;
  unread_count: number;
  last_activity: string;
}

export default function MessagesScreen() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesApi.getMessages();
      if (response?.data?.data) {
        setChats(response.data.data);
      }
    } catch (err) {
      setError('Mesajlar yüklenirken bir hata oluştu');
      console.error('Mesajlar yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleMessagePress = (friendId: string) => {
    router.push({
      pathname: "/messages/[id]",
      params: { 
        id: friendId,
      }
    });
  };

  const filteredChats = searchQuery
    ? chats.filter(
        (chat) =>
          `${chat.friend.first_name} ${chat.friend.last_name}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          chat.last_message.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : chats;

  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      style={[styles.messageItem, item.unread_count > 0 && styles.unreadItem]}
      onPress={() => handleMessagePress(item.friend.id)}
    >
      <View style={styles.avatarContainer}>
        <Image 
          source={{ uri: item.friend.profile_picture || 'https://via.placeholder.com/100' }} 
          style={styles.avatar} 
        />
        {item.friend.is_online && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.senderName}>
            {`${item.friend.first_name} ${item.friend.last_name}`}
          </Text>
          <View style={styles.timeContainer}>
            <Clock size={12} color="#95a5a6" />
            <Text style={styles.messageTime}>
              {new Date(item.last_activity).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.messageText,
            item.unread_count > 0 && styles.unreadText,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.last_message.content}
        </Text>
      </View>

      {item.unread_count > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadCount}>{item.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchMessages}>
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

      {filteredChats.length === 0 ? (
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
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.friend.id}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={fetchMessages}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
