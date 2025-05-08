import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Send } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { initializeSocket, sendMessage, onNewMessage, onMessagesRead, markMessagesAsRead } from '@/services/socketService';
import { messageApi } from '@/services/api/messages';

interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  content_type: string;
  is_read: boolean;
  created_at: string;
}

export default function ChatScreen() {
  const { id, name, avatar } = useLocalSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  useEffect(() => {
    const setupChat = async () => {
      if (!user?.id) return;

      try {
        // Socket.IO bağlantısını başlat
        await initializeSocket(user.id);

        // Mesaj dinleyicilerini ekle
        onNewMessage((message) => {
          if (message.sender_id === id || message.sender_id === user.id) {
            setMessages(prev => [message, ...prev]);
            if (message.sender_id === id) {
              markMessagesAsRead(id as string);
            }
          }
        });

        onMessagesRead((data) => {
          if (data.by === id) {
            setMessages(prev =>
              prev.map(msg => ({
                ...msg,
                is_read: msg.sender_id === user.id ? true : msg.is_read
              }))
            );
          }
        });

        // Geçmiş mesajları yükle
        const conversation = await messageApi.getConversation(id as string);
        setMessages(conversation.messages.reverse());
        
        // Okunmamış mesajları işaretle
        if (conversation.messages.some(m => !m.is_read && m.sender_id === id)) {
          markMessagesAsRead(id as string);
        }
      } catch (error) {
        console.error('Chat kurulum hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    setupChat();
  }, [user?.id, id]);

  const handleSend = () => {
    if (!newMessage.trim() || !user?.id) return;

    sendMessage(id as string, newMessage);
    setNewMessage('');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === user?.id;

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.theirMessage
      ]}>
        <Text style={[
          styles.messageText,
          isMyMessage ? styles.myMessageText : styles.theirMessageText
        ]}>
          {item.content}
        </Text>
        {isMyMessage && (
          <Text style={styles.readStatus}>
            {item.is_read ? '✓✓' : '✓'}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4dabf7" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{name}</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id.toString()}
        inverted
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Mesajınızı yazın..."
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!newMessage.trim()}
        >
          <Send size={20} color={newMessage.trim() ? '#fff' : '#A0AEC0'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    fontSize: 16,
    color: '#4A5568',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  placeholder: {
    width: 50,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4dabf7',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#2D3748',
  },
  readStatus: {
    fontSize: 12,
    color: '#E2E8F0',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4dabf7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
}); 