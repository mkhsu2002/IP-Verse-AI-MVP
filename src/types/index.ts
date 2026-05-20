export type SessionStatus = 'pending' | 'active' | 'completed' | 'expired';
export type StartMode = 'qr_scan' | 'email_button';

export interface Session {
  id: string;
  token: string;
  email: string;
  consent: boolean;
  status: SessionStatus;
  startMode?: StartMode;
  createdAt: string;
  expiresAt: string;
  completedAt?: string;
  scene?: string;
  generatedImageUrl?: string;
  generatedImageKey?: string;
  emailSent?: boolean;
  emailError?: string;
}

export interface ActivitySettings {
  startMode: StartMode;
  updatedAt: string;
}

export interface CreateSessionRequest {
  email: string;
  consent: boolean;
  activateImmediately?: boolean;
}

export interface CreateSessionResponse {
  success: boolean;
  sessionId?: string;
  token?: string;
  expiresAt?: string;
  startMode?: StartMode;
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
  userPhoto: string; // composited 1024x1024 base64 data URL
  userReferencePhoto?: string; // original camera photo base64 data URL
  maskPhoto?: string; // 1024x1024 PNG mask data URL
}

export interface GenerateResponse {
  success: boolean;
  imageUrl?: string;
  scene?: string;
  emailSent?: boolean;
  emailError?: string;
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
  emailSent: boolean | null;
  emailError: string | null;
  error: string | null;
  countdown: number;
}
