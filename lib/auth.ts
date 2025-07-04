import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'mamiland_secret_key_2024';

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: Date;
  profile?: UserProfile;
}

export interface UserProfile {
  name: string;
  age: number | null;
  is_pregnant: boolean | null;
  pregnancy_week: number | null;
  medical_conditions: string | null;
  is_complete: boolean;
}

export interface AccessCode {
  id: number;
  code: string;
  created_at: Date;
  expires_at: Date;
  is_used: boolean;
  used_by: number | null;
  used_at: Date | null;
}

// تولید کد دسترسی جدید
export async function generateAccessCode(): Promise<string> {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await executeQuery(
    'INSERT INTO access_codes (code, expires_at) VALUES (?, ?)',
    [code, expiresAt]
  );

  return code;
}

// بررسی صحت کد دسترسی
export async function validateAccessCode(code: string): Promise<boolean> {
  const results: any = await executeQuery(
    'SELECT * FROM access_codes WHERE code = ? AND is_used = FALSE AND expires_at > NOW()',
    [code.toUpperCase()]
  );

  if (results.length > 0) {
    await executeQuery(
      'UPDATE access_codes SET is_used = TRUE, used_at = NOW() WHERE code = ?',
      [code.toUpperCase()]
    );
    return true;
  }
  return false;
}

// ثبت نام کاربر جدید
export async function registerUser(username: string, email: string, password: string): Promise<User> {
  // بررسی وجود نام کاربری یا ایمیل
  const existingUser: any = await executeQuery(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [username, email]
  );

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

  // درج کاربر جدید
  const result: any = await executeQuery(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, passwordHash]
  );

  const userId = result.insertId;

  // ایجاد پروفایل خالی
  await executeQuery(
    'INSERT INTO user_profiles (user_id, name, is_complete) VALUES (?, ?, FALSE)',
    [userId, '']
  );

  return {
    id: userId,
    username,
    email,
    created_at: new Date()
  };
}

// ورود کاربر
export async function loginUser(username: string, password: string): Promise<User | null> {
  const results: any = await executeQuery(
    'SELECT u.*, p.name, p.age, p.is_pregnant, p.pregnancy_week, p.medical_conditions, p.is_complete FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id WHERE u.username = ? OR u.email = ?',
    [username, username]
  );

  if (results.length === 0) {
    return null;
  }

  const user = results[0];
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    created_at: user.created_at,
    profile: {
      name: user.name || '',
      age: user.age,
      is_pregnant: user.is_pregnant,
      pregnancy_week: user.pregnancy_week,
      medical_conditions: user.medical_conditions,
      is_complete: user.is_complete || false
    }
  };
}

// تولید JWT Token
export function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// تأیید JWT Token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// دریافت اطلاعات کاربر از طریق ID
export async function getUserById(userId: number): Promise<User | null> {
  const results: any = await executeQuery(
    'SELECT u.*, p.name, p.age, p.is_pregnant, p.pregnancy_week, p.medical_conditions, p.is_complete FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id WHERE u.id = ?',
    [userId]
  );

  if (results.length === 0) {
    return null;
  }

  const user = results[0];
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    created_at: user.created_at,
    profile: {
      name: user.name || '',
      age: user.age,
      is_pregnant: user.is_pregnant,
      pregnancy_week: user.pregnancy_week,
      medical_conditions: user.medical_conditions,
      is_complete: user.is_complete || false
    }
  };
}

// به‌روزرسانی پروفایل کاربر
export async function updateUserProfile(userId: number, profile: Partial<UserProfile>): Promise<void> {
  const setClause = [];
  const values = [];

  if (profile.name !== undefined) {
    setClause.push('name = ?');
    values.push(profile.name);
  }
  if (profile.age !== undefined) {
    setClause.push('age = ?');
    values.push(profile.age);
  }
  if (profile.is_pregnant !== undefined) {
    setClause.push('is_pregnant = ?');
    values.push(profile.is_pregnant);
  }
  if (profile.pregnancy_week !== undefined) {
    setClause.push('pregnancy_week = ?');
    values.push(profile.pregnancy_week);
  }
  if (profile.medical_conditions !== undefined) {
    setClause.push('medical_conditions = ?');
    values.push(profile.medical_conditions);
  }
  if (profile.is_complete !== undefined) {
    setClause.push('is_complete = ?');
    values.push(profile.is_complete);
  }

  if (setClause.length > 0) {
    values.push(userId);
    await executeQuery(
      `UPDATE user_profiles SET ${setClause.join(', ')}, updated_at = NOW() WHERE user_id = ?`,
      values
    );
  }
}

// دریافت تمام کدهای دسترسی
export async function getAllAccessCodes(): Promise<AccessCode[]> {
  const results: any = await executeQuery(
    'SELECT * FROM access_codes ORDER BY created_at DESC'
  );
  return results;
}

// حذف کد دسترسی
export async function deleteAccessCode(code: string): Promise<void> {
  await executeQuery('DELETE FROM access_codes WHERE code = ?', [code]);
}

// دریافت تمام کاربران
export async function getAllUsers(): Promise<User[]> {
  const results: any = await executeQuery(
    'SELECT u.*, p.name, p.age, p.is_pregnant, p.pregnancy_week, p.medical_conditions, p.is_complete FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id ORDER BY u.created_at DESC'
  );

  return results.map((user: any) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    created_at: user.created_at,
    profile: {
      name: user.name || '',
      age: user.age,
      is_pregnant: user.is_pregnant,
      pregnancy_week: user.pregnancy_week,
      medical_conditions: user.medical_conditions,
      is_complete: user.is_complete || false
    }
  }));
}

// حذف کاربر
export async function deleteUser(userId: number): Promise<void> {
  await executeQuery('DELETE FROM users WHERE id = ?', [userId]);
}

// ورود ادمین
export async function loginAdmin(username: string, password: string): Promise<boolean> {
  const results: any = await executeQuery(
    'SELECT * FROM admins WHERE username = ? AND is_active = TRUE',
    [username]
  );

  if (results.length === 0) {
    return false;
  }

  const admin = results[0];
  return await bcrypt.compare(password, admin.password_hash);
}