'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

interface QrScannerProps {
  onScan: (token: string) => void;
  active: boolean;
}

export default function QrScanner({ onScan, active }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const controlsRef = useRef<ReturnType<BrowserQRCodeReader['decodeFromVideoDevice']> | null>(null);
  const scannedRef = useRef(false);

  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.then((controls) => {
        controls.stop();
      }).catch(() => {});
      controlsRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!active || !videoRef.current) {
      stopScanning();
      return;
    }

    scannedRef.current = false;
    const reader = new BrowserQRCodeReader();
    readerRef.current = reader;

    const decodePromise = reader.decodeFromVideoDevice(
      undefined,
      videoRef.current,
      (result, error) => {
        if (result && !scannedRef.current) {
          scannedRef.current = true;
          const token = result.getText();
          onScan(token);
        }
        if (error) {
          // Silence continuous scan errors (expected when no QR code in frame)
        }
      }
    );

    controlsRef.current = decodePromise;

    return () => {
      stopScanning();
    };
  }, [active, onScan, stopScanning]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Camera feed */}
      <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Scan frame overlay */}
        {active && (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Dimmed overlay */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Scan area */}
            <div className="relative w-64 h-64 scan-frame scan-frame-bottom">
              {/* Clear area */}
              <div className="absolute inset-0 bg-transparent" style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)' }} />

              {/* Scan line */}
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent scan-line" />
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      {active && (
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-white/80 text-lg font-medium animate-pulse">
            📱 請將手機 QR Code 對準攝影機
          </p>
        </div>
      )}
    </div>
  );
}
