/**
 * Mock verileri için tip tanımlamaları
 */

// Etkinlik tipi
export interface Event {
  id: number;
  title: string;
  description: string;
  date: Date;
  time: string;
  endTime: string;
  location: string;
  category: string;
  participants: number;
  maxParticipants: number;
  status: "approved" | "pending" | "cancelled" | "completed";
  organizer:
    | string
    | {
        id: string;
        name: string;
        avatar?: string;
        phoneNumber?: string;
      };
  image: any; // string ya da require() ile yüklenen resim
  isAttending?: boolean;
  attendees?: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
  requirements?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Kullanıcı tipi
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  city: string;
  role: "user" | "admin";
  locationCoords?: {
    latitude: number;
    longitude: number;
  };
  joinedAt: string;
  bio?: string;
  phoneNumber?: string;
  birthDate?: string;
  gender?: string;
  interests?: string[];
  stats?: {
    attendedEvents: number;
    organizedEvents: number;
    totalFriends: number;
  };
  isFriend?: boolean;
  mutualFriends?: number;
}

// Bildirim tipi
export interface Notification {
  id: string;
  type:
    | "event_invitation"
    | "event_reminder"
    | "event_update"
    | "event_cancelled"
    | "friend_request";
  title: string;
  message: string;
  relatedId: string;
  sender?: {
    id: string;
    name: string;
    avatar: string;
  };
  isRead: boolean;
  createdAt: Date;
}

// Konuşma tipi
export interface Conversation {
  id: string;
  participants: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
  lastMessage: {
    id: string;
    senderId: string;
    text: string;
    createdAt: Date;
    isRead: boolean;
  };
  unreadCount: number;
}

// Mesaj tipi
export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date;
  isRead: boolean;
}
