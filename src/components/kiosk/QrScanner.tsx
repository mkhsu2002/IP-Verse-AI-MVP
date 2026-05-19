'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

interface QrScannerProps {
  onScan: (token: string) => void;
  active: boolean;
}

export default function QrScanner({ onScan, active }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const scannedRef = useRef(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
      } catch {
        // ignore stop errors
      }
      controlsRef.current = null;
    }
    setCameraReady(false);
  }, []);

  useEffect(() => {
    if (!active || !videoRef.current) {
      stopScanning();
      return;
    }

    scannedRef.current = false;
    setCameraError(null);

    const reader = new BrowserQRCodeReader();

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (result && !scannedRef.current) {
          scannedRef.current = true;
          const token = result.getText();
          console.log('✅ QR Code scanned:', token);
          onScan(token);
        }
      })
      .then((controls) => {
        controlsRef.current = controls;
        setCameraReady(true);
        console.log('📷 Camera started for QR scanning');
      })
      .catch((err) => {
        console.error('Camera error:', err);
        setCameraError(
          '無法啟動攝影機，請確認已授予 Chrome 攝影機權限。'
        );
      });

    return () => {
      stopScanning();
    };
  }, [active, onScan, stopScanning]);

  if (cameraError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">📷</div>
        <p className="text-red-400 text-xl text-center max-w-md">
          {cameraError}
        </p>
        <p className="text-white/40 text-sm">
          請在 Chrome 設定中允許此網站使用攝影機
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Camera feed — full screen */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {/* Scan overlay */}
      {active && cameraReady && (
        <>
          {/* Semi-transparent overlay with clear center cutout */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 h-[calc(50%-140px)] bg-black/40" />
            {/* Bottom bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[calc(50%-140px)] bg-black/40" />
            {/* Left bar */}
            <div className="absolute left-0 w-[calc(50%-140px)] top-[calc(50%-140px)] bottom-[calc(50%-140px)] bg-black/40" />
            {/* Right bar */}
            <div className="absolute right-0 w-[calc(50%-140px)] top-[calc(50%-140px)] bottom-[calc(50%-140px)] bg-black/40" />

            {/* Scan frame corners */}
            <div className="w-[280px] h-[280px] relative">
              {/* Top-left corner */}
              <div className="absolute top-0 left-0 w-10 h-10 border-t-3 border-l-3 border-purple-400 rounded-tl-lg" />
              {/* Top-right corner */}
              <div className="absolute top-0 right-0 w-10 h-10 border-t-3 border-r-3 border-purple-400 rounded-tr-lg" />
              {/* Bottom-left corner */}
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-3 border-l-3 border-purple-400 rounded-bl-lg" />
              {/* Bottom-right corner */}
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-3 border-r-3 border-purple-400 rounded-br-lg" />

              {/* Moving scan line */}
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent scan-line" />
            </div>
          </div>
        </>
      )}

      {/* Loading indicator before camera is ready */}
      {active && !cameraReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-purple-500 animate-spin mx-auto" />
            <p className="text-white/60">正在啟動攝影機...</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      {active && cameraReady && (
        <div className="absolute bottom-10 left-0 right-0 text-center z-10">
          <div className="inline-block px-8 py-3 rounded-full bg-black/60 backdrop-blur-sm">
            <p className="text-white text-lg font-medium">
              📱 請將手機上的 QR Code 對準此畫面
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
