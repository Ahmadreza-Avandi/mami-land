import React, { useState, useRef, useEffect } from 'react';
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
  Home,
  MessageSquare
} from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { ChatInput } from './ChatInput';
import { ErrorMessage } from './ErrorMessage';
import { UserSettings } from './UserSettings';

interface UserChatInterfaceProps {
  user: any;
  onLogout: () => void;
}

export const UserChatInterface: React.FC<UserChatInterfaceProps> = ({ user, onLogout }) => {
  const { messages, isLoading, error, sendMessage, clearChat, clearError, userProfile, onboardingStep } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'settings'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSampleClick = (message: string) => {
    sendMessage(message);
  };

  const isOnboarding = onboardingStep < 5;

  const menuItems = [
    { id: 'chat', label: 'چت', icon: MessageSquare },
    { id: 'settings', label: 'تنظیمات', icon: Settings },
  ];

  if (currentView === 'settings') {
    return <UserSettings user={user} onBack={() => setCurrentView('chat')} onLogout={onLogout} />;
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
                <p className="font-medium text-gray-800">{userProfile.name || user.name}</p>
                <p className="text-xs text-gray-600">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => setCurrentView('settings')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors duration-200"
              >
                <Settings size={16} />
                تنظیمات
              </button>
              
              <button
                onClick={onLogout}
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
                  {userProfile.isComplete && userProfile.name 
                    ? `سلام ${userProfile.name}، دستیار هوشمند شما`
                    : 'دستیار هوشمند شما'
                  }
                </p>
              </div>
            </div>

            {userProfile.isComplete && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-pink-50 rounded-xl">
                <User size={16} className="text-pink-600" />
                <span className="text-sm text-pink-700">
                  {userProfile.isPregnant && userProfile.pregnancyWeek && userProfile.pregnancyWeek > 0 
                    ? `هفته ${userProfile.pregnancyWeek}` 
                    : 'پروفایل تکمیل شده'
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <ErrorMessage message={error} onClose={clearError} />
          )}
          
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="text-white" size={32} />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-3">
                  {userProfile.name ? `سلام ${userProfile.name}!` : 'به مامی‌لند خوش آمدید'}
                </h2>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  من دستیار هوشمند مامی‌لند هستم. آماده‌ام تا در زمینه‌های بارداری، مادری و خانواده به شما کمک کنم.
                </p>

                {!isOnboarding && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 mb-4">نمونه سوالات:</p>
                    {[
                      'نکات مهم دوران بارداری چیست؟',
                      'چگونه از نوزادم مراقبت کنم؟',
                      'تغذیه مناسب در بارداری چگونه باشد؟',
                      'علائم خطرناک بارداری کدامند؟',
                    ].map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSampleClick(question)}
                        className="w-full text-right p-4 bg-white hover:bg-pink-50 border border-pink-100 hover:border-pink-200 rounded-xl transition-all duration-200 text-sm text-gray-700 hover:text-pink-700"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
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
                        {message.timestamp.toLocaleTimeString('fa-IR', { 
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
            <ChatInput 
              onSendMessage={sendMessage}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 px-4 py-2 z-30">
        <div className="flex justify-around">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as 'chat' | 'settings')}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  currentView === item.id
                    ? 'text-pink-600 bg-pink-50'
                    : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};