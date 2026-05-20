import { NextResponse } from 'next/server';
import { getGeneratedImage } from '@/lib/session-store';

interface RouteContext {
  params: Promise<{
    key: string[];
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { key } = await context.params;
  const objectKey = key.join('/');
  const image = await getGeneratedImage(objectKey);

  if (!image) {
    return NextResponse.json(
      { success: false, error: '作品不存在或已過期' },
      { status: 404 }
    );
  }

  return new Response(image.body, {
    headers: {
      'Content-Type': image.contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
