import { NextResponse } from 'next/server';
import { createSession } from '@/lib/session-store';
import type { CreateSessionRequest, CreateSessionResponse } from '@/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateSessionRequest;
    const { email, consent } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json<CreateSessionResponse>(
        { success: false, error: '請提供 Email 地址' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<CreateSessionResponse>(
        { success: false, error: '請提供有效的 Email 地址' },
        { status: 400 }
      );
    }

    // Validate consent
    if (consent !== true) {
      return NextResponse.json<CreateSessionResponse>(
        { success: false, error: '請勾選同意條款' },
        { status: 400 }
      );
    }

    // Create session
    const session = await createSession(email, consent);

    return NextResponse.json<CreateSessionResponse>({
      success: true,
      sessionId: session.id,
      token: session.token,
      expiresAt: session.expiresAt,
    });
  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json<CreateSessionResponse>(
      {
        success: false,
        error: '系統錯誤，請稍後再試',
      },
      { status: 500 }
    );
  }
}
