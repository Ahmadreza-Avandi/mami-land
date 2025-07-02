export interface UserProfile {
  name: string;
  age: number | null;
  isPregnant: boolean | null;
  pregnancyWeek: number | null;
  medicalConditions: string;
  isComplete: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  joinDate: Date;
  profile: UserProfile;
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

export interface AccessCode {
  code: string;
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
  usedBy: string | null;
  usedAt: Date | null;
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

export interface AdminChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'admin';
  timestamp: Date;
  userId?: string;
  adminId?: string;
}