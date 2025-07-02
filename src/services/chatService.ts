import { ChatMessage, UserProfile } from '../types/chat';

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

  // ارسال پیام به هوش مصنوعی (شبیه‌سازی شده)
  async sendMessage(messages: ChatMessage[], userProfile: UserProfile): Promise<string> {
    // شبیه‌سازی تأخیر شبکه
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lastMessage = messages[messages.length - 1];
    const userMessage = lastMessage.content.toLowerCase();

    // پاسخ‌های هوشمند بر اساس محتوای پیام و پروفایل کاربر
    if (userMessage.includes('بارداری') || userMessage.includes('حامله')) {
      return this.getPregnancyAdvice(userProfile);
    }
    
    if (userMessage.includes('نوزاد') || userMessage.includes('بچه')) {
      return this.getBabyAdvice(userProfile);
    }
    
    if (userMessage.includes('تغذیه') || userMessage.includes('غذا')) {
      return this.getNutritionAdvice(userProfile);
    }
    
    if (userMessage.includes('علائم') || userMessage.includes('نشانه')) {
      return this.getSymptomAdvice(userProfile);
    }

    if (userMessage.includes('ورزش') || userMessage.includes('فعالیت')) {
      return this.getExerciseAdvice(userProfile);
    }

    // پاسخ عمومی
    return this.getGeneralAdvice(userProfile);
  }

  private getPregnancyAdvice(userProfile: UserProfile): string {
    const week = userProfile.pregnancyWeek || 0;
    const name = userProfile.name;
    
    if (!userProfile.isPregnant) {
      return `سلام ${name}! اگر قصد بارداری دارید، توصیه می‌کنم:\n\n• مصرف اسید فولیک (۴۰۰ میکروگرم روزانه)\n• رژیم غذایی متعادل\n• ورزش منظم\n• ترک سیگار و الکل\n• مشاوره با پزشک\n\nآیا سوال خاصی دارید؟`;
    }
    
    if (week <= 12) {
      return `${name} عزیز، در سه‌ماهه اول بارداری (هفته ${week}):\n\n• مصرف اسید فولیک ضروری است\n• تهوع صبحگاهی طبیعی است\n• از غذاهای خام پرهیز کنید\n• استراحت کافی داشته باشید\n• ویزیت منظم پزشک\n\nنگران نباشید، همه چیز طبیعی پیش می‌رود!`;
    }
    
    if (week <= 28) {
      return `${name} جان، در سه‌ماهه دوم (هفته ${week}):\n\n• احساس بهتری خواهید داشت\n• حرکات جنین را احساس می‌کنید\n• سونوگرافی مهم در این دوره\n• ورزش ملایم مفید است\n• مراقب افزایش وزن باشید\n\nدوره طلایی بارداری است!`;
    }
    
    return `${name} عزیز، در سه‌ماهه سوم (هفته ${week}):\n\n• آماده‌سازی برای زایمان\n• کلاس‌های بارداری مفید است\n• مراقب علائم زایمان باشید\n• کیف بیمارستان را آماده کنید\n• استراحت بیشتر\n\nتقریباً به پایان رسیده‌اید!`;
  }

  private getBabyAdvice(userProfile: UserProfile): string {
    const name = userProfile.name;
    return `${name} عزیز، نکات مهم مراقبت از نوزاد:\n\n• شیردهی انحصاری تا ۶ ماهگی\n• واکسیناسیون به موقع\n• خواب ایمن (روی پشت)\n• نظافت و بهداشت\n• ارتباط و صحبت با نوزاد\n• مراجعه منظم به پزشک\n\nصبور باشید، همه چیز یاد می‌گیرید!`;
  }

  private getNutritionAdvice(userProfile: UserProfile): string {
    const name = userProfile.name;
    const isPregnant = userProfile.isPregnant;
    
    if (isPregnant) {
      return `${name} جان، تغذیه در بارداری:\n\n• پروتئین: گوشت، ماهی، تخم‌مرغ، حبوبات\n• کلسیم: لبنیات، کنجد، بادام\n• آهن: گوشت قرمز، اسفناج، عدس\n• اسید فولیک: سبزیجات برگ سبز\n• مایعات فراوان\n• پرهیز از غذاهای خام\n\nتغذیه متنوع کلید سلامتی است!`;
    }
    
    return `${name} عزیز، تغذیه سالم:\n\n• میوه و سبزیجات تازه\n• غلات کامل\n• پروتئین‌های سالم\n• لبنیات کم‌چرب\n• آب فراوان\n• محدود کردن شکر و نمک\n\nتعادل در همه چیز مهم است!`;
  }

  private getExerciseAdvice(userProfile: UserProfile): string {
    const name = userProfile.name;
    const isPregnant = userProfile.isPregnant;
    const week = userProfile.pregnancyWeek || 0;
    
    if (isPregnant) {
      return `${name} عزیز، ورزش در بارداری (هفته ${week}):\n\n• پیاده‌روی روزانه ۳۰ دقیقه\n• شنا (بهترین ورزش بارداری)\n• یوگا و کشش\n• تمرینات تنفسی\n• پرهیز از ورزش‌های تماسی\n• توقف در صورت درد یا خونریزی\n\nحتماً با پزشک مشورت کنید!`;
    }
    
    return `${name} جان، ورزش برای سلامتی:\n\n• ۱۵۰ دقیقه ورزش متوسط در هفته\n• ترکیب ورزش هوازی و قدرتی\n• کشش و انعطاف‌پذیری\n• شروع تدریجی\n• گوش دادن به بدن\n\nورزش منظم کلید سلامتی است!`;
  }

  private getSymptomAdvice(userProfile: UserProfile): string {
    const name = userProfile.name;
    return `${name} عزیز، علائم مهم که نیاز به مراجعه فوری دارند:\n\n🚨 در بارداری:\n• خونریزی شدید\n• درد شکمی شدید\n• تب بالا\n• سردرد شدید\n• تورم ناگهانی\n\n🚨 در نوزاد:\n• تب بالای ۳۸ درجه\n• تنگی نفس\n• بی‌حالی\n• عدم خوردن شیر\n\nهمیشه به غریزه مادری خود اعتماد کنید!`;
  }

  private getGeneralAdvice(userProfile: UserProfile): string {
    const name = userProfile.name;
    const responses = [
      `سلام ${name}! چطور می‌تونم کمکتون کنم؟ من اینجام تا در زمینه مادری و بارداری راهنماییتون کنم.`,
      `${name} عزیز، خوشحالم که با من صحبت می‌کنید! سوال خاصی دارید؟ می‌تونم در مورد بارداری، مراقبت از نوزاد یا سلامت مادر کمکتون کنم.`,
      `${name} جان، همیشه یادتون باشه که شما یک مادر فوق‌العاده هستید! چه سوالی دارید؟`,
      `سلام ${name}! من اینجام تا کمکتون کنم. می‌تونید در مورد هر موضوعی که نگرانتونه سوال بپرسید.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

export const chatService = new ChatService();