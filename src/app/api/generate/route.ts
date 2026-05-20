import { NextResponse } from 'next/server';
import {
  findSessionById,
  saveGeneratedImage,
  updateSession,
} from '@/lib/session-store';
import { generateCompositeImage } from '@/lib/openai-generate';
import { sendGeneratedImage } from '@/lib/email-sender';
import { getRandomScene } from '@/lib/scenes';
import type { GenerateRequest, GenerateResponse } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!isGenerateRequest(body)) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: '請提供完整的生成資料' },
        { status: 400 }
      );
    }

    const { sessionId, userPhoto, userReferencePhoto, maskPhoto } = body;

    // Validate inputs
    if (!sessionId.trim()) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: '缺少 Session ID' },
        { status: 400 }
      );
    }

    if (!isSupportedImageDataUrl(userPhoto)) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: '使用者照片格式無效' },
        { status: 400 }
      );
    }

    if (userReferencePhoto && !isSupportedImageDataUrl(userReferencePhoto)) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: '自拍參考照片格式無效' },
        { status: 400 }
      );
    }

    if (maskPhoto && !isSupportedImageDataUrl(maskPhoto)) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: '遮罩圖片格式無效' },
        { status: 400 }
      );
    }

    // Verify session
    const session = await findSessionById(sessionId);

    if (!session) {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: 'Session 不存在' },
        { status: 404 }
      );
    }

    if (session.status !== 'active') {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: 'Session 狀態無效' },
        { status: 409 }
      );
    }

    // Select random scene
    const scene = getRandomScene();

    // Generate composite image using Image 1 as masked layout and Image 2 as user identity reference.
    const generatedBase64 = await generateCompositeImage({
      targetImageBase64: userPhoto,
      userReferencePhotoBase64: userReferencePhoto,
      maskPhotoBase64: maskPhoto,
      scenePrompt: scene.prompt,
      sessionId,
    });

    const storedImage = await saveGeneratedImage(sessionId, generatedBase64);

    const emailResult = await sendGeneratedImage(
      session.email,
      generatedBase64,
      scene.name
    );

    // Update session
    await updateSession(sessionId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      scene: scene.name,
      generatedImageUrl: storedImage.url,
      generatedImageKey: storedImage.key,
      emailSent: emailResult.sent,
      emailError: emailResult.error,
    });

    return NextResponse.json<GenerateResponse>({
      success: true,
      imageUrl: storedImage.url,
      scene: scene.name,
      emailSent: emailResult.sent,
      emailError: emailResult.error,
    });
  } catch (error) {
    console.error('Generate error:', error);
    const errorMessage =
      error instanceof Error ? error.message : '圖片生成失敗，請稍後再試';
    return NextResponse.json<GenerateResponse>(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

function isGenerateRequest(value: unknown): value is GenerateRequest {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<Record<keyof GenerateRequest, unknown>>;
  return (
    typeof candidate.sessionId === 'string' &&
    typeof candidate.userPhoto === 'string' &&
    (candidate.userReferencePhoto === undefined ||
      typeof candidate.userReferencePhoto === 'string') &&
    (candidate.maskPhoto === undefined || typeof candidate.maskPhoto === 'string')
  );
}

function isSupportedImageDataUrl(value: string): boolean {
  return /^data:image\/(?:png|jpe?g|webp);base64,[A-Za-z0-9+/=\s]+$/i.test(value);
}
