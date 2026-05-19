export type SessionStatus = 'pending' | 'active' | 'completed' | 'expired';

export interface Session {
  id: string;
  token: string;
  email: string;
  consent: boolean;
  status: SessionStatus;
  createdAt: string;
  expiresAt: string;
  scene?: string;
  generatedImageUrl?: string;
}

export interface CreateSessionRequest {
  email: string;
  consent: boolean;
}

export interface CreateSessionResponse {
  success: boolean;
  sessionId?: string;
  token?: string;
  expiresAt?: string;
  error?: string;
}

export interface VerifySessionRequest {
  token: string;
}

export interface VerifySessionResponse {
  success: boolean;
  sessionId?: string;
  email?: string;
  error?: string;
}

export interface GenerateRequest {
  sessionId: string;
  userPhoto: string; // base64 data URL
}

export interface GenerateResponse {
  success: boolean;
  imageUrl?: string;
  scene?: string;
  error?: string;
}

export type KioskState =
  | 'IDLE'
  | 'SCANNING'
  | 'VERIFYING'
  | 'COUNTDOWN'
  | 'CAPTURING'
  | 'GENERATING'
  | 'RESULT'
  | 'SENDING_EMAIL'
  | 'COMPLETE'
  | 'ERROR';

export interface KioskContext {
  state: KioskState;
  sessionId: string | null;
  email: string | null;
  token: string | null;
  userPhoto: string | null;
  generatedImageUrl: string | null;
  scene: string | null;
  error: string | null;
  countdown: number;
}
