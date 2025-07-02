export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface UserProfile {
  name: string;
  age: number | null;
  isPregnant: boolean | null;
  pregnancyWeek: number | null;
  medicalConditions: string;
  isComplete: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  userProfile: UserProfile;
  onboardingStep: number; // 0: name, 1: age, 2: pregnancy, 3: pregnancy week, 4: medical conditions, 5: complete
}

export type OnboardingStep = 'name' | 'age' | 'pregnancy' | 'pregnancyWeek' | 'medicalConditions' | 'complete';