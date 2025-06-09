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
  User,
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
      setError("Mesajlar yüklenirken bir hata oluştu");
      console.error("Mesajlar yüklenirken hata:", err);
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
      },
    });
  };

  const filteredChats = searchQuery
    ? chats.filter((chat) => {
        if (!chat.friend || !chat.last_message) return false;

        const nameMatch = `${chat.friend.first_name} ${chat.friend.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        const contentMatch =
          chat.last_message.content &&
          chat.last_message.content
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        return nameMatch || contentMatch;
      })
    : chats.filter((chat) => chat.friend && chat.last_message);

  const renderChatItem = ({ item }: { item: ChatItem }) => {
    if (!item.friend || !item.last_message) return null;

    const hasProfilePicture =
      item.friend.profile_picture &&
      item.friend.profile_picture.trim() !== "" &&
      !item.friend.profile_picture.includes("placeholder");

    return (
      <TouchableOpacity
        style={[styles.messageItem, item.unread_count > 0 && styles.unreadItem]}
        onPress={() => handleMessagePress(item.friend.id)}
      >
        <View style={styles.avatarContainer}>
          {hasProfilePicture ? (
            <Image
              source={{
                uri: item.friend.profile_picture,
              }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.defaultAvatarContainer}>
              <User size={24} color="#FFFFFF" />
            </View>
          )}
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
                  hour: "2-digit",
                  minute: "2-digit",
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
            {item.last_message.content || ""}
          </Text>
        </View>

        {item.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unread_count}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <ChevronLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mesajlar</Text>
          <View style={styles.placeholderRight} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={styles.loadingText}>Mesajlar yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <ChevronLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mesajlar</Text>
          <View style={styles.placeholderRight} />
        </View>

        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <MessageCircle size={40} color="#ffffff" />
          </View>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchMessages}>
            <Text style={styles.retryButtonText}>Tekrar Dene</Text>
          </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Mesajlar</Text>
        <TouchableOpacity style={styles.optionsButton}>
          <MoreVertical size={22} color="#333" />
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
            placeholderTextColor="#95a5a6"
          />
        </View>
      </View>

      {filteredChats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <MessageCircle size={64} color="#ffffff" />
          </View>
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
          showsVerticalScrollIndicator={false}
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
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#10B981",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#FFFFFF",
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F7",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333",
  },
  optionsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F7",
  },
  placeholderRight: {
    width: 40,
    height: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  searchIcon: {
    marginRight: 10,
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.04)",
  },
  unreadItem: {
    backgroundColor: "#f0f7ff",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  defaultAvatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
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
    marginBottom: 6,
  },
  senderName: {
    fontSize: 16,
    fontWeight: "700",
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
    fontWeight: "600",
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    paddingHorizontal: 6,
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
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 15,
    color: "#95a5a6",
    textAlign: "center",
    paddingHorizontal: 32,
    marginTop: 8,
    lineHeight: 22,
  },
});
