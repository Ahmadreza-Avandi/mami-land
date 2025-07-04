import { NextRequest, NextResponse } from 'next/server';
import { loginAdmin } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'mamiland_secret_key_2024';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'نام کاربری و رمز عبور الزامی هستند' },
        { status: 400 }
      );
    }

    const isValid = await loginAdmin(username, password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور نامعتبر است' },
        { status: 401 }
      );
    }

    // تولید JWT برای ادمین
    const token = jwt.sign(
      { username, isAdmin: true },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      admin: { username, isAdmin: true },
      token
    });

    // تنظیم کوکی JWT برای ادمین
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 7 روز
    });

    return response;
  } catch (error) {
    console.error('Error logging in admin:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}