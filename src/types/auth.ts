export interface User {
  id: string;
  email: string;
  name: string;
  joinDate: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessCode: string | null;
}

export interface AdminUser {
  username: string;
  isAdmin: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}