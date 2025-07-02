import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  User, 
  Mail, 
  Calendar, 
  Heart, 
  Baby, 
  FileText,
  Save,
  Edit
} from 'lucide-react';
import { authService } from '../services/authService';

interface UserSettingsProps {
  user: any;
  onBack: () => void;
  onLogout: () => void;
}

export const UserSettings: React.FC<UserSettingsProps> = ({ user, onBack, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user.profile?.name || '',
    age: user.profile?.age || '',
    isPregnant: user.profile?.isPregnant,
    pregnancyWeek: user.profile?.pregnancyWeek || '',
    medicalConditions: user.profile?.medicalConditions || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    
    const updatedProfile = {
      name: profile.name,
      age: profile.age ? parseInt(profile.age) : null,
      isPregnant: profile.isPregnant,
      pregnancyWeek: profile.pregnancyWeek ? parseInt(profile.pregnancyWeek) : null,
      medicalConditions: profile.medicalConditions,
      isComplete: !!(profile.name && profile.age && profile.isPregnant !== null && profile.medicalConditions)
    };

    // شبیه‌سازی تأخیر
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    authService.updateUserProfile(user.id, updatedProfile);
    
    setIsSaving(false);
    setIsEditing(false);
    setSaveMessage('اطلاعات با موفقیت ذخیره شد');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleCancel = () => {
    setProfile({
      name: user.profile?.name || '',
      age: user.profile?.age || '',
      isPregnant: user.profile?.isPregnant,
      pregnancyWeek: user.profile?.pregnancyWeek || '',
      medicalConditions: user.profile?.medicalConditions || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50" dir="rtl">
      <div className="container mx-auto max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-pink-50 transition-colors duration-200"
              >
                <ArrowRight className="text-gray-600" size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">تنظیمات حساب کاربری</h1>
                <p className="text-sm text-gray-600">مدیریت اطلاعات شخصی</p>
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-pink-600 hover:bg-pink-50 rounded-xl transition-colors duration-200"
              >
                <Edit size={16} />
                ویرایش
              </button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {saveMessage && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-700 text-center">{saveMessage}</p>
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">اطلاعات شخصی</h2>
          
          <div className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} />
                ایمیل
              </label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600">
                {user.email}
              </div>
              <p className="text-xs text-gray-500 mt-1">ایمیل قابل تغییر نیست</p>
            </div>

            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <User size={16} />
                نام
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all duration-200"
                  placeholder="نام خود را وارد کنید"
                />
              ) : (
                <div className="px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl">
                  {profile.name || 'وارد نشده'}
                </div>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} />
                سن
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all duration-200"
                  placeholder="سن خود را وارد کنید"
                  min="15"
                  max="60"
                />
              ) : (
                <div className="px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl">
                  {profile.age ? `${profile.age} سال` : 'وارد نشده'}
                </div>
              )}
            </div>

            {/* Pregnancy Status */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Heart size={16} />
                وضعیت بارداری
              </label>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="isPregnant"
                        checked={profile.isPregnant === true}
                        onChange={() => setProfile({ ...profile, isPregnant: true })}
                        className="text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-sm">باردار هستم</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="isPregnant"
                        checked={profile.isPregnant === false}
                        onChange={() => setProfile({ ...profile, isPregnant: false, pregnancyWeek: '' })}
                        className="text-pink-500 focus:ring-pink-500"
                      />
                      <span className="text-sm">باردار نیستم</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl">
                  {profile.isPregnant === true ? 'باردار' : 
                   profile.isPregnant === false ? 'غیر باردار' : 'وارد نشده'}
                </div>
              )}
            </div>

            {/* Pregnancy Week */}
            {(profile.isPregnant === true || (isEditing && profile.isPregnant === true)) && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Baby size={16} />
                  هفته بارداری
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={profile.pregnancyWeek}
                    onChange={(e) => setProfile({ ...profile, pregnancyWeek: e.target.value })}
                    className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="هفته بارداری را وارد کنید"
                    min="1"
                    max="42"
                  />
                ) : (
                  <div className="px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl">
                    {profile.pregnancyWeek ? `هفته ${profile.pregnancyWeek}` : 'وارد نشده'}
                  </div>
                )}
              </div>
            )}

            {/* Medical Conditions */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText size={16} />
                سابقه پزشکی
              </label>
              {isEditing ? (
                <textarea
                  value={profile.medicalConditions}
                  onChange={(e) => setProfile({ ...profile, medicalConditions: e.target.value })}
                  className="w-full px-4 py-3 border border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                  placeholder="سابقه پزشکی خود را شرح دهید یا 'ندارم' بنویسید"
                  rows={3}
                />
              ) : (
                <div className="px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl min-h-[80px]">
                  {profile.medicalConditions || 'وارد نشده'}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    ذخیره تغییرات
                  </>
                )}
              </button>
              
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl transition-colors duration-200 disabled:opacity-50"
              >
                انصراف
              </button>
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">عملیات حساب</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-800">تاریخ عضویت</p>
                <p className="text-sm text-gray-600">{user.joinDate.toLocaleDateString('fa-IR')}</p>
              </div>
            </div>
            
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors duration-200"
            >
              خروج از حساب کاربری
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};