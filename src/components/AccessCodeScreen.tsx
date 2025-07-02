import React, { useState, useEffect } from 'react';
import { Shield, Lock } from 'lucide-react';
import { authService } from '../services/authService';

interface AccessCodeScreenProps {
  onValidCode: () => void;
}

export const AccessCodeScreen: React.FC<AccessCodeScreenProps> = ({ onValidCode }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setError('');

    // شبیه‌سازی تأخیر
    await new Promise(resolve => setTimeout(resolve, 800));

    if (authService.validateAccessCode(code)) {
      onValidCode();
    } else {
      setError('کد دسترسی نامعتبر است');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Shield className="text-white" size={32} />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              ورود به مامی‌لند
            </h1>
            
            <p className="text-gray-600 text-sm leading-relaxed">
              لطفاً کد دسترسی خود را وارد کنید
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                کد دسترسی
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="مثال: ABC123"
                  className="w-full pr-10 pl-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all duration-200 text-center font-mono text-lg tracking-wider"
                  maxLength={6}
                  disabled={isLoading}
                />
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!code.trim() || isLoading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  در حال بررسی...
                </div>
              ) : (
                'ادامه'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-pink-100">
            <p className="text-center text-xs text-gray-500">
              کد دسترسی را از ادمین دریافت کنید
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};