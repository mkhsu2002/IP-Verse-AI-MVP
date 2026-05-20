import { NextResponse } from 'next/server';
import { getActivitySettings } from '@/lib/session-store';

export async function GET() {
  const settings = await getActivitySettings();
  return NextResponse.json({ success: true, settings });
}
