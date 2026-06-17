import { auth } from '@/lib/firebase/config';

/**
 * fetch que anexa o ID token do admin logado no header Authorization.
 * As rotas /api/admin/* verificam esse token (verifyAdminToken).
 */
export async function authedFetch(
  input: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = await auth.currentUser?.getIdToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body) headers.set('Content-Type', 'application/json');
  return fetch(input, { ...init, headers });
}
