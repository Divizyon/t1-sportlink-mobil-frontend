import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/src/store/AuthContext";
import { API_URL } from "@/src/config";

interface MessageContextType {
  unreadCount: number;
  resetUnreadCount: () => void;
  markAsRead: (senderId: string) => void;
}

interface MessageProviderProps {
  children: ReactNode;
}

// Create the context with default values
const MessageContext = createContext<MessageContextType>({
  unreadCount: 0,
  resetUnreadCount: () => {},
  markAsRead: () => {},
});

export const MessageProvider: React.FC<MessageProviderProps> = ({
  children,
}) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const { isAuthenticated, user } = useAuth();

  // Fetch unread message count periodically when user is authenticated
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAuthenticated && user) {
      // Fetch immediately on mount
      fetchUnreadMessages();

      // Set up interval to fetch periodically
      interval = setInterval(() => {
        fetchUnreadMessages();
      }, 15000); // Check every 15 seconds for more responsive updates
    }

    // Cleanup function
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAuthenticated, user]);

  // Fetch unread message count from the API
  const fetchUnreadMessages = async () => {
    try {
      if (!isAuthenticated || !user) return;

      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) return;

      // Get the correct endpoint URL for unread messages
      const endpointUrl = `${API_URL}/mobile/messages/unread`;

      const response = await fetch(endpointUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        // Önbelleği devre dışı bırak, her zaman taze veri al
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();

        // Calculate total unread count from all conversations
        let total = 0;
        if (data.status === "success" && Array.isArray(data.data)) {
          data.data.forEach((item: { count: number }) => {
            // Sayısal değeri doğru şekilde çıkar
            const count =
              typeof item.count === "number"
                ? item.count
                : typeof item.count === "string"
                ? parseInt(item.count, 10)
                : 0;
            total += count || 0;
          });
        }

        setUnreadCount(total);
      } else {
        console.error(
          "Failed to fetch unread messages:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  };

  // Reset unread count
  const resetUnreadCount = () => {
    setUnreadCount(0);
  };

  // Mark messages from a specific sender as read
  const markAsRead = async (senderId: string) => {
    try {
      if (!isAuthenticated || !user) return;

      // Get the auth token
      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) return;

      // Make API call to mark messages as read
      const response = await fetch(
        `${API_URL}/mobile/messages/${senderId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("Messages marked as read via API");
        // Update local count
        fetchUnreadMessages();
      } else {
        console.error(
          "Failed to mark messages as read:",
          response.status,
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  return (
    <MessageContext.Provider
      value={{
        unreadCount,
        resetUnreadCount,
        markAsRead,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

// Custom hook to use the message context
export const useMessages = (): MessageContextType => {
  const context = useContext(MessageContext);

  if (context === undefined) {
    throw new Error("useMessages must be used within a MessageProvider");
  }

  return context;
};

export default MessageContext;
