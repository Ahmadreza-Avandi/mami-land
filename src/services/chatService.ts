import { ChatMessage, UserProfile } from '../types/chat';

const CHAT_HISTORY_KEY = 'mamiland_chat_history';
const USER_PROFILE_KEY = 'mamiland_user_profile';
const PROXY_API_URL = 'https://mine-gpt-alpha.vercel.app/proxy';

class ChatService {
  private readonly CHAT_HISTORY_KEY = 'mamiland_chat_history';
  private readonly USER_PROFILE_KEY = 'mamiland_user_profile';

  // بارگذاری تاریخچه چت از localStorage
  loadChatHistory(): ChatMessage[] {
    try {
      const stored = localStorage.getItem(this.CHAT_HISTORY_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch {
      return [];
    }
  }

  // ذخیره تاریخچه چت در localStorage
  saveChatHistory(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(this.CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('خطا در ذخیره تاریخچه چت:', error);
    }
  }

  // بارگذاری پروفایل کاربر از localStorage
  loadUserProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(this.USER_PROFILE_KEY);
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

  // ذخیره پروفایل کاربر در localStorage
  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(this.USER_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('خطا در ذخیره پروفایل کاربر:', error);
    }
  }

  // پاک کردن تاریخچه چت
  clearChatHistory(): void {
    try {
      localStorage.removeItem(this.CHAT_HISTORY_KEY);
      localStorage.removeItem(this.USER_PROFILE_KEY);
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

  // ارسال پیام به هوش مصنوعی با استفاده از LangChain
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

      // فقط مقدار "answer" رو برگردون
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
}

export const chatService = new ChatService();