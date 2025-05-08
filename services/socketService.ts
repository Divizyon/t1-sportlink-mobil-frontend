import { io, Socket } from 'socket.io-client';
import { BACKEND_URL } from '@/config';
import { getToken } from './authService';

let socket: Socket | null = null;

export const initializeSocket = async (userId: string) => {
  try {
    const token = await getToken();
    
    if (!token) {
      console.error('Token bulunamadı');
      return null;
    }

    if (socket?.connected) {
      console.log('Socket zaten bağlı');
      return socket;
    }

    socket = io(BACKEND_URL, {
      transports: ['websocket'],
      autoConnect: false
    });

    socket.on('connect', () => {
      console.log('Socket.IO bağlantısı kuruldu');
      // Kimlik doğrulama
      socket.emit('authenticate', { token, userId });
    });

    socket.on('authenticated', (data) => {
      console.log('Socket.IO kimlik doğrulama başarılı:', data);
    });

    socket.on('error', (error) => {
      console.error('Socket.IO hatası:', error);
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO bağlantısı kesildi');
    });

    socket.connect();

    return socket;
  } catch (error) {
    console.error('Socket başlatma hatası:', error);
    return null;
  }
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Mesaj gönderme
export const sendMessage = (receiverId: string, content: string, contentType: string = 'text') => {
  if (!socket?.connected) {
    console.error('Socket bağlı değil');
    return;
  }

  socket.emit('send_message', { receiverId, content, contentType });
};

// Mesajları okundu olarak işaretle
export const markMessagesAsRead = (senderId: string) => {
  if (!socket?.connected) {
    console.error('Socket bağlı değil');
    return;
  }

  socket.emit('mark_messages_read', { senderId });
};

// Yeni mesaj dinleyicisi ekle
export const onNewMessage = (callback: (message: any) => void) => {
  if (!socket) {
    console.error('Socket başlatılmadı');
    return;
  }

  socket.on('new_message', callback);
};

// Mesaj okundu dinleyicisi ekle
export const onMessagesRead = (callback: (data: any) => void) => {
  if (!socket) {
    console.error('Socket başlatılmadı');
    return;
  }

  socket.on('messages_read', callback);
}; 