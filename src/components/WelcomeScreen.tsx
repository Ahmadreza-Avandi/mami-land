import React from 'react';
import { Heart, Baby, Users, ArrowLeft } from 'lucide-react';

interface WelcomeScreenProps {
  onNewUser: () => void;
  onExistingUser: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onNewUser, onExistingUser }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Heart className="text-white" size={32} />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              به مامی‌لند خوش آمدید
            </h1>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              دستیار هوشمند شما در مسیر مادری
            </p>

            <div className="flex items-center justify-center gap-4 mb-8 text-pink-500">
              <Heart size={20} className="animate-pulse" />
              <Baby size={20} />
              <Users size={20} />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 text-center mb-6">
              حساب کاربری دارید؟
            </h2>

            <button
              onClick={onExistingUser}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              بله، وارد حساب کاربری می‌شوم
              <ArrowLeft size={18} />
            </button>

            <button
              onClick={onNewUser}
              className="w-full bg-white hover:bg-pink-50 border-2 border-pink-200 hover:border-pink-300 text-pink-600 py-3 rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              خیر، حساب جدید می‌سازم
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-pink-100">
            <p className="text-center text-xs text-gray-500 leading-relaxed">
              مامی‌لند همراه شما در تمام مراحل مادری
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};