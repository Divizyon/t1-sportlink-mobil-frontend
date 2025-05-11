export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  birthday_date?: string;
}

export interface AuthResponse {
  status: string;
  message?: string;
  data: {
    session?: {
      access_token: string;
      refresh_token: string;
    };
    user: User;
  };
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  gender?: string;
  birthday_date?: string;
  address?: string;
  first_name: string;
  last_name: string;
  total_events: number;
  friend_count: number;
}
