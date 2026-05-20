import { NextResponse } from 'next/server';
import { validateAdminRequest } from '@/lib/admin-auth';
import { listSessions } from '@/lib/session-store';

export async function GET(request: Request) {
  if (!(await validateAdminRequest(request))) {
    return NextResponse.json(
      { success: false, error: '未授權' },
      { status: 401 }
    );
  }

  const sessions = await listSessions(500);

  return NextResponse.json({
    success: true,
    participants: sessions.map((session) => ({
      id: session.id,
      email: session.email,
      status: session.status,
      startMode: session.startMode || 'qr_scan',
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      completedAt: session.completedAt,
      scene: session.scene,
      generatedImageUrl: session.generatedImageUrl,
      emailSent: session.emailSent,
      emailError: session.emailError,
    })),
  });
}
