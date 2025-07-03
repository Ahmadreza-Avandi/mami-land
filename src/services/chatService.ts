import { ChatMessage, UserProfile } from '../types/chat';
import { dbService } from './databaseService';

const CHAT_HISTORY_KEY = 'mamiland_chat_history';
const USER_PROFILE_KEY = 'mamiland_user_profile';
const PROXY_API_URL = 'https://mine-gpt-alpha.vercel.app/proxy';

class ChatService {
  private currentSessionId: number | null = null;
  private currentUserId: number | null = null;

  // تنظیم کاربر فعلی
  setCurrentUser(userId: number): void {
    this.currentUserId = userId;
  }

  // ایجاد جلسه چت جدید
  async createNewSession(userId: number, title?: string): Promise<number> {
    const sessionId = await dbService.createChatSession(userId, title);
    this.currentSessionId = sessionId;
    return sessionId;
  }

  // بارگذاری تاریخچه چت از دیتابیس
  async loadChatHistory(sessionId?: number): Promise<ChatMessage[]> {
    try {
      if (sessionId) {
        this.currentSessionId = sessionId;
      }

      if (!this.currentSessionId) {
        // اگر جلسه‌ای وجود ندارد، از localStorage بارگذاری کن (برای سازگاری با قبل)
        const stored = localStorage.getItem(CHAT_HISTORY_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        }
        return [];
      }

      const messages = await dbService.getChatMessages(this.currentSessionId);
      return messages.map(msg => ({
        id: msg.id.toString(),
        content: msg.content,
        role: msg.role as 'user' | 'assistant',
        timestamp: new Date(msg.created_at)
      }));
    } catch {
      return [];
    }
  }

  // ذخیره پیام در دیتابیس
  async saveMessage(content: string, role: 'user' | 'assistant'): Promise<void> {
    try {
      if (!this.currentSessionId && this.currentUserId) {
        // ایجاد جلسه جدید اگر وجود ندارد
        this.currentSessionId = await this.createNewSession(this.currentUserId);
      }

      if (this.currentSessionId && this.currentUserId) {
        await dbService.saveChatMessage(this.currentSessionId, this.currentUserId, content, role);
      } else {
        // fallback به localStorage
        const messages = await this.loadChatHistory();
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          content,
          role,
          timestamp: new Date()
        };
        messages.push(newMessage);
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
      }
    } catch (error) {
      console.error('خطا در ذخیره پیام:', error);
    }
  }

  // ذخیره تاریخچه چت در localStorage (برای سازگاری)
  saveChatHistory(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('خطا در ذخیره تاریخچه چت:', error);
    }
  }

  // بارگذاری پروفایل کاربر
  loadUserProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(USER_PROFILE_KEY);
      if (!stored) {
        return {
          name: '',
          age: null,
          isPregnant: null,
          pregnancyWeek: null,
          medicalConditions: '',
          isComplete: false,
        };
      }
      return JSON.parse(stored);
    } catch {
      return {
        name: '',
        age: null,
        isPregnant: null,
        pregnancyWeek: null,
        medicalConditions: '',
        isComplete: false,
      };
    }
  }

  // ذخیره پروفایل کاربر
  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('خطا در ذخیره پروفایل کاربر:', error);
    }
  }

  // پاک کردن تاریخچه چت
  async clearChatHistory(): Promise<void> {
    try {
      if (this.currentSessionId) {
        await dbService.deleteChatSession(this.currentSessionId);
        this.currentSessionId = null;
      }
      localStorage.removeItem(CHAT_HISTORY_KEY);
      localStorage.removeItem(USER_PROFILE_KEY);
    } catch (error) {
      console.error('خطا در پاک کردن تاریخچه:', error);
    }
  }

  // فرمت کردن تاریخچه چت برای ارسال به API
  private formatChatHistory(messages: ChatMessage[], userProfile: UserProfile): string {
    let systemMessage = `
تو یک مشاور هستی (دستیار هوش مصنوعی مامی‌لند) و وظیفه‌ت همدلی و همراهی با مادرهاست.
نباید خیلی تخصصی جواب بدی؛ باید صمیمی، دلسوز و خودمونی باشی. اگر سوال خیلی تخصصی بود، ارجاع بده به واتساپ مامی‌لند.
جواب باید ۲ تا ۵ خط باشه و حتماً فارسی و غیررسمی.
سوالاتی که مربوط به پزشکی نیستن رو نباید جواب بدی
System: You are a helpful assistant for MamiLand (مامی‌لند), a Persian website specialized in pregnancy and motherhood support. Always respond in Persian language. Be friendly, supportive, and informal.
    `;

    if (userProfile.isComplete) {
      systemMessage += `

User Profile:
- Name: ${userProfile.name}
- Age: ${userProfile.age}
- Pregnancy Status: ${userProfile.isPregnant ? 'باردار' : 'غیر باردار'}
- Pregnancy Week: ${userProfile.pregnancyWeek || 'مشخص نشده'}
- Medical Conditions: ${userProfile.medicalConditions || 'هیچی'}

از این اطلاعات برای جواب دادن استفاده کن. اسم کاربر رو اگه خواستی استفاده کن، مشکلی نیست.
`;
    }

    const chat = messages.map(msg => {
      const role = msg.role === 'user' ? 'User' : 'Assistant';
      return `${role}: ${msg.content}`;
    }).join('\n');

    return `${systemMessage}\n\nChat History:\n${chat}`;
  }

  // ارسال پیام به هوش مصنوعی
  async sendMessage(messages: ChatMessage[], userProfile: UserProfile): Promise<string> {
    try {
      const prompt = this.formatChatHistory(messages, userProfile);
      const encodedPrompt = encodeURIComponent(prompt);

      const response = await fetch(`${PROXY_API_URL}?text=${encodedPrompt}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.answer) {
        return data.answer.trim();
      } else {
        return 'متأسفم، نتونستم جواب مناسبی پیدا کنم. دوباره امتحان کن!';
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return 'متأسفم، مشکلی در اتصال به سرور پیش اومده. لطفاً یه کم دیگه صبر کن و دوباره امتحان کن.';
    }
  }

  // دریافت جلسات چت کاربر
  async getUserChatSessions(userId: number): Promise<any[]> {
    try {
      return await dbService.getChatSessions(userId);
    } catch {
      return [];
    }
  }
}

export const chatService = new ChatService();