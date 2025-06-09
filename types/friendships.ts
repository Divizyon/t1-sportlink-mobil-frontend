export interface Friend {
  id: string;
  name: string;
  avatar?: string;
  status?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface FriendshipRequest {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled" | "deleted";
  created_at: string;
  updated_at?: string;
  requester?: {
    id: string;
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
    email?: string;
  };
  receiver?: {
    id: string;
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
    email?: string;
  };
}
