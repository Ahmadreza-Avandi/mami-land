import React from 'react';
import { MessageCircle, Trash2, User } from 'lucide-react';

interface ChatHeaderProps {
  onClearChat: () => void;
  messageCount: number;
  userProfile: {
    name: string;
    age: number | null;
    pregnancyWeek: number | null;
    medicalConditions: string;
    isComplete: boolean;
  };
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClearChat, messageCount, userProfile }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
            <MessageCircle className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">چت‌بات مامی‌لند</h1>
            <p className="text-sm text-gray-600">
              {userProfile.isComplete && userProfile.name 
                ? `سلام ${userProfile.name}، دستیار هوشمند شما`
                : 'دستیار هوشمند شما'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {userProfile.isComplete && (
            <div className="flex items-center gap-2 px-3 py-2 bg-pink-50 rounded-xl">
              <User size={16} className="text-pink-600" />
              <span className="text-sm text-pink-700">
                {userProfile.pregnancyWeek && userProfile.pregnancyWeek > 0 
                  ? `هفته ${userProfile.pregnancyWeek}` 
                  : 'پروفایل تکمیل شده'
                }
              </span>
            </div>
          )}
          
          {messageCount > 0 && (
            <button
              onClick={onClearChat}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors duration-200"
            >
              <Trash2 size={16} />
              شروع مجدد
            </button>
          )}
        </div>
      </div>
    </div>
  );
};