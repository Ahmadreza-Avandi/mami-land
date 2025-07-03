import { User, AuthState, AdminUser, AccessCode } from '../types/auth';

class AuthService {
  private readonly AUTH_STATE_KEY = 'mamiland_auth_state';
  private readonly ADMIN_AUTH_KEY = 'mamiland_admin_auth';
  private readonly ACCESS_CODES_KEY = 'mamiland_access_codes';
  private readonly USERS_KEY = 'mamiland_users';

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // ایجاد کدهای دسترسی پیش‌فرض
    if (!localStorage.getItem(this.ACCESS_CODES_KEY)) {
      const defaultCodes: AccessCode[] = [
        {
          code: 'ABC123',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          isUsed: false,
          usedBy: null,
          usedAt: null
        },
        {
          code: 'XYZ789',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          isUsed: false,
          usedBy: null,
          usedAt: null
        },
        {
          code: 'DEF456',
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          isUsed: false,
          usedBy: null,
          usedAt: null
        }
      ];
      localStorage.setItem(this.ACCESS_CODES_KEY, JSON.stringify(defaultCodes));
    }

    // ایجاد لیست کاربران خالی
    if (!localStorage.getItem(this.USERS_KEY)) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify([]));
    }
  }

  // تولید کد دسترسی
  generateAccessCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newCode: AccessCode = {
      code,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isUsed: false,
      usedBy: null,
      usedAt: null
    };

    const codes = this.getAccessCodes();
    codes.push(newCode);
    localStorage.setItem(this.ACCESS_CODES_KEY, JSON.stringify(codes));

    return code;
  }

  // دریافت تمام کدهای دسترسی
  getAccessCodes(): AccessCode[] {
    try {
      const stored = localStorage.getItem(this.ACCESS_CODES_KEY);
      if (!stored) return [];
      
      const codes = JSON.parse(stored);
      return codes.map((code: any) => ({
        ...code,
        createdAt: new Date(code.createdAt),
        expiresAt: new Date(code.expiresAt),
        usedAt: code.usedAt ? new Date(code.usedAt) : null
      }));
    } catch {
      return [];
    }
  }

  // بررسی صحت کد دسترسی
  validateAccessCode(code: string): boolean {
    const codes = this.getAccessCodes();
    const foundCode = codes.find(c => 
      c.code === code.toUpperCase() && 
      !c.isUsed && 
      c.expiresAt > new Date()
    );

    if (foundCode) {
      foundCode.isUsed = true;
      foundCode.usedAt = new Date();
      localStorage.setItem(this.ACCESS_CODES_KEY, JSON.stringify(codes));
      return true;
    }
    return false;
  }

  // حذف کد دسترسی
  deleteAccessCode(code: string): void {
    const codes = this.getAccessCodes();
    const filteredCodes = codes.filter(c => c.code !== code);
    localStorage.setItem(this.ACCESS_CODES_KEY, JSON.stringify(filteredCodes));
  }

  // ثبت نام کاربر جدید
  register(username: string, email: string, password: string): User | null {
    try {
      const users = this.getUsers();
      
      // بررسی وجود نام کاربری یا ایمیل
      const existingUser = users.find(u => u.name === username || u.email === email);
      if (existingUser) {
        if (existingUser.name === username) {
          throw new Error('این نام کاربری قبلاً ثبت شده است');
        }
        if (existingUser.email === email) {
          throw new Error('این ایمیل قبلاً ثبت شده است');
        }
      }

      const newUser: User = {
        id: Date.now().toString(),
        email,
        name: username,
        joinDate: new Date(),
        profile: {
          name: '',
          age: null,
          isPregnant: null,
          pregnancyWeek: null,
          medicalConditions: '',
          isComplete: false
        }
      };

      users.push(newUser);
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

      const authState: AuthState = {
        isAuthenticated: true,
        user: newUser,
        accessCode: null
      };
      localStorage.setItem(this.AUTH_STATE_KEY, JSON.stringify(authState));
      
      return newUser;
    } catch (error) {
      throw error;
    }
  }

  // ورود کاربر
  login(username: string, password: string): User | null {
    try {
      const users = this.getUsers();
      const user = users.find(u => 
        (u.name === username || u.email === username)
      );

      if (user) {
        const authState: AuthState = {
          isAuthenticated: true,
          user,
          accessCode: null
        };
        localStorage.setItem(this.AUTH_STATE_KEY, JSON.stringify(authState));
        return user;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // به‌روزرسانی پروفایل کاربر
  updateUserProfile(userId: string, profile: any): void {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex].profile = { ...users[userIndex].profile, ...profile };
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      
      // به‌روزرسانی وضعیت احراز هویت
      const authState = this.getAuthState();
      if (authState.user && authState.user.id === userId) {
        authState.user.profile = users[userIndex].profile;
        localStorage.setItem(this.AUTH_STATE_KEY, JSON.stringify(authState));
      }
    }
  }

  // ورود ادمین
  adminLogin(username: string, password: string): AdminUser | null {
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
      
      const users = JSON.parse(stored);
      return users.map((user: any) => ({
        ...user,
        joinDate: new Date(user.joinDate)
      }));
    } catch {
      return [];
    }
  }

  // حذف کاربر
  deleteUser(userId: string): void {
    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(filteredUsers));
  }
}

export const authService = new AuthService();