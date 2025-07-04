'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Plus, 
  Menu, 
  LogOut, 
  Trash2, 
  Clock,
  User,
  Bot,
  Settings,
  MessageSquare,
  Send,
  Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatMessage {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

interface UserProfile {
  name: string;
  age: number | null;
  is_pregnant: boolean | null;
  pregnancy_week: number | null;
  medical_conditions: string | null;
  is_complete: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // بررسی احراز هویت در بارگذاری اولیه
  useEffect(() => {
    checkAuth();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setUserProfile(data.user.profile);
        
        // تعیین مرحله onboarding
        if (data.user.profile) {
          const step = getOnboardingStep(data.user.profile);
          setOnboardingStep(step);
          
          // اگر onboarding کامل نشده، پیام خوش‌آمدگویی نمایش بده
          if (step < 5) {
            const welcomeMessage: ChatMessage = {
              id: Date.now(),
              content: 'سلام! من هوش مصنوعی مامی‌لند هستم. لطفاً برای شروع کار اسم خودتون رو بگید.',
              role: 'assistant',
              created_at: new Date().toISOString()
            };
            setMessages([welcomeMessage]);
          }
        }
      } else {
        router.push('/');
      }
    } catch (error) {
      router.push('/');
    }
  };

  const getOnboardingStep = (profile: UserProfile): number => {
    if (!profile.name) return 0;
    if (profile.age === null) return 1;
    if (profile.is_pregnant === null) return 2;
    if (profile.is_pregnant && profile.pregnancy_week === null) return 3;
    if (!profile.medical_conditions) return 4;
    return 5;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      content: newMessage.trim(),
      role: 'user',
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // اگر در مرحله onboarding هستیم
      if (onboardingStep < 5) {
        const result = await processOnboarding(newMessage.trim(), onboardingStep);
        if (result.reply) {
          const assistantMsg: ChatMessage = {
            id: Date.now() + 1,
            content: result.reply,
            role: 'assistant',
            created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, assistantMsg]);
          setOnboardingStep(result.nextStep);
          
          // به‌روزرسانی پروفایل
          if (result.profile) {
            setUserProfile(result.profile);
            await updateProfile(result.profile);
          }
        }
      } else {
        // ارسال به هوش مصنوعی
        const response = await fetch('/api/chat/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: newMessage.trim(),
            messages: [...messages, userMsg]
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const assistantMsg: ChatMessage = {
            id: Date.now() + 1,
            content: data.reply,
            role: 'assistant',
            created_at: new Date().toISOString()
          };
          setMessages(prev => [...prev, assistantMsg]);
        } else {
          throw new Error('خطا در ارسال پیام');
        }
      }
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: Date.now() + 1,
        content: 'متأسفم، خطایی رخ داد. لطفاً دوباره تلاش کنید.',
        role: 'assistant',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    }

    setIsLoading(false);
  };

  const processOnboarding = async (content: string, step: number) => {
    const profile = { ...userProfile } as UserProfile;
    let reply: string | null = null;
    let nextStep = step;

    switch (step) {
      case 0:
        profile.name = content.trim();
        reply = `خوشبختم ${profile.name}! لطفاً سن خودتون رو بگید.`;
        nextStep = 1;
        break;
      case 1:
        const age = parseInt(content.trim(), 10);
        if (isNaN(age) || age < 15 || age > 60) {
          reply = 'لطفاً سن معتبری وارد کنید (۱۵ تا ۶۰).';
        } else {
          profile.age = age;
          reply = 'آیا در حال حاضر باردار هستید؟ لطفاً "بله" یا "خیر" پاسخ دهید.';
          nextStep = 2;
        }
        break;
      case 2:
        const pregnancyAnswer = content.trim().toLowerCase();
        if (pregnancyAnswer.includes('بله') || pregnancyAnswer.includes('آره') || pregnancyAnswer.includes('هستم')) {
          profile.is_pregnant = true;
          reply = 'لطفاً بگید هفته چندم بارداری هستید؟';
          nextStep = 3;
        } else if (pregnancyAnswer.includes('خیر') || pregnancyAnswer.includes('نه') || pregnancyAnswer.includes('نیستم')) {
          profile.is_pregnant = false;
          profile.pregnancy_week = 0;
          reply = 'آیا بیماری زمینه‌ای دارید؟ اگر دارید لطفاً توضیح دهید، در غیر این صورت "ندارم" بنویسید.';
          nextStep = 4;
        } else {
          reply = 'لطفاً با "بله" یا "خیر" پاسخ دهید.';
        }
        break;
      case 3:
        const week = parseInt(content.trim(), 10);
        if (isNaN(week) || week < 1 || week > 42) {
          reply = 'لطفاً یک عدد بین ۱ تا ۴۲ وارد کنید.';
        } else {
          profile.pregnancy_week = week;
          reply = 'آیا بیماری زمینه‌ای دارید؟ اگر دارید لطفاً توضیح دهید، در غیر این صورت "ندارم" بنویسید.';
          nextStep = 4;
        }
        break;
      case 4:
        profile.medical_conditions = content.trim();
        profile.is_complete = true;
        reply = 'عالی! اطلاعات شما ذخیره شد و می‌توانید ادامه سوالاتتون رو بپرسید.';
        nextStep = 5;
        break;
    }

    return { reply, profile, nextStep };
  };

  const updateProfile = async (profile: UserProfile) => {
    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      router.push('/');
    }
  };

  const clearChat = () => {
    setMessages([]);
    setOnboardingStep(0);
    setUserProfile({
      name: '',
      age: null,
      is_pregnant: null,
      pregnancy_week: null,
      medical_conditions: null,
      is_complete: false
    });
    
    const welcomeMessage: ChatMessage = {
      id: Date.now(),
      content: 'سلام! من هوش مصنوعی مامی‌لند هستم. لطفاً برای شروع کار اسم خودتون رو بگید.',
      role: 'assistant',
      created_at: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex flex-col" dir="rtl">
      {/* Desktop Sidebar */}
      <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-white border-l border-pink-100 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      } lg:relative lg:translate-x-0 lg:flex lg:flex-col`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-pink-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">چت‌های من</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 hover:bg-pink-50 rounded-lg transition-colors duration-200"
              >
                ✕
              </button>
            </div>
            
            <button
              onClick={clearChat}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl transition-all duration-200 hover:shadow-lg"
            >
              <Plus size={18} />
              چت جدید
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length > 0 ? (
              <div className="space-y-3">
                <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-pink-600" />
                      <span className="text-sm font-medium text-gray-800">چت فعلی</span>
                    </div>
                    <button
                      onClick={clearChat}
                      className="p-1 text-gray-500 hover:text-red-500 transition-colors duration-200"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    {messages.length} پیام • {new Date().toLocaleDateString('fa-IR')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="mx-auto text-gray-400 mb-3" size={32} />
                <p className="text-sm text-gray-600">هنوز چتی ندارید</p>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="p-4 border-t border-pink-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                <User className="text-white" size={18} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{userProfile?.name || user.username}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors duration-200"
              >
                <LogOut size={16} />
                خروج از حساب
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col lg:mr-80">
        {/* Chat Header */}
        <div className="bg-white border-b border-pink-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-pink-50 rounded-lg transition-colors duration-200"
              >
                <Menu size={20} />
              </button>
              
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
                <MessageCircle className="text-white" size={20} />
              </div>
              
              <div>
                <h1 className="font-semibold text-gray-800">چت‌بات مامی‌لند</h1>
                <p className="text-sm text-gray-600">
                  {userProfile?.is_complete && userProfile?.name 
                    ? `سلام ${userProfile.name}، دستیار هوشمند شما`
                    : 'دستیار هوشمند شما'
                  }
                </p>
              </div>
            </div>

            {userProfile?.is_complete && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-pink-50 rounded-xl">
                <User size={16} className="text-pink-600" />
                <span className="text-sm text-pink-700">
                  {userProfile.is_pregnant && userProfile.pregnancy_week && userProfile.pregnancy_week > 0 
                    ? `هفته ${userProfile.pregnancy_week}` 
                    : 'پروفایل تکمیل شده'
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="text-white" size={32} />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  {userProfile?.name ? `سلام ${userProfile.name}!` : 'به مامی‌لند خوش آمدید'}
                </h2>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  من دستیار هوشمند مامی‌لند هستم. آماده‌ام تا در زمینه‌های بارداری، مادری و خانواده به شما کمک کنم.
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' 
                        : 'bg-white border-2 border-pink-200 text-pink-600'
                    }`}>
                      {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    
                    <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-md'
                          : 'bg-white border border-pink-100 text-gray-800 rounded-bl-md'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      <span className="text-xs text-gray-500 mt-1 px-2">
                        {new Date(message.created_at).toLocaleTimeString('fa-IR', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: false 
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-pink-200 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div className="bg-white border border-pink-100 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-pink-100">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="bg-white rounded-2xl shadow-lg border border-pink-100 p-4">
              <div className="flex gap-3 items-end">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="پیام خود را اینجا بنویسید..."
                  className="flex-1 resize-none bg-transparent border-none outline-none text-sm leading-relaxed min-h-[20px] max-h-[120px] placeholder-gray-400"
                  rows={1}
                  disabled={isLoading}
                  dir="rtl"
                />
                
                <button
                  type="submit"
                  disabled={!newMessage.trim() || isLoading}
                  className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}