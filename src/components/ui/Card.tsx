'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function Card({
  children,
  className = '',
  hover = false,
}: CardProps) {
  return (
    <div
      className={`
        bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6
        ${hover ? 'transition-all duration-300 hover:translate-y-[-2px] hover:shadow-2xl hover:border-white/20' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
