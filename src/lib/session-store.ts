import { promises as fs } from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { SESSION_TTL_MINUTES } from './constants';
import type { Session } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readSessions(): Promise<Session[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(SESSIONS_FILE, 'utf-8');
    return JSON.parse(data) as Session[];
  } catch {
    return [];
  }
}

async function writeSessions(sessions: Session[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
}

export async function createSession(
  email: string,
  consent: boolean
): Promise<Session> {
  const sessions = await readSessions();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MINUTES * 60 * 1000);

  const session: Session = {
    id: nanoid(12),
    token: nanoid(16),
    email,
    consent,
    status: 'pending',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  sessions.push(session);
  await writeSessions(sessions);

  return session;
}

export async function getSessionByToken(
  token: string
): Promise<Session | null> {
  const sessions = await readSessions();
  return sessions.find((s) => s.token === token) || null;
}

export async function getSessionById(id: string): Promise<Session | null> {
  const sessions = await readSessions();
  return sessions.find((s) => s.id === id) || null;
}

export async function updateSession(
  id: string,
  updates: Partial<Session>
): Promise<Session | null> {
  const sessions = await readSessions();
  const index = sessions.findIndex((s) => s.id === id);

  if (index === -1) return null;

  sessions[index] = { ...sessions[index], ...updates };
  await writeSessions(sessions);

  return sessions[index];
}

export async function cleanExpiredSessions(): Promise<void> {
  const sessions = await readSessions();
  const now = new Date();
  const active = sessions.filter(
    (s) => new Date(s.expiresAt) > now || s.status === 'completed'
  );
  await writeSessions(active);
}
