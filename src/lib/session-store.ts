import type { Session } from '@/types';
import { SESSION_TTL_MINUTES } from './constants';

/**
 * Edge-compatible Session Store.
 * Uses in-memory Map for MVP.
 * For production, replace with Cloudflare KV or D1.
 */

const sessions = new Map<string, Session>();

/** Create a new session */
export function createSession(session: Session): void {
  sessions.set(session.id, session);
  console.log(`📝 Session created: ${session.id} (email: ${session.email})`);
}

/** Find session by ID */
export function findSessionById(id: string): Session | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;

  // Check expiry
  if (new Date(session.expiresAt) < new Date()) {
    sessions.delete(id);
    console.log(`⏰ Session expired and removed: ${id}`);
    return undefined;
  }

  return session;
}

/** Find session by token */
export function findSessionByToken(token: string): Session | undefined {
  for (const session of sessions.values()) {
    if (session.token === token) {
      // Check expiry
      if (new Date(session.expiresAt) < new Date()) {
        sessions.delete(session.id);
        console.log(`⏰ Session expired and removed: ${session.id}`);
        return undefined;
      }
      return session;
    }
  }
  return undefined;
}

/** Update session */
export function updateSession(
  id: string,
  updates: Partial<Session>
): Session | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;

  const updated = { ...session, ...updates };
  sessions.set(id, updated);
  return updated;
}

/** Delete session */
export function deleteSession(id: string): void {
  sessions.delete(id);
}

/** Get session TTL in ms */
export function getSessionTTLMs(): number {
  return SESSION_TTL_MINUTES * 60 * 1000;
}
