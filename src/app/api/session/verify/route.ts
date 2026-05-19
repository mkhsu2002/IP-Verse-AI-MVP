import { NextResponse } from 'next/server';
import { getSessionByToken, updateSession } from '@/lib/session-store';
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
    const session = await getSessionByToken(token);

    if (!session) {
      return NextResponse.json<VerifySessionResponse>(
        { success: false, error: 'Session 不存在' },
        { status: 404 }
      );
    }

    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      return NextResponse.json<VerifySessionResponse>(
        { success: false, error: 'Session 已過期，請重新掃描' },
        { status: 410 }
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
