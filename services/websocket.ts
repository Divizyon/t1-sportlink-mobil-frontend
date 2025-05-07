import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/constants/config';
import { store } from '@/store';
import { addNotification } from '@/store/slices/notificationsSlice';
import { updateFriendRequest } from '@/store/slices/friendsSlice';

class WebSocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  constructor() {
    this.token = null;
  }

  initialize(token: string) {
    if (this.socket) {
      this.disconnect();
    }

    this.token = token;
    this.socket = io(API_URL, {
      auth: {
        token: this.token
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.setupListeners();
  }

  private setupListeners() {
    if (!this.socket) return;

    // Bağlantı olayları
    this.socket.on('connect', () => {
      console.log('WebSocket bağlantısı kuruldu');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket bağlantısı kesildi');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket bağlantı hatası:', error);
    });

    // Arkadaşlık istekleri olayları
    this.socket.on('friend:request', (data) => {
      store.dispatch(addNotification({
        id: Date.now(),
        type: 'friend',
        title: 'Yeni Arkadaşlık İsteği',
        message: `${data.sender.name} size arkadaşlık isteği gönderdi`,
        data: {
          requestId: data.id,
          userId: data.sender.id
        },
        isRead: false,
        createdAt: new Date().toISOString()
      }));
    });

    this.socket.on('friend:request:accepted', (data) => {
      store.dispatch(updateFriendRequest({
        id: data.requestId,
        status: 'accepted'
      }));
    });

    this.socket.on('friend:request:rejected', (data) => {
      store.dispatch(updateFriendRequest({
        id: data.requestId,
        status: 'rejected'
      }));
    });

    this.socket.on('friend:request:cancelled', (data) => {
      store.dispatch(updateFriendRequest({
        id: data.requestId,
        status: 'cancelled'
      }));
    });
  }

  // Arkadaşlık isteği gönderme
  sendFriendRequest(userId: number) {
    if (!this.socket) return;
    this.socket.emit('friend:request:send', { userId });
  }

  // Arkadaşlık isteğini kabul etme
  acceptFriendRequest(requestId: number) {
    if (!this.socket) return;
    this.socket.emit('friend:request:accept', { requestId });
  }

  // Arkadaşlık isteğini reddetme
  rejectFriendRequest(requestId: number) {
    if (!this.socket) return;
    this.socket.emit('friend:request:reject', { requestId });
  }

  // Arkadaşlık isteğini iptal etme
  cancelFriendRequest(requestId: number) {
    if (!this.socket) return;
    this.socket.emit('friend:request:cancel', { requestId });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const websocketService = new WebSocketService(); 