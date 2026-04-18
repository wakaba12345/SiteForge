import { cookies } from 'next/headers';
import { createHmac } from 'node:crypto';

const COOKIE_NAME = 'sf_admin_token';
const SECRET_PASSWORD = process.env.ADMIN_PASSWORD ?? '';

export function makeToken(password: string): string {
  const secret = process.env.ADMIN_HMAC_SECRET ?? 'siteforge-admin';
  return createHmac('sha256', secret).update(password).digest('hex');
}

export async function isAuthenticated(): Promise<boolean> {
  if (!SECRET_PASSWORD) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return token === makeToken(SECRET_PASSWORD);
}

export { COOKIE_NAME };
