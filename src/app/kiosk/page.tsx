'use client';

import React, { useCallback } from 'react';
import { useKioskStateMachine } from '@/hooks/useKioskStateMachine';
import QrScanner from '@/components/kiosk/QrScanner';
import CameraCapture from '@/components/kiosk/CameraCapture';
import GeneratingView from '@/components/kiosk/GeneratingView';
import ResultDisplay from '@/components/kiosk/ResultDisplay';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { VerifySessionResponse, GenerateResponse } from '@/types';

/**
 * 前端 Canvas 拼貼與遮罩產生器 (方案 A)
 * 完美保留官方人物原汁原味，只讓 AI 重繪真人部分與擴展左右留白
 */
function generateCompositeAndMask(
  userPhotoBase64: string,
  mascotSrc: string
): Promise<{ composite: string; mask: string }> {
  return new Promise((resolve, reject) => {
    const mascotImg = new Image();
    const userImg = new Image();

    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        try {
          const width = 1536;
          const height = 1024;
          
          // 1. 建立合成圖畫布
          const compCanvas = document.createElement('canvas');
          compCanvas.width = width;
          compCanvas.height = height;
          const compCtx = compCanvas.getContext('2d');
          if (!compCtx) throw new Error('無法建立合成畫布上下文');

          // 背景填滿淺灰色 (對 Inpainting 無影響，AI 會重新繪製透明區域)
          compCtx.fillStyle = '#f3f4f6';
          compCtx.fillRect(0, 0, width, height);

          // 官方大圖原尺寸 681x1024，放在左側並完整保留
          const mascotWidth = 681;
          const mascotHeight = 1024;
          const mascotX = 120;
          const mascotY = 0;
          compCtx.drawImage(mascotImg, mascotX, mascotY, mascotWidth, mascotHeight);

          // 繪製使用者自拍照於右側，並進行等比例裁切 (避免變形)
          // 此區塊會在 mask 中保護，優先確保真人不被換掉
          const userW = 430;
          const userH = 610;
          const userX = 965;
          const userY = 250;
          const userRadius = 36;

          const uw = userImg.width;
          const uh = userImg.height;
          const targetRatio = userW / userH;

          let sx = 0, sy = 0, sWidth = uw, sHeight = uh;
          if (uw / uh > targetRatio) {
            // 自拍照偏寬，以高度為準，水平居中裁切
            sWidth = uh * targetRatio;
            sx = (uw - sWidth) / 2;
          } else {
            // 自拍照偏窄，以寬度為準，垂直居中裁切
            sHeight = uw / targetRatio;
            sy = (uh - sHeight) / 2;
          }

          compCtx.save();
          drawRoundedRect(compCtx, userX, userY, userW, userH, userRadius);
          compCtx.clip();
          compCtx.drawImage(userImg, sx, sy, sWidth, sHeight, userX, userY, userW, userH);
          compCtx.restore();

          // 2. 建立遮罩畫布 (Mask Canvas)
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = width;
          maskCanvas.height = height;
          const maskCtx = maskCanvas.getContext('2d');
          if (!maskCtx) throw new Error('無法建立遮罩畫布上下文');

          // 透明區域交給 AI 重繪；黑色區域保護官方 IP 與使用者本人
          maskCtx.clearRect(0, 0, width, height);

          maskCtx.fillStyle = '#000000';
          maskCtx.fillRect(mascotX, mascotY, mascotWidth, mascotHeight);
          drawRoundedRect(maskCtx, userX, userY, userW, userH, userRadius);
          maskCtx.fill();

          resolve({
            composite: compCanvas.toDataURL('image/png'),
            mask: maskCanvas.toDataURL('image/png'),
          });
        } catch (err) {
          reject(err);
        }
      }
    };

    mascotImg.crossOrigin = 'anonymous'; // 防禦性 CORS 設定
    mascotImg.onload = checkLoaded;
    mascotImg.onerror = () => reject(new Error('官方吉祥物大圖載入失敗，請確認 /ip-characters/default-mascot.png 存在'));
    mascotImg.src = mascotSrc;

    userImg.onload = checkLoaded;
    userImg.onerror = () => reject(new Error('自拍照載入失敗'));
    userImg.src = userPhotoBase64;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function KioskPage() {
  const {
    context,
    startScanning,
    onQrScanned,
    onSessionVerified,
    onSessionError,
    onPhotoCaptured,
    onImageGenerated,
    onGenerateError,
    onEmailSent,
    onEmailFailed,
    reset,
  } = useKioskStateMachine();

  // Handle QR Code scanned → verify session
  const handleQrScanned = useCallback(
    async (token: string) => {
      onQrScanned(token);

      try {
        const res = await fetch('/api/session/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data: VerifySessionResponse = await res.json();

        if (data.success && data.sessionId && data.email) {
          onSessionVerified(data.sessionId, data.email);
        } else {
          onSessionError(data.error || '驗證失敗');
        }
      } catch {
        onSessionError('網路連線錯誤');
      }
    },
    [onQrScanned, onSessionVerified, onSessionError]
  );

  // Handle photo captured → call generate API
  const handlePhotoCaptured = useCallback(
    async (photoBase64: string) => {
      onPhotoCaptured(photoBase64);

      try {
        console.log('🎨 開始在前端合成 IP 角色大合影與透明遮罩...');
        const { composite, mask } = await generateCompositeAndMask(
          photoBase64,
          '/ip-characters/default-mascot.png'
        );

        console.log('🚀 前端合成完成！發送至後端進行 Inpainting 局部重繪...');
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: context.sessionId,
            userPhoto: composite, // 發送合成底圖
            maskPhoto: mask,      // 發送透明遮罩圖
            userReferencePhoto: photoBase64, // 另外提供原始自拍，避免 AI 換臉或換人
          }),
        });

        const data: GenerateResponse = await res.json();

        if (data.success && data.imageUrl && data.scene) {
          onImageGenerated(data.imageUrl, data.scene);
          if (data.emailSent) {
            onEmailSent();
          } else {
            onEmailFailed(data.emailError);
          }
        } else {
          onGenerateError(data.error || '圖片生成失敗');
        }
      } catch (error) {
        onGenerateError(
          error instanceof Error ? error.message : '網路連線錯誤，請稍後再試'
        );
      }
    },
    [
      context.sessionId,
      onPhotoCaptured,
      onImageGenerated,
      onGenerateError,
      onEmailSent,
      onEmailFailed,
    ]
  );

  // --- Render based on state ---
  const renderState = () => {
    switch (context.state) {
      case 'IDLE':
        return (
          <div className="w-full h-screen flex flex-col items-center justify-center gap-8 bg-gradient-animated">
            <div className="text-8xl animate-bounce">✨</div>
            <h1 className="text-5xl font-bold font-[family-name:var(--font-outfit)] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              IP Verse AI
            </h1>
            <p className="text-2xl text-white/50">互動式 AI 合照體驗</p>
            <p className="text-white/30 animate-pulse text-lg mt-4">
              請按下按鈕啟動掃描
            </p>
            <button
              onClick={startScanning}
              className="mt-2 px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 active:scale-95 text-white text-lg font-bold rounded-xl shadow-xl transition-all cursor-pointer"
            >
              開始掃描 QR Code
            </button>
            {/* Quick Link to Join Page for easy setup */}
            <a
              href="/join"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-purple-500/30 rounded-xl text-white font-medium transition-all duration-300 shadow-lg cursor-pointer text-sm"
            >
              📱 另開新視窗前往手機加入頁面 (/join)
            </a>
          </div>
        );

      case 'SCANNING':
        return (
          <div className="w-full h-screen relative">
            <QrScanner onScan={handleQrScanned} active={true} />
            <div className="absolute top-8 left-0 right-0 text-center z-20 pointer-events-none">
              <div className="inline-block px-8 py-3 rounded-full bg-black/60 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-outfit)]">
                  📱 請掃描 QR Code
                </h2>
              </div>
            </div>
          </div>
        );

      case 'VERIFYING':
        return (
          <div className="w-full h-screen flex flex-col items-center justify-center gap-6 bg-gradient-animated">
            <LoadingSpinner size="lg" text="驗證中..." />
          </div>
        );

      case 'COUNTDOWN':
      case 'CAPTURING':
        return (
          <div className="w-full h-screen">
            <CameraCapture
              countdown={context.countdown}
              onCapture={handlePhotoCaptured}
              isCapturing={context.state === 'CAPTURING'}
            />
          </div>
        );

      case 'GENERATING':
        return (
          <div className="w-full h-screen">
            <GeneratingView sceneName={context.scene || '生成中...'} />
          </div>
        );

      case 'RESULT':
      case 'SENDING_EMAIL':
      case 'COMPLETE':
        return (
          <div className="w-full h-screen">
            {context.generatedImageUrl ? (
              <ResultDisplay
                imageUrl={context.generatedImageUrl}
                sceneName={context.scene || ''}
                emailSent={context.emailSent}
                emailError={context.emailError}
                onReset={reset}
              />
            ) : (
              <div className="w-full h-screen flex items-center justify-center bg-gradient-animated">
                <LoadingSpinner size="lg" text="載入中..." />
              </div>
            )}
          </div>
        );

      case 'ERROR':
        return (
          <div className="w-full h-screen flex flex-col items-center justify-center gap-6 bg-gradient-animated">
            <div className="text-8xl">😅</div>
            <h2 className="text-3xl font-bold text-white font-[family-name:var(--font-outfit)]">
              發生了一點問題
            </h2>
            <p className="text-xl text-red-400/80 max-w-md text-center">
              {context.error || '未知錯誤'}
            </p>
            <p className="text-white/30 mt-4 animate-pulse">
              請點擊下方按鈕以重新開始體驗
            </p>
            <button
              onClick={reset}
              className="mt-4 px-8 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 active:scale-95 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              📸 重新開始拍攝
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main
      className={`w-full h-screen overflow-hidden select-none ${
        context.state === 'IDLE' || context.state === 'ERROR'
          ? 'cursor-auto'
          : 'cursor-none'
      }`}
    >
      {renderState()}

      {/* Debug state indicator (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50 px-3 py-1.5 rounded-lg bg-black/80 border border-white/10 text-xs text-white/50 font-mono">
          State: {context.state}
          {context.sessionId && ` | Session: ${context.sessionId.slice(0, 6)}...`}
        </div>
      )}
    </main>
  );
}
