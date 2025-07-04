'use client';

import { useState, useEffect } from 'react';
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
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircleMore
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AccessCode {
  id: number;
  code: string;
  created_at: string;
  expires_at: string;
  is_used: boolean;
  used_by: number | null;
  used_at: string | null;
}

interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  profile: {
    name: string;
    age: number | null;
    is_pregnant: boolean | null;
    pregnancy_week: number | null;
    medical_conditions: string | null;
    is_complete: boolean;
  };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('access-code');
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/me');
      if (!response.ok) {
        router.push('/admin');
        return;
      }
      
      loadAccessCodes();
      loadUsers();
    } catch (error) {
      router.push('/admin');
    }
  };

  const loadAccessCodes = async () => {
    try {
      const response = await fetch('/api/admin/access-codes');
      if (response.ok) {
        const data = await response.json();
        setAccessCodes(data.codes);
      }
    } catch (error) {
      console.error('Error loading access codes:', error);
    }
    setIsLoading(false);
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const generateNewCode = async () => {
    try {
      const response = await fetch('/api/admin/access-codes', {
        method: 'POST',
      });
      if (response.ok) {
        loadAccessCodes();
      }
    } catch (error) {
      console.error('Error generating code:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(text);
      setTimeout(() => setCopied(''), 2000);
    }
  };

  const deleteAccessCode = async (code: string) => {
    if (confirm('آیا از حذف این کد اطمینان دارید؟')) {
      try {
        const response = await fetch(`/api/admin/access-codes/${code}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          loadAccessCodes();
        }
      } catch (error) {
        console.error('Error deleting code:', error);
      }
    }
  };

  const deleteUser = async (userId: number) => {
    if (confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          loadUsers();
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      router.push('/');
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.profile?.name && user.profile.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const validCodes = accessCodes.filter(code => 
    !code.is_used && new Date(code.expires_at) > new Date()
  );

  const tabs = [
    { id: 'access-code', label: 'کدهای دسترسی', icon: Key },
    { id: 'users', label: 'کاربران', icon: Users },
    { id: 'admin-chat', label: 'چت ادمین', icon: MessageCircleMore },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
              onClick={handleLogout}
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
            {/* Access Codes Tab */}
            {activeTab === 'access-code' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">مدیریت کدهای دسترسی</h2>
                  <button
                    onClick={generateNewCode}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl transition-colors duration-200"
                  >
                    <RefreshCw size={16} />
                    تولید کد جدید
                  </button>
                </div>

                {/* Valid Codes */}
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-green-800 mb-4">کدهای معتبر ({validCodes.length})</h3>
                  
                  {validCodes.length === 0 ? (
                    <p className="text-green-600 text-center py-4">هیچ کد معتبری وجود ندارد</p>
                  ) : (
                    <div className="grid gap-3">
                      {validCodes.map((code) => (
                        <div key={code.id} className="bg-white border border-green-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl font-mono font-bold text-green-600">
                                {code.code}
                              </div>
                              <div className="text-sm text-gray-600">
                                <p>ایجاد: {new Date(code.created_at).toLocaleDateString('fa-IR')}</p>
                                <p>انقضا: {new Date(code.expires_at).toLocaleDateString('fa-IR')}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => copyToClipboard(code.code)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors duration-200"
                              >
                                <Copy size={16} />
                              </button>
                              <button
                                onClick={() => deleteAccessCode(code.code)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          {copied === code.code && (
                            <p className="text-green-600 text-sm mt-2">کپی شد!</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* All Codes History */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">تاریخچه کدها</h3>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {accessCodes.map((code) => (
                      <div key={code.id} className={`border rounded-xl p-4 ${
                        code.is_used ? 'bg-red-50 border-red-200' : 
                        new Date(code.expires_at) < new Date() ? 'bg-yellow-50 border-yellow-200' : 
                        'bg-white border-gray-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-mono font-bold">
                              {code.code}
                            </div>
                            <div className="flex items-center gap-2">
                              {code.is_used ? (
                                <XCircle className="text-red-500" size={16} />
                              ) : new Date(code.expires_at) < new Date() ? (
                                <Clock className="text-yellow-500" size={16} />
                              ) : (
                                <CheckCircle className="text-green-500" size={16} />
                              )}
                              <span className="text-sm text-gray-600">
                                {code.is_used ? 'استفاده شده' : 
                                 new Date(code.expires_at) < new Date() ? 'منقضی شده' : 'معتبر'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {new Date(code.created_at).toLocaleDateString('fa-IR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                            <div className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center">
                              <Users size={20} />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-800">
                                {user.profile?.name || user.username}
                              </h3>
                              <p className="text-sm text-gray-600">{user.email}</p>
                              <p className="text-xs text-gray-500">
                                عضویت: {new Date(user.created_at).toLocaleDateString('fa-IR')}
                              </p>
                              {user.profile?.is_complete && (
                                <div className="flex items-center gap-4 mt-2 text-xs">
                                  {user.profile.age && (
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                      {user.profile.age} ساله
                                    </span>
                                  )}
                                  {user.profile.is_pregnant !== null && (
                                    <span className={`px-2 py-1 rounded ${
                                      user.profile.is_pregnant 
                                        ? 'bg-pink-100 text-pink-700' 
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {user.profile.is_pregnant ? 'باردار' : 'غیر باردار'}
                                    </span>
                                  )}
                                  {user.profile.pregnancy_week && user.profile.pregnancy_week > 0 && (
                                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                      هفته {user.profile.pregnancy_week}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setSelectedUser(user)}
                              className="p-2 text-gray-600 hover:text-pink-600 hover:bg-white rounded-lg transition-colors duration-200"
                            >
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

            {/* Admin Chat Tab */}
            {activeTab === 'admin-chat' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800">چت ادمین</h2>
                
                <div className="bg-pink-50 border border-pink-200 rounded-2xl p-6">
                  <div className="text-center">
                    <MessageCircleMore className="mx-auto text-pink-500 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">چت زنده با کاربران</h3>
                    <p className="text-gray-600 mb-6">
                      در این بخش می‌توانید مستقیماً با کاربران چت کنید
                    </p>
                    
                    <div className="grid gap-4">
                      {users.filter(u => u.profile?.is_complete).map((user) => (
                        <div key={user.id} className="bg-white border border-pink-200 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center">
                                <Users size={18} />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-800">{user.profile.name}</h4>
                                <p className="text-sm text-gray-600">{user.email}</p>
                              </div>
                            </div>
                            
                            <button className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors duration-200">
                              شروع چت
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800">جزئیات کاربر</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">نام:</label>
                  <p className="text-gray-800">{selectedUser.profile?.name || selectedUser.username}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">ایمیل:</label>
                  <p className="text-gray-800">{selectedUser.email}</p>
                </div>
                
                {selectedUser.profile?.age && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">سن:</label>
                    <p className="text-gray-800">{selectedUser.profile.age} سال</p>
                  </div>
                )}
                
                {selectedUser.profile?.is_pregnant !== null && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">وضعیت بارداری:</label>
                    <p className="text-gray-800">
                      {selectedUser.profile.is_pregnant ? 'باردار' : 'غیر باردار'}
                    </p>
                  </div>
                )}
                
                {selectedUser.profile?.pregnancy_week && selectedUser.profile.pregnancy_week > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">هفته بارداری:</label>
                    <p className="text-gray-800">هفته {selectedUser.profile.pregnancy_week}</p>
                  </div>
                )}
                
                {selectedUser.profile?.medical_conditions && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">سابقه پزشکی:</label>
                    <p className="text-gray-800">{selectedUser.profile.medical_conditions}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-600">تاریخ عضویت:</label>
                  <p className="text-gray-800">{new Date(selectedUser.created_at).toLocaleDateString('fa-IR')}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}