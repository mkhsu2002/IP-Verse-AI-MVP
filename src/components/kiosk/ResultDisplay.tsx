'use client';

import React, { useMemo, useState } from 'react';

interface ResultDisplayProps {
  imageUrl: string;
  sceneName: string;
  emailSent: boolean | null;
  emailError: string | null;
  onReset: () => void;
}

export default function ResultDisplay({
  imageUrl,
  sceneName,
  emailSent,
  emailError,
  onReset,
}: ResultDisplayProps) {
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const absoluteImageUrl = useMemo(() => {
    if (typeof window === 'undefined') return imageUrl;
    return new URL(imageUrl, window.location.origin).toString();
  }, [imageUrl]);

  const downloadImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeSceneName = sceneName.replace(/[^\p{L}\p{N}-]+/gu, '-');
      link.href = objectUrl;
      link.download = `ip-verse-ai-${safeSceneName || 'photo'}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      setShareMessage('下載失敗，請稍後再試。');
    }
  };

  const shareImage = async () => {
    setShareMessage(null);
    const shareData = {
      title: 'IP Verse AI 合照',
      text: `我的 IP Verse AI 合照完成了：${sceneName}`,
      url: absoluteImageUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(absoluteImageUrl);
      setShareMessage('已複製分享連結。');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      setShareMessage('分享失敗，已保留畫面可重新操作。');
    }
  };

  const openLineShare = () => {
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(absoluteImageUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-animated p-8">
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-4xl w-full fade-in">
        {/* Scene badge */}
        <div className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
          <span className="text-white/80 text-lg">🎬 {sceneName}</span>
        </div>

        {/* Generated image */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-white/10">
          <img
            src={imageUrl}
            alt={`AI 合照 - ${sceneName}`}
            className="max-h-[60vh] w-auto object-contain fade-in"
            style={{ animationDelay: '0.3s' }}
          />
        </div>

        {/* Status messages & Action Button */}
        <div className="text-center space-y-6">
          {emailSent === false ? (
            <div className="space-y-2">
              <p className="text-xl text-yellow-300 font-medium">
                圖片已完成，但 Email 寄送尚未成功
              </p>
              {emailError && (
                <p className="max-w-xl text-sm text-yellow-100/70">
                  {emailError}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xl text-white/90 font-medium">
              照片已寄送至您的信箱
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={downloadImage}
              className="rounded-2xl border border-white/15 bg-white/10 px-6 py-3 text-white transition-all duration-300 hover:scale-105 hover:bg-white/20 active:scale-95"
            >
              下載圖片
            </button>
            <button
              type="button"
              onClick={shareImage}
              className="rounded-2xl border border-white/15 bg-white/10 px-6 py-3 text-white transition-all duration-300 hover:scale-105 hover:bg-white/20 active:scale-95"
            >
              社群分享
            </button>
            <button
              type="button"
              onClick={openLineShare}
              className="rounded-2xl border border-green-300/25 bg-green-500/15 px-6 py-3 text-green-100 transition-all duration-300 hover:scale-105 hover:bg-green-500/25 active:scale-95"
            >
              LINE 分享
            </button>
          </div>

          {shareMessage && (
            <p className="text-sm text-white/60">{shareMessage}</p>
          )}

          <button
            onClick={onReset}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 rounded-2xl text-white text-lg font-semibold shadow-xl shadow-purple-500/20 border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          >
            📸 重新開始 / 拍攝下一張
          </button>
        </div>
      </div>
    </div>
  );
}
