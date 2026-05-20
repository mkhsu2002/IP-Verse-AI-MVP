import type { KVNamespace, R2Bucket } from '@cloudflare/workers-types';

declare global {
  interface CloudflareEnv {
    IP_VERSE_DATA?: KVNamespace;
    IP_VERSE_ARTIFACTS?: R2Bucket;
    ADMIN_TOKEN?: string;
  }
}

export {};
