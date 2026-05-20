'use client';

import React, { useEffect, useState, useCallback } from 'react';
import QRCode from 'qrcode';

interface QrCodeDisplayProps {
  token: string;
  expiresAt: string;
}

function getSecondsLeft(expiresAt: string): number {
  const now = new Date().getTime();
  const expiry = new Date(expiresAt).getTime();
  return Math.max(0, Math.floor((expiry - now) / 1000));
}

export default function QrCodeDisplay({
  token,
  expiresAt,
}: QrCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(() =>
    getSecondsLeft(expiresAt)
  );

  const calculateTimeLeft = useCallback(() => {
    return getSecondsLeft(expiresAt);
  }, [expiresAt]);

  // Generate QR Code
  useEffect(() => {
    const generateQr = async () => {
      try {
        const url = await QRCode.toDataURL(token, {
          width: 280,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'M',
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('QR Code generation error:', err);
      }
    };
    generateQr();
  }, [token]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (timeLeft <= 0) {
    return (
      <div className="text-center space-y-4 fade-in">
        <div className="text-6xl mb-4">⏰</div>
        <h3 className="text-xl font-semibold text-white">QR Code 已過期</h3>
        <p className="text-white/60">請重新整理頁面以取得新的 QR Code</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
        >
          重新取得
        </button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6 fade-in">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">你的專屬 QR Code</h3>
        <p className="text-white/60 text-sm">
          請將此 QR Code 對準展示端攝影機
        </p>
      </div>

      {/* QR Code with glow effect */}
      <div className="flex justify-center">
        <div className="pulse-glow rounded-2xl p-1 bg-white">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Session QR Code"
              className="w-64 h-64 rounded-xl"
            />
          ) : (
            <div className="w-64 h-64 rounded-xl bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">載入中...</span>
            </div>
          )}
        </div>
      </div>

      {/* Timer */}
      <div className="space-y-1">
        <p className="text-white/40 text-xs">有效時間</p>
        <p
          className={`text-2xl font-mono font-bold ${
            timeLeft < 60 ? 'text-red-400' : 'text-white/80'
          }`}
        >
          {formatTime(timeLeft)}
        </p>
      </div>

      <p className="text-white/40 text-xs">
        QR Code 僅供單次使用，掃描後即失效
      </p>
    </div>
  );
}
