import { NextResponse } from 'next/server';
import { findSessionByToken, updateSession } from '@/lib/session-store';
import type { VerifySessionRequest, VerifySessionResponse } from '@/types';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VerifySessionRequest;
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json<VerifySessionResponse>(
        { success: false, error: '缺少驗證 token' },
        { status: 400 }
      );
    }

    // Find session by token
    const session = await findSessionByToken(token);

    if (!session) {
      return NextResponse.json<VerifySessionResponse>(
        { success: false, error: 'Session 不存在或已過期' },
        { status: 404 }
      );
    }

    // Check status
    if (session.status !== 'pending') {
      return NextResponse.json<VerifySessionResponse>(
        { success: false, error: '此 Session 已被使用' },
        { status: 409 }
      );
    }

    // Activate session
    await updateSession(session.id, { status: 'active' });

    return NextResponse.json<VerifySessionResponse>({
      success: true,
      sessionId: session.id,
      email: session.email,
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json<VerifySessionResponse>(
      {
        success: false,
        error: '驗證失敗，請稍後再試',
      },
      { status: 500 }
    );
  }
}
