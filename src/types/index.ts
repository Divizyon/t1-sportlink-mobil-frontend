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
  data: {
    session: {
      access_token: string;
      refresh_token: string;
    };
    user: User;
  };
}
