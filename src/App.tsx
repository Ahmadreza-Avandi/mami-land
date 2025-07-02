import React, { useState, useEffect } from 'react';
import { AccessCodeScreen } from './components/AccessCodeScreen';
import { LoginScreen } from './components/LoginScreen';
import { UserChatInterface } from './components/UserChatInterface';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { authService } from './services/authService';

type AppState = 'access-code' | 'login' | 'chat' | 'admin-login' | 'admin-dashboard';

function App() {
  const [appState, setAppState] = useState<AppState>('access-code');
  const [user, setUser] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    // بررسی وضعیت احراز هویت در بارگذاری اولیه
    const authState = authService.getAuthState();
    const adminState = authService.getAdminAuthState();

    if (adminState) {
      setAdmin(adminState);
      setAppState('admin-dashboard');
    } else if (authState.isAuthenticated && authState.user) {
      setUser(authState.user);
      setAppState('chat');
    }

    // بررسی اینکه آیا URL شامل /admin است
    if (window.location.pathname.includes('/admin')) {
      if (adminState) {
        setAppState('admin-dashboard');
      } else {
        setAppState('admin-login');
      }
    }
  }, []);

  // مدیریت تغییر URL برای admin
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.includes('/admin')) {
        const adminState = authService.getAdminAuthState();
        if (adminState) {
          setAppState('admin-dashboard');
        } else {
          setAppState('admin-login');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleValidAccessCode = () => {
    setAppState('login');
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setAppState('chat');
  };

  const handleAdminLogin = (adminData: any) => {
    setAdmin(adminData);
    setAppState('admin-dashboard');
    window.history.pushState({}, '', '/admin');
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setAppState('access-code');
  };

  const handleAdminLogout = () => {
    authService.adminLogout();
    setAdmin(null);
    setAppState('access-code');
    window.history.pushState({}, '', '/');
  };

  const handleBackToAccessCode = () => {
    setAppState('access-code');
  };

  // رندر کردن صفحه مناسب بر اساس وضعیت
  switch (appState) {
    case 'access-code':
      return <AccessCodeScreen onValidCode={handleValidAccessCode} />;
    
    case 'login':
      return <LoginScreen onLogin={handleLogin} onBack={handleBackToAccessCode} />;
    
    case 'chat':
      return <UserChatInterface user={user} onLogout={handleLogout} />;
    
    case 'admin-login':
      return <AdminLogin onLogin={handleAdminLogin} />;
    
    case 'admin-dashboard':
      return <AdminDashboard onLogout={handleAdminLogout} />;
    
    default:
      return <AccessCodeScreen onValidCode={handleValidAccessCode} />;
  }
}

export default App;