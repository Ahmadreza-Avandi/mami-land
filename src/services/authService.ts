import { dbService } from './databaseService';
import { User, AuthState, AdminUser, AccessCode } from '../types/auth';

class AuthService {
  private readonly AUTH_STATE_KEY = 'mamiland_auth_state';
  private readonly ADMIN_AUTH_KEY = 'mamiland_admin_auth';

  // تولید کد دسترسی
  async generateAccessCode(): Promise<string> {
    return await dbService.generateAccessCode();
  }

  // دریافت تمام کدهای دسترسی
  async getAccessCodes(): Promise<AccessCode[]> {
    const codes = await dbService.getAccessCodes();
    return codes.map(code => ({
      code: code.code,
      createdAt: new Date(code.created_at),
      expiresAt: new Date(code.expires_at),
      isUsed: code.is_used,
      usedBy: code.used_by,
      usedAt: code.used_at ? new Date(code.used_at) : null
    }));
  }

  // دریافت کدهای معتبر
  async getValidAccessCodes(): Promise<AccessCode[]> {
    const codes = await dbService.getValidAccessCodes();
    return codes.map(code => ({
      code: code.code,
      createdAt: new Date(code.created_at),
      expiresAt: new Date(code.expires_at),
      isUsed: code.is_used,
      usedBy: code.used_by,
      usedAt: code.used_at ? new Date(code.used_at) : null
    }));
  }

  // بررسی صحت کد دسترسی
  async validateAccessCode(code: string): Promise<boolean> {
    return await dbService.validateAccessCode(code);
  }

  // حذف کد دسترسی
  async deleteAccessCode(code: string): Promise<void> {
    await dbService.deleteAccessCode(code);
  }

  // ثبت نام کاربر جدید
  async register(username: string, email: string, password: string): Promise<User | null> {
    try {
      const user = await dbService.registerUser(username, email, password);
      
      if (user) {
        const authState: AuthState = {
          isAuthenticated: true,
          user: {
            id: user.id.toString(),
            email: user.email,
            name: user.username,
            joinDate: new Date(),
            profile: user.profile
          },
          accessCode: null
        };
        localStorage.setItem(this.AUTH_STATE_KEY, JSON.stringify(authState));
        return authState.user;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // ورود کاربر
  async login(username: string, password: string): Promise<User | null> {
    try {
      const user = await dbService.loginUser(username, password);
      
      if (user) {
        const authState: AuthState = {
          isAuthenticated: true,
          user: {
            id: user.id.toString(),
            email: user.email,
            name: user.username,
            joinDate: new Date(),
            profile: user.profile
          },
          accessCode: null
        };
        localStorage.setItem(this.AUTH_STATE_KEY, JSON.stringify(authState));
        return authState.user;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // به‌روزرسانی پروفایل کاربر
  async updateUserProfile(userId: string, profile: any): Promise<void> {
    await dbService.updateUserProfile(parseInt(userId), profile);
    
    // به‌روزرسانی وضعیت احراز هویت
    const authState = this.getAuthState();
    if (authState.user && authState.user.id === userId) {
      authState.user.profile = { ...authState.user.profile, ...profile };
      localStorage.setItem(this.AUTH_STATE_KEY, JSON.stringify(authState));
    }
  }

  // ورود ادمین
  async adminLogin(username: string, password: string): Promise<AdminUser | null> {
    try {
      const admin = await dbService.adminLogin(username, password);
      
      if (admin) {
        const adminUser: AdminUser = {
          username: admin.username,
          isAdmin: true
        };
        localStorage.setItem(this.ADMIN_AUTH_KEY, JSON.stringify(adminUser));
        return adminUser;
      }
      return null;
    } catch (error) {
      return null;
    }
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
  async getUsers(): Promise<User[]> {
    const users = await dbService.getAllUsers();
    return users.map(user => ({
      id: user.id.toString(),
      email: user.email,
      name: user.username,
      joinDate: new Date(user.joinDate),
      profile: user.profile
    }));
  }

  // حذف کاربر
  async deleteUser(userId: string): Promise<void> {
    await dbService.deleteUser(parseInt(userId));
  }
}

export const authService = new AuthService();