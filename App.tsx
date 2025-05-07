import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { websocketService } from '@/services/websocket';

export default function App() {
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      websocketService.initialize(token);
    }

    return () => {
      websocketService.disconnect();
    };
  }, [token]);

  // ... existing code ...
} 