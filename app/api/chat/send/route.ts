import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserById } from '@/lib/auth';
import { sendToAI } from '@/lib/chat';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'توکن یافت نشد' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }

    const { message, messages } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'پیام الزامی است' },
        { status: 400 }
      );
    }

    const user = await getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'کاربر یافت نشد' },
        { status: 404 }
      );
    }

    // ارسال به هوش مصنوعی
    const reply = await sendToAI(messages, user.profile);

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'خطای سرور' },
      { status: 500 }
    );
  }
}