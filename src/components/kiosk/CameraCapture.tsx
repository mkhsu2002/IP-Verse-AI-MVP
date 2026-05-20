'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

interface CameraCaptureProps {
  countdown: number;
  onCapture: (photoBase64: string) => void;
  isCapturing: boolean;
}

export default function CameraCapture({
  countdown,
  onCapture,
  isCapturing,
}: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [showFlash, setShowFlash] = useState(false);
  const hasCapturedRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (webcamRef.current?.video?.srcObject) {
      const stream = webcamRef.current.video.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      webcamRef.current.video.srcObject = null;
      console.log('📷 Camera stopped');
    }
  }, []);

  const capture = useCallback(() => {
    if (webcamRef.current && !hasCapturedRef.current) {
      hasCapturedRef.current = true;
      // Show flash effect
      setShowFlash(true);

      // Capture after brief delay for flash
      setTimeout(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
          // Stop camera immediately after capture
          stopCamera();
          onCapture(imageSrc);
        }
      }, 150);
    }
  }, [onCapture, stopCamera]);

  // Auto-capture when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && isCapturing) {
      capture();
    }
  }, [countdown, isCapturing, capture]);

  // Reset capture ref when component mounts
  useEffect(() => {
    hasCapturedRef.current = false;
  }, []);

  // Cleanup: ensure camera stops on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const videoConstraints = {
    width: 1920,
    height: 1080,
    facingMode: 'user',
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Webcam feed */}
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        screenshotQuality={0.92}
        videoConstraints={videoConstraints}
        className="w-full h-full object-cover"
        mirrored
      />

      {/* Countdown overlay */}
      {countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div key={countdown} className="scale-in">
            <span className="text-[12rem] font-bold text-white glow-text drop-shadow-2xl font-['Outfit']">
              {countdown}
            </span>
          </div>
        </div>
      )}

      {/* "Get ready" text */}
      {countdown > 0 && (
        <div className="absolute bottom-12 left-0 right-0 text-center">
          <p className="text-2xl text-white/90 font-medium">
            準備好你的最佳姿勢！📸
          </p>
        </div>
      )}

      {/* Flash effect */}
      {showFlash && (
        <div className="absolute inset-0 bg-white flash-overlay z-50" />
      )}
    </div>
  );
}
