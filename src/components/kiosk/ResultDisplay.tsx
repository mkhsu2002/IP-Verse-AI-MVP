'use client';

import React from 'react';

interface ResultDisplayProps {
  imageUrl: string;
  sceneName: string;
  onReset: () => void;
}

export default function ResultDisplay({
  imageUrl,
  sceneName,
  onReset,
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
            className="max-h-[60vh] w-auto object-contain fade-in"
            style={{ animationDelay: '0.3s' }}
          />
        </div>

        {/* Status messages & Action Button */}
        <div className="text-center space-y-6">
          <p className="text-xl text-white/90 font-medium">
            📧 照片已寄送至您的信箱
          </p>
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
