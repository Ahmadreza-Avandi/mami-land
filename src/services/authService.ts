import { User, AuthState, AdminUser } from '../types/auth';

class AuthService {
  private readonly ACCESS_CODE_KEY = 'mamiland_access_code';
  private readonly AUTH_STATE_KEY = 'mamiland_auth_state';
  private readonly ADMIN_AUTH_KEY = 'mamiland_admin_auth';
  private readonly USERS_KEY = 'mamiland_users';

  // تولید کد دسترسی تصادفی
  generateAccessCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    localStorage.setItem(this.ACCESS_CODE_KEY, result);
    return result;
  }

  // دریافت کد دسترسی فعلی
  getCurrentAccessCode(): string | null {
    return localStorage.getItem(this.ACCESS_CODE_KEY);
  }

  // بررسی صحت کد دسترسی
  validateAccessCode(code: string): boolean {
    const currentCode = this.getCurrentAccessCode();
    return currentCode === code.toUpperCase();
  }

  // ورود کاربر
  async login(email: string, password: string): Promise<User | null> {
    // شبیه‌سازی تأخیر شبکه
    await new Promise(resolve => setTimeout(resolve, 1000));

    // بررسی کاربران موجود
    const users = this.getUsers();
    const user = users.find(u => u.email === email);

    if (user) {
      // در حالت واقعی، رمز عبور باید هش شده باشد
      const authState: AuthState = {
        isAuthenticated: true,
        user,
        accessCode: this.getCurrentAccessCode()
      };
      localStorage.setItem(this.AUTH_STATE_KEY, JSON.stringify(authState));
      return user;
    }

    // اگر کاربر وجود ندارد، یکی جدید ایجاد کن
    if (email && password.length >= 6) {
      const newUser: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        joinDate: new Date()
      };
      
      users.push(newUser);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      
      const authState: AuthState = {
        isAuthenticated: true,
        user: newUser,
        accessCode: this.getCurrentAccessCode()
      };
      localStorage.setItem(this.AUTH_STATE_KEY, JSON.stringify(authState));
      return newUser;
    }

    return null;
  }

  // ورود ادمین
  async adminLogin(username: string, password: string): Promise<AdminUser | null> {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (username === 'admin' && password === 'admin123') {
      const adminUser: AdminUser = {
        username: 'admin',
        isAdmin: true
      };
      localStorage.setItem(this.ADMIN_AUTH_KEY, JSON.stringify(adminUser));
      return adminUser;
    }

    return null;
  }

  // دریافت وضعیت احراز هویت
  getAuthState(): AuthState {
    try {
      const stored = localStorage.getItem(this.AUTH_STATE_KEY);
      if (!stored) {
        return { isAuthenticated: false, user: null, accessCode: null };
      }
      
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        user: parsed.user ? {
          ...parsed.user,
          joinDate: new Date(parsed.user.joinDate)
        } : null
      };
    } catch {
      return { isAuthenticated: false, user: null, accessCode: null };
    }
  }

  // دریافت وضعیت ادمین
  getAdminAuthState(): AdminUser | null {
    try {
      const stored = localStorage.getItem(this.ADMIN_AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // خروج کاربر
  logout(): void {
    localStorage.removeItem(this.AUTH_STATE_KEY);
  }

  // خروج ادمین
  adminLogout(): void {
    localStorage.removeItem(this.ADMIN_AUTH_KEY);
  }

  // دریافت لیست کاربران
  getUsers(): User[] {
    try {
      const stored = localStorage.getItem(this.USERS_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((user: any) => ({
        ...user,
        joinDate: new Date(user.joinDate)
      }));
    } catch {
      return [];
    }
  }

  // حذف کاربر
  deleteUser(userId: string): void {
    const users = this.getUsers().filter(u => u.id !== userId);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }
}

export const authService = new AuthService();