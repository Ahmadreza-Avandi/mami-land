import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';

interface LoginScreenProps {
  onLogin: (user: any) => void;
  onBack: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const user = await authService.login(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('ایمیل یا رمز عبور نامعتبر است');
      }
    } catch {
      setError('خطایی رخ داد، دوباره تلاش کنید');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-8">
          <div className="flex items-center mb-6">
            <button
              onClick={onBack}
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-pink-50 transition-colors duration-200"
            >
              <ArrowRight className="text-gray-600" size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 mr-3">ورود به حساب کاربری</h1>
          </div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="text-white" size={24} />
            </div>
            
            <p className="text-gray-600 text-sm leading-relaxed">
              وارد حساب کاربری خود شوید یا حساب جدید ایجاد کنید
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ایمیل
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="example@email.com"
                  className="w-full pr-10 pl-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all duration-200"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رمز عبور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="حداقل ۶ کاراکتر"
                  className="w-full pr-10 pl-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all duration-200"
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!email.trim() || !password.trim() || isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  در حال ورود...
                </div>
              ) : (
                'ورود / ثبت نام'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-pink-100">
            <p className="text-center text-xs text-gray-500 leading-relaxed">
              اگر حساب کاربری ندارید، با وارد کردن ایمیل و رمز عبور، حساب جدید ایجاد می‌شود
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};