'use client';

import React, { useEffect, useState } from 'react';

interface GeneratingViewProps {
  sceneName: string;
}

const PROGRESS_MESSAGES = [
  '分析照片中...',
  '融合角色中...',
  '繪製場景中...',
  '最後潤飾中...',
];

const PARTICLES = Array.from({ length: 20 }).map((_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${(i * 53 + 11) % 100}%`,
  animationDelay: `${(i % 12) * 0.5}s`,
  animationDuration: `${4 + (i % 5) * 0.7}s`,
  width: `${2 + (i % 4)}px`,
  height: `${2 + (i % 4)}px`,
  opacity: 0.2 + (i % 4) * 0.08,
}));

export default function GeneratingView({ sceneName }: GeneratingViewProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % PROGRESS_MESSAGES.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-animated">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLES.map((particle, i) => (
          <div
            key={i}
            className="particle"
            style={particle}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Large spinner */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin" />
          <div className="absolute inset-2 w-20 h-20 rounded-full border-4 border-transparent border-b-pink-500 border-l-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-4 w-16 h-16 rounded-full border-4 border-transparent border-t-purple-400 animate-spin" style={{ animationDuration: '2s' }} />
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">🎨</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-white glow-text font-['Outfit']">
          AI 正在創作你的合照
        </h2>

        {/* Scene name */}
        <div className="px-6 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10">
          <span className="text-white/80">🎬 場景：{sceneName}</span>
        </div>

        {/* Progress message with fade animation */}
        <div className="h-8 flex items-center">
          <p
            key={messageIndex}
            className="text-white/60 text-lg fade-in"
          >
            {PROGRESS_MESSAGES[messageIndex]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-80 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shimmer" />
        </div>

        <p className="text-white/30 text-sm">這可能需要 15-30 秒，請稍候...</p>
      </div>
    </div>
  );
}
