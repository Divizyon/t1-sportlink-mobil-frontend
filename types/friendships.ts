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
  id: string | number;
  requester_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
  requester: {
    id: string;
    email: string;
    is_online: boolean;
    last_name: string;
    first_name: string;
    last_seen_at: string;
    profile_picture: string;
  };
  mutual_friends_count: number;
}
