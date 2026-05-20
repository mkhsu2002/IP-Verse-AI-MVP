'use client';

import { useReducer, useCallback, useRef, useEffect } from 'react';
import type { KioskState, KioskContext } from '@/types';
import {
  COUNTDOWN_SECONDS,
  ERROR_RESET_SECONDS,
  COMPLETE_RESET_SECONDS,
} from '@/lib/constants';

// --- Action Types ---
type KioskAction =
  | { type: 'START_SCANNING' }
  | { type: 'QR_SCANNED'; token: string }
  | { type: 'SESSION_VERIFIED'; sessionId: string; email: string }
  | { type: 'SESSION_ERROR'; error: string }
  | { type: 'COUNTDOWN_TICK' }
  | { type: 'PHOTO_CAPTURED'; photoBase64: string }
  | { type: 'IMAGE_GENERATED'; imageUrl: string; scene: string }
  | { type: 'GENERATE_ERROR'; error: string }
  | { type: 'EMAIL_SENT' }
  | { type: 'EMAIL_FAILED' }
  | { type: 'RESET' };

// --- Initial State ---
const initialContext: KioskContext = {
  state: 'IDLE',
  sessionId: null,
  email: null,
  token: null,
  userPhoto: null,
  generatedImageUrl: null,
  scene: null,
  error: null,
  countdown: COUNTDOWN_SECONDS,
};

// --- Reducer ---
function kioskReducer(
  context: KioskContext,
  action: KioskAction
): KioskContext {
  switch (action.type) {
    case 'START_SCANNING':
      return { ...initialContext, state: 'SCANNING' };

    case 'QR_SCANNED':
      return { ...context, state: 'VERIFYING', token: action.token };

    case 'SESSION_VERIFIED':
      return {
        ...context,
        state: 'COUNTDOWN',
        sessionId: action.sessionId,
        email: action.email,
        countdown: COUNTDOWN_SECONDS,
      };

    case 'SESSION_ERROR':
      return { ...context, state: 'ERROR', error: action.error };

    case 'COUNTDOWN_TICK':
      if (context.countdown <= 1) {
        return { ...context, state: 'CAPTURING', countdown: 0 };
      }
      return { ...context, countdown: context.countdown - 1 };

    case 'PHOTO_CAPTURED':
      return {
        ...context,
        state: 'GENERATING',
        userPhoto: action.photoBase64,
      };

    case 'IMAGE_GENERATED':
      return {
        ...context,
        state: 'RESULT',
        generatedImageUrl: action.imageUrl,
        scene: action.scene,
      };

    case 'GENERATE_ERROR':
      return { ...context, state: 'ERROR', error: action.error };

    case 'EMAIL_SENT':
    case 'EMAIL_FAILED':
      return { ...context, state: 'COMPLETE' };

    case 'RESET':
      return { ...initialContext, state: 'IDLE' };

    default:
      return context;
  }
}

// --- Hook ---
export interface UseKioskStateMachine {
  context: KioskContext;
  startScanning: () => void;
  onQrScanned: (token: string) => void;
  onSessionVerified: (sessionId: string, email: string) => void;
  onSessionError: (error: string) => void;
  onCountdownTick: () => void;
  onPhotoCaptured: (photoBase64: string) => void;
  onImageGenerated: (imageUrl: string, scene: string) => void;
  onGenerateError: (error: string) => void;
  onEmailSent: () => void;
  onEmailFailed: () => void;
  reset: () => void;
}

export function useKioskStateMachine(): UseKioskStateMachine {
  const [context, dispatch] = useReducer(kioskReducer, initialContext);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  // Auto-start scanning from IDLE
  useEffect(() => {
    if (context.state === 'IDLE') {
      const timer = setTimeout(() => {
        dispatch({ type: 'START_SCANNING' });
      }, 2000); // Brief pause at IDLE before scanning
      return () => clearTimeout(timer);
    }
  }, [context.state]);

  // Countdown timer
  useEffect(() => {
    if (context.state === 'COUNTDOWN') {
      countdownTimerRef.current = setInterval(() => {
        dispatch({ type: 'COUNTDOWN_TICK' });
      }, 1000);
      return () => {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
        }
      };
    }
  }, [context.state]);

  // Auto-reset from ERROR
  useEffect(() => {
    if (context.state === 'ERROR') {
      resetTimerRef.current = setTimeout(() => {
        dispatch({ type: 'RESET' });
      }, ERROR_RESET_SECONDS * 1000);
      return () => {
        if (resetTimerRef.current) {
          clearTimeout(resetTimerRef.current);
          resetTimerRef.current = null;
        }
      };
    }
  }, [context.state]);

  // Auto-reset from COMPLETE is disabled to allow the user to manually click restart
  // Auto-reset from ERROR remains enabled for kiosk stability
  // COMPLETE state now stays on screen permanently until manual reset

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // Actions
  const startScanning = useCallback(() => {
    dispatch({ type: 'START_SCANNING' });
  }, []);

  const onQrScanned = useCallback((token: string) => {
    dispatch({ type: 'QR_SCANNED', token });
  }, []);

  const onSessionVerified = useCallback(
    (sessionId: string, email: string) => {
      dispatch({ type: 'SESSION_VERIFIED', sessionId, email });
    },
    []
  );

  const onSessionError = useCallback((error: string) => {
    dispatch({ type: 'SESSION_ERROR', error });
  }, []);

  const onCountdownTick = useCallback(() => {
    dispatch({ type: 'COUNTDOWN_TICK' });
  }, []);

  const onPhotoCaptured = useCallback((photoBase64: string) => {
    dispatch({ type: 'PHOTO_CAPTURED', photoBase64 });
  }, []);

  const onImageGenerated = useCallback((imageUrl: string, scene: string) => {
    dispatch({ type: 'IMAGE_GENERATED', imageUrl, scene });
  }, []);

  const onGenerateError = useCallback((error: string) => {
    dispatch({ type: 'GENERATE_ERROR', error });
  }, []);

  const onEmailSent = useCallback(() => {
    dispatch({ type: 'EMAIL_SENT' });
  }, []);

  const onEmailFailed = useCallback(() => {
    dispatch({ type: 'EMAIL_FAILED' });
  }, []);

  const reset = useCallback(() => {
    clearAllTimers();
    dispatch({ type: 'RESET' });
  }, [clearAllTimers]);

  return {
    context,
    startScanning,
    onQrScanned,
    onSessionVerified,
    onSessionError,
    onCountdownTick,
    onPhotoCaptured,
    onImageGenerated,
    onGenerateError,
    onEmailSent,
    onEmailFailed,
    reset,
  };
}
