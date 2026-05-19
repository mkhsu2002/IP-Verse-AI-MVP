import { NextResponse } from 'next/server';
import { getSessionById, updateSession } from '@/lib/session-store';
import { generateCompositeImage } from '@/lib/openai-generate';
import { sendGeneratedImage } from '@/lib/email-sender';
import { getRandomScene } from '@/lib/scenes';
import type { GenerateRequest, GenerateResponse } from '@/types';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequest;
    const { sessionId, userPhoto } = body;

    // Validate inputs
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: '缺少 Session ID' },
        { status: 400 }
      );
    }

    if (!userPhoto || typeof userPhoto !== 'string') {
      return NextResponse.json<GenerateResponse>(
        { success: false, error: '缺少使用者照片' },
        { status: 400 }
      );
    }

    // Verify session
    const session = await getSessionById(sessionId);

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

    // IP character path
    const ipCharacterPath = path.join(
      process.cwd(),
      'public',
      'ip-characters',
      'default-mascot.png'
    );

    // Generate composite image
    const generatedBase64 = await generateCompositeImage(
      userPhoto,
      ipCharacterPath,
      scene.prompt
    );

    // Save generated image to public/generated/
    const generatedDir = path.join(process.cwd(), 'public', 'generated');
    await mkdir(generatedDir, { recursive: true });

    const imageFileName = `${sessionId}.png`;
    const imagePath = path.join(generatedDir, imageFileName);
    const imageBuffer = Buffer.from(generatedBase64, 'base64');
    await writeFile(imagePath, imageBuffer);

    const imageUrl = `/generated/${imageFileName}`;

    // Update session
    await updateSession(sessionId, {
      status: 'completed',
      scene: scene.name,
      generatedImageUrl: imageUrl,
    });

    // Send email in background (don't block response)
    sendGeneratedImage(session.email, generatedBase64, scene.name).catch(
      (err) => {
        console.error('Background email sending failed:', err);
      }
    );

    return NextResponse.json<GenerateResponse>({
      success: true,
      imageUrl,
      scene: scene.name,
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
