// NOTE: WebSocket functionality is currently disabled due to pending backend implementation
// This file is kept as a placeholder for future implementation

class WebSocketService {
  private token: string | null = null;

  constructor() {
    this.token = null;
    console.warn('WebSocket functionality is disabled - waiting for backend implementation');
  }

  initialize(token: string) {
    this.token = token;
    console.warn('WebSocket initialization skipped - feature not yet implemented in backend');
  }

  // Friend request methods - all disabled
  sendFriendRequest(userId: number) {
    console.warn('WebSocket sendFriendRequest skipped - feature not yet implemented in backend');
  }

  acceptFriendRequest(requestId: number) {
    console.warn('WebSocket acceptFriendRequest skipped - feature not yet implemented in backend');
  }

  rejectFriendRequest(requestId: number) {
    console.warn('WebSocket rejectFriendRequest skipped - feature not yet implemented in backend');
  }

  cancelFriendRequest(requestId: number) {
    console.warn('WebSocket cancelFriendRequest skipped - feature not yet implemented in backend');
  }

  disconnect() {
    console.warn('WebSocket disconnect skipped - feature not yet implemented in backend');
  }
}

export const websocketService = new WebSocketService(); 