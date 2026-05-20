import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { KVNamespace, R2Bucket } from '@cloudflare/workers-types';
import type { ActivitySettings, Session } from '@/types';
import { SESSION_TTL_MINUTES } from './constants';

const SESSION_PREFIX = 'session:';
const TOKEN_PREFIX = 'token:';
const SETTINGS_KEY = 'settings';
const GENERATED_PREFIX = 'generated';
const DEFAULT_SETTINGS: ActivitySettings = {
  startMode: 'qr_scan',
  updatedAt: new Date(0).toISOString(),
};

const memorySessions = new Map<string, Session>();
const memoryTokens = new Map<string, string>();
let memorySettings: ActivitySettings = DEFAULT_SETTINGS;
const memoryArtifacts = new Map<string, { body: ArrayBuffer; contentType: string }>();

interface StoreBindings {
  kv?: KVNamespace;
  artifacts?: R2Bucket;
}

async function getStoreBindings(): Promise<StoreBindings> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return {
      kv: env.IP_VERSE_DATA,
      artifacts: env.IP_VERSE_ARTIFACTS,
    };
  } catch (error) {
    console.warn('Cloudflare bindings unavailable, using in-memory store.', error);
    return {};
  }
}

export async function createSession(session: Session): Promise<void> {
  const { kv } = await getStoreBindings();

  if (kv) {
    await Promise.all([
      kv.put(`${SESSION_PREFIX}${session.id}`, JSON.stringify(session)),
      kv.put(`${TOKEN_PREFIX}${session.token}`, session.id, {
        expirationTtl: getSessionTTLMs() / 1000,
      }),
    ]);
  } else {
    memorySessions.set(session.id, session);
    memoryTokens.set(session.token, session.id);
  }

  console.log(`Session created: ${session.id} (email: ${session.email})`);
}

export async function findSessionById(id: string): Promise<Session | undefined> {
  const session = await getSessionRaw(id);
  return validateUsableSession(session);
}

export async function findSessionByToken(
  token: string
): Promise<Session | undefined> {
  const { kv } = await getStoreBindings();
  let sessionId: string | undefined | null;

  if (kv) {
    sessionId = await kv.get(`${TOKEN_PREFIX}${token}`);
  } else {
    sessionId = memoryTokens.get(token);
  }

  if (!sessionId) return undefined;
  return findSessionById(sessionId);
}

export async function updateSession(
  id: string,
  updates: Partial<Session>
): Promise<Session | undefined> {
  const session = await getSessionRaw(id);
  if (!session) return undefined;

  const updated: Session = { ...session, ...updates };
  const { kv } = await getStoreBindings();

  if (kv) {
    await kv.put(`${SESSION_PREFIX}${id}`, JSON.stringify(updated));
  } else {
    memorySessions.set(id, updated);
  }

  return updated;
}

export async function deleteSession(id: string): Promise<void> {
  const { kv } = await getStoreBindings();
  if (kv) {
    await kv.delete(`${SESSION_PREFIX}${id}`);
  } else {
    memorySessions.delete(id);
  }
}

export async function listSessions(limit = 200): Promise<Session[]> {
  const { kv } = await getStoreBindings();

  if (kv) {
    const listed = await kv.list({ prefix: SESSION_PREFIX, limit: Math.min(limit, 1000) });
    const sessions = await Promise.all(
      listed.keys.map((key) => kv.get<Session>(key.name, 'json'))
    );
    return sessions
      .filter((session): session is Session => Boolean(session))
      .sort(sortNewestFirst);
  }

  return Array.from(memorySessions.values()).sort(sortNewestFirst).slice(0, limit);
}

export async function getActivitySettings(): Promise<ActivitySettings> {
  const { kv } = await getStoreBindings();
  if (kv) {
    const settings = await kv.get<ActivitySettings>(SETTINGS_KEY, 'json');
    return settings || DEFAULT_SETTINGS;
  }

  return memorySettings;
}

export async function updateActivitySettings(
  updates: Partial<ActivitySettings>
): Promise<ActivitySettings> {
  const settings: ActivitySettings = {
    ...(await getActivitySettings()),
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const { kv } = await getStoreBindings();
  if (kv) {
    await kv.put(SETTINGS_KEY, JSON.stringify(settings));
  } else {
    memorySettings = settings;
  }

  return settings;
}

export async function saveGeneratedImage(
  sessionId: string,
  imageBase64: string
): Promise<{ key: string; url: string }> {
  const key = `${GENERATED_PREFIX}/${sessionId}.png`;
  const body = Buffer.from(imageBase64, 'base64');
  const { artifacts } = await getStoreBindings();

  if (artifacts) {
    await artifacts.put(key, body, {
      httpMetadata: {
        contentType: 'image/png',
        cacheControl: 'public, max-age=3600',
      },
      customMetadata: {
        sessionId,
        deleteAfterDays: '15',
      },
    });
  } else {
    memoryArtifacts.set(key, {
      body: copyToArrayBuffer(body),
      contentType: 'image/png',
    });
  }

  return {
    key,
    url: `/api/artifacts/${key}`,
  };
}

export async function getGeneratedImage(key: string): Promise<{
  body: BodyInit;
  contentType: string;
} | null> {
  const { artifacts } = await getStoreBindings();

  if (artifacts) {
    const object = await artifacts.get(key);
    if (!object) return null;

    return {
      body: object.body as unknown as BodyInit,
      contentType: object.httpMetadata?.contentType || 'image/png',
    };
  }

  return memoryArtifacts.get(key) || null;
}

function copyToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

export function getSessionTTLMs(): number {
  return SESSION_TTL_MINUTES * 60 * 1000;
}

async function getSessionRaw(id: string): Promise<Session | undefined> {
  const { kv } = await getStoreBindings();

  if (kv) {
    const session = await kv.get<Session>(`${SESSION_PREFIX}${id}`, 'json');
    return session || undefined;
  }

  return memorySessions.get(id);
}

async function validateUsableSession(
  session: Session | undefined
): Promise<Session | undefined> {
  if (!session) return undefined;

  if (
    session.status !== 'completed' &&
    new Date(session.expiresAt).getTime() < Date.now()
  ) {
    await updateSession(session.id, { status: 'expired' });
    return undefined;
  }

  return session;
}

function sortNewestFirst(a: Session, b: Session): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}
