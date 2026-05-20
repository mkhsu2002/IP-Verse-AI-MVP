import { NextResponse } from 'next/server';
import { validateAdminRequest } from '@/lib/admin-auth';
import {
  getActivitySettings,
  updateActivitySettings,
} from '@/lib/session-store';
import type { StartMode } from '@/types';

export async function GET(request: Request) {
  if (!(await validateAdminRequest(request))) {
    return NextResponse.json(
      { success: false, error: '未授權' },
      { status: 401 }
    );
  }

  const settings = await getActivitySettings();
  return NextResponse.json({ success: true, settings });
}

export async function PATCH(request: Request) {
  if (!(await validateAdminRequest(request))) {
    return NextResponse.json(
      { success: false, error: '未授權' },
      { status: 401 }
    );
  }

  const body = (await request.json()) as { startMode?: unknown };
  if (!isStartMode(body.startMode)) {
    return NextResponse.json(
      { success: false, error: '啟動模式無效' },
      { status: 400 }
    );
  }

  const settings = await updateActivitySettings({ startMode: body.startMode });
  return NextResponse.json({ success: true, settings });
}

function isStartMode(value: unknown): value is StartMode {
  return value === 'qr_scan' || value === 'email_button';
}
