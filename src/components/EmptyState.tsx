import React from 'react';
import { MessageCircle, Heart, Baby, User } from 'lucide-react';

interface EmptyStateProps {
  onSampleClick: (message: string) => void;
  isOnboarding: boolean;
  userProfile: {
    name: string;
    age: number | null;
    pregnancyWeek: number | null;
    medicalConditions: string;
    isComplete: boolean;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSampleClick, isOnboarding, userProfile }) => {
  const sampleQuestions = [
    'نکات مهم دوران بارداری چیست؟',
    'چگونه از نوزادم مراقبت کنم؟',
    'تغذیه مناسب در بارداری چگونه باشد؟',
    'علائم خطرناک بارداری کدامند؟',
  ];

  if (isOnboarding) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <User className="text-white" size={32} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            راه‌اندازی حساب کاربری
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            برای ارائه بهترین مشاوره، لطفاً چند سوال ساده را پاسخ دهید
          </p>

          <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="text-sm text-gray-700">نام شما</span>
              {userProfile.name && <span className="text-green-600 text-sm">✓</span>}
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 ${userProfile.age ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center text-sm font-bold`}>
                2
              </div>
              <span className="text-sm text-gray-700">سن شما</span>
              {userProfile.age && <span className="text-green-600 text-sm">✓</span>}
            </div>
            
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 ${userProfile.pregnancyWeek !== null ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center text-sm font-bold`}>
                3
              </div>
              <span className="text-sm text-gray-700">هفته بارداری</span>
              {userProfile.pregnancyWeek !== null && <span className="text-green-600 text-sm">✓</span>}
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 ${userProfile.medicalConditions ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'} rounded-full flex items-center justify-center text-sm font-bold`}>
                4
              </div>
              <span className="text-sm text-gray-700">سابقه پزشکی</span>
              {userProfile.medicalConditions && <span className="text-green-600 text-sm">✓</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
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

        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 mb-4">نمونه سوالات:</p>
          {sampleQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => onSampleClick(question)}
              className="w-full text-right p-4 bg-white hover:bg-pink-50 border border-pink-100 hover:border-pink-200 rounded-xl transition-all duration-200 text-sm text-gray-700 hover:text-pink-700"
            >
              {question}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mt-8 text-pink-500">
          <Heart size={20} className="animate-pulse" />
          <Baby size={20} />
          <Heart size={20} className="animate-pulse" />
        </div>
      </div>
    </div>
  );
};