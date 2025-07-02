import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageSquare, 
  Key, 
  Copy, 
  RefreshCw, 
  Search,
  Trash2,
  Eye,
  LogOut,
  Settings
} from 'lucide-react';
import { authService } from '../services/authService';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('access-code');
  const [accessCode, setAccessCode] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // بارگذاری کد دسترسی فعلی
    const currentCode = authService.getCurrentAccessCode();
    if (currentCode) {
      setAccessCode(currentCode);
    } else {
      generateNewCode();
    }

    // بارگذاری کاربران
    loadUsers();
  }, []);

  const generateNewCode = () => {
    const newCode = authService.generateAccessCode();
    setAccessCode(newCode);
  };

  const loadUsers = () => {
    const allUsers = authService.getUsers();
    setUsers(allUsers);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = accessCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const deleteUser = (userId: string) => {
    if (confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
      authService.deleteUser(userId);
      loadUsers();
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'access-code', label: 'کد دسترسی', icon: Key },
    { id: 'users', label: 'کاربران', icon: Users },
    { id: 'chats', label: 'چت‌ها', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50" dir="rtl">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center">
                <Settings className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">پنل مدیریت مامی‌لند</h1>
                <p className="text-sm text-gray-600">مدیریت سیستم و کاربران</p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors duration-200"
            >
              <LogOut size={16} />
              خروج
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 mb-6">
          <div className="flex border-b border-pink-100">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50'
                      : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* Access Code Tab */}
            {activeTab === 'access-code' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">کد دسترسی فعلی</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    این کد برای ورود کاربران جدید استفاده می‌شود
                  </p>
                </div>

                <div className="bg-pink-50 border border-pink-200 rounded-2xl p-8">
                  <div className="text-center">
                    <div className="text-4xl font-mono font-bold text-pink-600 mb-4 tracking-wider">
                      {accessCode}
                    </div>
                    
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-pink-200 hover:bg-pink-50 rounded-xl transition-colors duration-200"
                      >
                        <Copy size={16} />
                        {copied ? 'کپی شد!' : 'کپی کردن'}
                      </button>
                      
                      <button
                        onClick={generateNewCode}
                        className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition-colors duration-200"
                      >
                        <RefreshCw size={16} />
                        تولید کد جدید
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-800 text-center">
                    ⚠️ با تولید کد جدید، کد قبلی غیرفعال می‌شود
                  </p>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">
                    مدیریت کاربران ({users.length})
                  </h2>
                  
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="جستجو در کاربران..."
                      className="pr-10 pl-4 py-2 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="mx-auto text-gray-400 mb-3" size={48} />
                      <p className="text-gray-600">
                        {searchTerm ? 'کاربری یافت نشد' : 'هنوز کاربری ثبت نام نکرده'}
                      </p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="bg-pink-50 border border-pink-200 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center">
                              <Users size={18} />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">{user.name}</h3>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <p className="text-xs text-gray-500">
                                عضویت: {user.joinDate.toLocaleDateString('fa-IR')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-600 hover:text-pink-600 hover:bg-white rounded-lg transition-colors duration-200">
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => deleteUser(user.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-white rounded-lg transition-colors duration-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Chats Tab */}
            {activeTab === 'chats' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800">نظارت بر چت‌ها</h2>
                
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600">
                    این بخش در نسخه‌های آینده فعال خواهد شد
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};