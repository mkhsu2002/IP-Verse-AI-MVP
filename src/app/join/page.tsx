'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import EmailForm from '@/components/join/EmailForm';
import QrCodeDisplay from '@/components/join/QrCodeDisplay';
import type { CreateSessionResponse } from '@/types';

export default function JoinPage() {
  const [loading, setLoading] = useState(false);
  const [sessionData, setSessionData] = useState<{
    token: string;
    expiresAt: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent: true }),
      });

      const data: CreateSessionResponse = await res.json();

      if (data.success && data.token && data.expiresAt) {
        setSessionData({
          token: data.token,
          expiresAt: data.expiresAt,
        });
      } else {
        setError(data.error || '建立 Session 失敗');
      }
    } catch {
      setError('網路錯誤，請檢查連線後重試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-animated">
      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${8 + (i * 7) % 85}%`,
              top: `${5 + (i * 11) % 85}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${5 + (i % 3)}s`,
              opacity: 0.15 + (i % 4) * 0.05,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 fade-in">
          <div className="text-5xl">✨</div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-outfit)] bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            IP Verse AI
          </h1>
          <p className="text-white/50 text-sm">互動式 AI 合照體驗</p>
        </div>

        {/* Main card */}
        <Card className="fade-in">
          {!sessionData ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-white">
                  歡迎參加！
                </h2>
                <p className="text-white/50 text-sm">
                  輸入你的 Email 以開始 AI 合照體驗
                </p>
              </div>

              <EmailForm onSubmit={handleSubmit} loading={loading} />

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}
            </div>
          ) : (
            <QrCodeDisplay
              token={sessionData.token}
              expiresAt={sessionData.expiresAt}
            />
          )}
        </Card>

        {/* Footer note */}
        <p className="text-center text-white/20 text-xs">
          您的資料僅用於此次體驗活動，不會用於其他用途。
        </p>
      </div>
    </main>
  );
}
