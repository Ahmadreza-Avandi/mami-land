import { ChatMessage, UserProfile } from '../types/chat';

const CHAT_HISTORY_KEY = 'mamiland_chat_history';
const USER_PROFILE_KEY = 'mamiland_user_profile';
const PROXY_API_URL = 'https://mine-gpt-alpha.vercel.app/proxy';

export class ChatService {
  saveChatHistory(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  loadChatHistory(): ChatMessage[] {
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_KEY);
      if (saved) {
        const messages = JSON.parse(saved);
        return messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    return [];
  }

  clearChatHistory(): void {
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
      localStorage.removeItem(USER_PROFILE_KEY);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }

  saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  loadUserProfile(): UserProfile {
    try {
      const saved = localStorage.getItem(USER_PROFILE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
    return {
      name: '',
      age: null,
      pregnancyWeek: null,
      medicalConditions: '',
      isComplete: false,
    };
  }

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

      // ✅ فقط مقدار "answer" رو برگردون
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

export const chatSer = new ChatService();
