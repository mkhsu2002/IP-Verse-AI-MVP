'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useKioskStateMachine } from '@/hooks/useKioskStateMachine';
import QrScanner from '@/components/kiosk/QrScanner';
import CameraCapture from '@/components/kiosk/CameraCapture';
import GeneratingView from '@/components/kiosk/GeneratingView';
import ResultDisplay from '@/components/kiosk/ResultDisplay';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type { VerifySessionResponse, GenerateResponse } from '@/types';
import { ERROR_RESET_SECONDS, COMPLETE_RESET_SECONDS } from '@/lib/constants';

export default function KioskPage() {
  const {
    context,
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

  const [resetCountdown, setResetCountdown] = useState(0);

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
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: context.sessionId,
            userPhoto: photoBase64,
          }),
        });

        const data: GenerateResponse = await res.json();

        if (data.success && data.imageUrl && data.scene) {
          onImageGenerated(data.imageUrl, data.scene);
          // Email is sent in background by the API
          onEmailSent();
        } else {
          onGenerateError(data.error || '圖片生成失敗');
        }
      } catch {
        onGenerateError('網路連線錯誤，請稍後再試');
      }
    },
    [
      context.sessionId,
      onPhotoCaptured,
      onImageGenerated,
      onGenerateError,
      onEmailSent,
    ]
  );

  // Reset countdown for COMPLETE and ERROR states
  useEffect(() => {
    if (context.state === 'COMPLETE') {
      setResetCountdown(COMPLETE_RESET_SECONDS);
      const interval = setInterval(() => {
        setResetCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
    if (context.state === 'ERROR') {
      setResetCountdown(ERROR_RESET_SECONDS);
      const interval = setInterval(() => {
        setResetCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [context.state]);

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
              即將啟動掃描...
            </p>
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
            <p className="text-white/30 mt-4">
              {resetCountdown > 0
                ? `${resetCountdown} 秒後自動重新開始`
                : '正在重新開始...'}
            </p>
            <button
              onClick={reset}
              className="mt-4 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white/70 transition-all"
            >
              立即重新開始
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <main className="w-full h-screen overflow-hidden cursor-none select-none">
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
