import { useState, useEffect, useCallback } from 'react';
import { ChatMessage, ChatState, UserProfile } from '../types/chat';
import { chatService } from '../services/chatService';
import { authService } from '../services/authService';

const ONBOARDING_MESSAGES = {
  welcome: 'سلام! من هوش مصنوعی مامی‌لند هستم. لطفاً برای شروع کار اسم خودتون رو بگید.',
  askAge: (name: string) => `خوشبختم ${name}! لطفاً سن خودتون رو بگید.`,
  askPregnancy: 'آیا در حال حاضر باردار هستید؟ لطفاً "بله" یا "خیر" پاسخ دهید.',
  askPregnancyWeek: 'لطفاً بگید هفته چندم بارداری هستید؟',
  askMedicalConditions: 'آیا بیماری زمینه‌ای دارید؟ اگر دارید لطفاً توضیح دهید، در غیر این صورت "ندارم" بنویسید.',
  complete: 'عالی! اطلاعات شما ذخیره شد و می‌توانید ادامه سوالاتتون رو بپرسید.',
};

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    userProfile: {
      name: '',
      age: null,
      isPregnant: null,
      pregnancyWeek: null,
      medicalConditions: '',
      isComplete: false,
    },
    onboardingStep: 0,
  });

  // تعیین قدم فعلی فرایند onboarding
  const getOnboardingStep = (p: UserProfile): number => {
    if (!p.name) return 0;
    if (p.age === null) return 1;
    if (p.isPregnant === null) return 2;
    if (p.isPregnant && p.pregnancyWeek === null) return 3;
    if (!p.medicalConditions) return 4;
    return 5;
  };

  // واکشی اولیه‌ی تاریخچه و پروفایل
  useEffect(() => {
    const msgs = chatService.loadChatHistory();
    const prof = chatService.loadUserProfile();
    const authState = authService.getAuthState();
    
    // اگر پروفایل در authService موجود است، از آن استفاده کن
    const finalProfile = authState.user?.profile?.isComplete ? authState.user.profile : prof;
    
    setState(s => ({
      ...s,
      messages: msgs,
      userProfile: finalProfile,
      onboardingStep: finalProfile.isComplete ? 5 : getOnboardingStep(finalProfile),
    }));
    
    if (msgs.length === 0 && !finalProfile.isComplete) {
      const welcome: ChatMessage = {
        id: Date.now().toString(),
        content: ONBOARDING_MESSAGES.welcome,
        role: 'assistant',
        timestamp: new Date(),
      };
      setState(s => ({ ...s, messages: [welcome] }));
    }
  }, []);

  // ذخیره خودکار تاریخچه و پروفایل
  useEffect(() => {
    if (state.messages.length) chatService.saveChatHistory(state.messages);
  }, [state.messages]);

  useEffect(() => {
    chatService.saveUserProfile(state.userProfile);
    // به‌روزرسانی پروفایل در authService
    const authState = authService.getAuthState();
    if (authState.user) {
      authService.updateUserProfile(authState.user.id, state.userProfile);
    }
  }, [state.userProfile]);

  // پردازش مراحل onboarding
  const processOnboarding = useCallback(
    (content: string, step: number) => {
      const prof = { ...state.userProfile };
      let reply: string | null = null;
      let nextStep = step;

      switch (step) {
        case 0:
          prof.name = content.trim();
          reply = ONBOARDING_MESSAGES.askAge(prof.name);
          nextStep = 1;
          break;
        case 1:
          const age = parseInt(content.trim(), 10);
          if (isNaN(age) || age < 15 || age > 60) {
            reply = 'لطفاً سن معتبری وارد کنید (۱۵ تا ۶۰).';
          } else {
            prof.age = age;
            reply = ONBOARDING_MESSAGES.askPregnancy;
            nextStep = 2;
          }
          break;
        case 2:
          const pregnancyAnswer = content.trim().toLowerCase();
          if (pregnancyAnswer.includes('بله') || pregnancyAnswer.includes('آره') || pregnancyAnswer.includes('هستم')) {
            prof.isPregnant = true;
            reply = ONBOARDING_MESSAGES.askPregnancyWeek;
            nextStep = 3;
          } else if (pregnancyAnswer.includes('خیر') || pregnancyAnswer.includes('نه') || pregnancyAnswer.includes('نیستم')) {
            prof.isPregnant = false;
            prof.pregnancyWeek = 0;
            reply = ONBOARDING_MESSAGES.askMedicalConditions;
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
            prof.pregnancyWeek = week;
            reply = ONBOARDING_MESSAGES.askMedicalConditions;
            nextStep = 4;
          }
          break;
        case 4:
          prof.medicalConditions = content.trim();
          prof.isComplete = true;
          reply = ONBOARDING_MESSAGES.complete;
          nextStep = 5;
          break;
      }

      return { reply, prof, nextStep };
    },
    [state.userProfile]
  );

  // تابع ارسال پیام
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        content: content.trim(),
        role: 'user',
        timestamp: new Date(),
      };
      setState(s => ({
        ...s,
        messages: [...s.messages, userMsg],
        isLoading: true,
        error: null,
      }));

      try {
        let assistantMsg: ChatMessage;
        if (state.onboardingStep < 5) {
          const { reply, prof, nextStep } = processOnboarding(content, state.onboardingStep);
          if (reply) {
            assistantMsg = {
              id: (Date.now() + 1).toString(),
              content: reply,
              role: 'assistant',
              timestamp: new Date(),
            };
            setState(s => ({
              ...s,
              messages: [...s.messages, assistantMsg],
              userProfile: prof,
              onboardingStep: nextStep,
              isLoading: false,
            }));
          }
        } else {
          const all = [...state.messages, userMsg];
          const aiReply = await chatService.sendMessage(all, state.userProfile);
          assistantMsg = {
            id: (Date.now() + 1).toString(),
            content: aiReply,
            role: 'assistant',
            timestamp: new Date(),
          };
          setState(s => ({
            ...s,
            messages: [...s.messages, assistantMsg],
            isLoading: false,
          }));
        }
      } catch {
        setState(s => ({ ...s, isLoading: false, error: 'خطایی رخ داد، دوباره تلاش کنید.' }));
      }
    },
    [state, processOnboarding]
  );

  // پاک‌کردن چت و بازنشانی onboarding
  const clearChat = useCallback(() => {
    const welcome: ChatMessage = {
      id: Date.now().toString(),
      content: ONBOARDING_MESSAGES.welcome,
      role: 'assistant',
      timestamp: new Date(),
    };
    setState({
      messages: [welcome],
      isLoading: false,
      error: null,
      userProfile: { name: '', age: null, isPregnant: null, pregnancyWeek: null, medicalConditions: '', isComplete: false },
      onboardingStep: 0,
    });
    chatService.clearChatHistory();
  }, []);

  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: null }));
  }, []);

  return {
    ...state,
    sendMessage,
    clearChat,
    clearError,
  };
};