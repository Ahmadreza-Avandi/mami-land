import { executeQuery } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'mamiland_secret_key_2024';

export class DatabaseService {
  // کدهای دسترسی
  async generateAccessCode(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // یک روز اعتبار

    await executeQuery(
      'INSERT INTO access_codes (code, expires_at) VALUES (?, ?)',
      [code, expiresAt]
    );

    return code;
  }

  async getAccessCodes(): Promise<any[]> {
    const results = await executeQuery(
      'SELECT * FROM access_codes ORDER BY created_at DESC'
    );
    return results as any[];
  }

  async getValidAccessCodes(): Promise<any[]> {
    const results = await executeQuery(
      'SELECT * FROM access_codes WHERE is_used = FALSE AND expires_at > NOW() ORDER BY created_at DESC'
    );
    return results as any[];
  }

  async validateAccessCode(code: string): Promise<boolean> {
    const results = await executeQuery(
      'SELECT * FROM access_codes WHERE code = ? AND is_used = FALSE AND expires_at > NOW()',
      [code.toUpperCase()]
    ) as any[];

    if (results.length > 0) {
      await executeQuery(
        'UPDATE access_codes SET is_used = TRUE, used_at = NOW() WHERE code = ?',
        [code.toUpperCase()]
      );
      return true;
    }
    return false;
  }

  async deleteAccessCode(code: string): Promise<void> {
    await executeQuery('DELETE FROM access_codes WHERE code = ?', [code]);
  }

  // کاربران
  async registerUser(username: string, email: string, password: string): Promise<any> {
    // بررسی وجود نام کاربری یا ایمیل
    const existingUser = await executeQuery(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    ) as any[];

    if (existingUser.length > 0) {
      if (existingUser[0].username === username) {
        throw new Error('این نام کاربری قبلاً ثبت شده است');
      }
      if (existingUser[0].email === email) {
        throw new Error('این ایمیل قبلاً ثبت شده است');
      }
    }

    // هش کردن رمز عبور
    const passwordHash = await bcrypt.hash(password, 10);

    // ثبت کاربر
    const result = await executeQuery(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    ) as any;

    const userId = result.insertId;

    // ایجاد پروفایل خالی
    await executeQuery(
      'INSERT INTO user_profiles (user_id) VALUES (?)',
      [userId]
    );

    // دریافت اطلاعات کاربر
    const user = await this.getUserById(userId);
    return user;
  }

  async loginUser(username: string, password: string): Promise<any> {
    const results = await executeQuery(
      'SELECT u.*, up.name, up.age, up.is_pregnant, up.pregnancy_week, up.medical_conditions, up.is_complete FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id WHERE u.username = ? OR u.email = ?',
      [username, username]
    ) as any[];

    if (results.length === 0) {
      return null;
    }

    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return null;
    }

    // تولید JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      token,
      profile: {
        name: user.name || '',
        age: user.age,
        isPregnant: user.is_pregnant,
        pregnancyWeek: user.pregnancy_week,
        medicalConditions: user.medical_conditions || '',
        isComplete: user.is_complete || false
      }
    };
  }

  async getUserById(userId: number): Promise<any> {
    const results = await executeQuery(
      'SELECT u.*, up.name, up.age, up.is_pregnant, up.pregnancy_week, up.medical_conditions, up.is_complete FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id WHERE u.id = ?',
      [userId]
    ) as any[];

    if (results.length === 0) {
      return null;
    }

    const user = results[0];
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      joinDate: user.created_at,
      profile: {
        name: user.name || '',
        age: user.age,
        isPregnant: user.is_pregnant,
        pregnancyWeek: user.pregnancy_week,
        medicalConditions: user.medical_conditions || '',
        isComplete: user.is_complete || false
      }
    };
  }

  async getAllUsers(): Promise<any[]> {
    const results = await executeQuery(
      'SELECT u.*, up.name, up.age, up.is_pregnant, up.pregnancy_week, up.medical_conditions, up.is_complete FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id ORDER BY u.created_at DESC'
    ) as any[];

    return results.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      joinDate: user.created_at,
      profile: {
        name: user.name || '',
        age: user.age,
        isPregnant: user.is_pregnant,
        pregnancyWeek: user.pregnancy_week,
        medicalConditions: user.medical_conditions || '',
        isComplete: user.is_complete || false
      }
    }));
  }

  async updateUserProfile(userId: number, profile: any): Promise<void> {
    await executeQuery(
      'UPDATE user_profiles SET name = ?, age = ?, is_pregnant = ?, pregnancy_week = ?, medical_conditions = ?, is_complete = ? WHERE user_id = ?',
      [
        profile.name,
        profile.age,
        profile.isPregnant,
        profile.pregnancyWeek,
        profile.medicalConditions,
        profile.isComplete,
        userId
      ]
    );
  }

  async deleteUser(userId: number): Promise<void> {
    await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
  }

  // چت
  async createChatSession(userId: number, title?: string): Promise<number> {
    const result = await executeQuery(
      'INSERT INTO chat_sessions (user_id, title) VALUES (?, ?)',
      [userId, title || 'چت جدید']
    ) as any;

    return result.insertId;
  }

  async getChatSessions(userId: number): Promise<any[]> {
    const results = await executeQuery(
      'SELECT * FROM chat_sessions WHERE user_id = ? AND is_active = TRUE ORDER BY updated_at DESC',
      [userId]
    );
    return results as any[];
  }

  async saveChatMessage(sessionId: number, userId: number, content: string, role: string): Promise<void> {
    await executeQuery(
      'INSERT INTO chat_messages (session_id, user_id, content, role) VALUES (?, ?, ?, ?)',
      [sessionId, userId, content, role]
    );

    // به‌روزرسانی زمان آخرین فعالیت جلسه
    await executeQuery(
      'UPDATE chat_sessions SET updated_at = NOW() WHERE id = ?',
      [sessionId]
    );
  }

  async getChatMessages(sessionId: number): Promise<any[]> {
    const results = await executeQuery(
      'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId]
    );
    return results as any[];
  }

  async deleteChatSession(sessionId: number): Promise<void> {
    await executeQuery('UPDATE chat_sessions SET is_active = FALSE WHERE id = ?', [sessionId]);
  }

  // ادمین
  async adminLogin(username: string, password: string): Promise<any> {
    const results = await executeQuery(
      'SELECT * FROM admins WHERE username = ? AND is_active = TRUE',
      [username]
    ) as any[];

    if (results.length === 0) {
      return null;
    }

    const admin = results[0];
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);

    if (!isValidPassword) {
      return null;
    }

    return {
      id: admin.id,
      username: admin.username,
      isAdmin: true
    };
  }

  // لاگ سیستم
  async logAction(userId: number | null, adminId: number | null, action: string, details?: string, ipAddress?: string): Promise<void> {
    await executeQuery(
      'INSERT INTO system_logs (user_id, admin_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      [userId, adminId, action, details, ipAddress]
    );
  }
}

export const dbService = new DatabaseService();