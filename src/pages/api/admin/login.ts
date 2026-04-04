import type { APIRoute } from 'astro';
import { getAdminToken, SESSION_COOKIE } from '../../../lib/appwrite';

export const prerender = false;

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    const env = (locals as any).runtime?.env ?? {};
    const ADMIN_TOKEN = getAdminToken(env);

    const body = await request.json();
    const { password } = body;

    if (password === ADMIN_TOKEN) {
      cookies.set(SESSION_COOKIE, ADMIN_TOKEN, {
        httpOnly: true,
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });
      return json({ ok: true });
    }

    return json({ ok: false, error: 'Senha incorreta' }, 401);

  } catch (err) {
    console.error('[Admin Login Error]:', err);
    return json({ ok: false, error: 'Erro no servidor' }, 500);
  }
};