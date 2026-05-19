'use client';

import React from 'react';

interface ResultDisplayProps {
  imageUrl: string;
  sceneName: string;
  resetCountdown: number;
}

export default function ResultDisplay({
  imageUrl,
  sceneName,
  resetCountdown,
}: ResultDisplayProps) {
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
            className="max-h-[65vh] w-auto object-contain fade-in"
            style={{ animationDelay: '0.3s' }}
          />
        </div>

        {/* Status messages */}
        <div className="text-center space-y-3">
          <p className="text-xl text-white/90 font-medium">
            📧 照片已寄送至您的信箱
          </p>
          <p className="text-white/40 text-sm">
            {resetCountdown > 0
              ? `畫面將在 ${resetCountdown} 秒後自動重置`
              : '正在重置...'}
          </p>
        </div>
      </div>
    </div>
  );
}
