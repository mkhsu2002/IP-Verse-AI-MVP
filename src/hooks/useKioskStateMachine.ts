'use client';

import { useReducer, useCallback, useRef, useEffect } from 'react';
import type { KioskContext } from '@/types';
import { COUNTDOWN_SECONDS } from '@/lib/constants';

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
  | { type: 'EMAIL_FAILED'; error?: string }
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
  emailSent: null,
  emailError: null,
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
      return { ...context, state: 'COMPLETE', emailSent: true, emailError: null };

    case 'EMAIL_FAILED':
      return {
        ...context,
        state: 'COMPLETE',
        emailSent: false,
        emailError: action.error || 'Email 寄送失敗',
      };

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
  onEmailFailed: (error?: string) => void;
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

  // Auto-start scanning from IDLE is disabled.
  // The system will now stay in IDLE state until the user clicks the explicit start button.

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

  // Auto-reset from ERROR has been disabled to allow host/developers to see precise API error messages.
  // The system will now remain in the ERROR state indefinitely until the user manually clicks the 'Restart Now' button.

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

  const onEmailFailed = useCallback((error?: string) => {
    dispatch({ type: 'EMAIL_FAILED', error });
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
