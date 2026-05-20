import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function validateAdminRequest(request: Request): Promise<boolean> {
  const expectedToken = await getAdminToken();
  if (!expectedToken) return false;

  const authHeader = request.headers.get('authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : '';
  const headerToken = request.headers.get('x-admin-token') || '';
  const token = bearerToken || headerToken;

  return token === expectedToken;
}

async function getAdminToken(): Promise<string | undefined> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.ADMIN_TOKEN || process.env.ADMIN_TOKEN;
  } catch {
    return process.env.ADMIN_TOKEN;
  }
}
