import type { APIRoute } from 'astro';
import { getDatabases, getEnv, getIds } from '../../../lib/appwrite';

export const prerender = false;

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
function isAuth(cookies: any, env: any) {
  return cookies.get('geraldo_admin_session')?.value === (env.ADMIN_TOKEN ?? 'geraldo2025');
}

// PATCH — atualizar status do agendamento
export const PATCH: APIRoute = async ({ request, cookies, locals }) => {
  const env = getEnv(locals);
  if (!isAuth(cookies, env)) return json({ ok: false, error: 'Não autorizado' }, 401);
  try {
    const { id, status } = await request.json();
    const db = getDatabases(env);
    const { DB_ID, COL_APPTS } = getIds(env);
    const doc = await db.getDocument(DB_ID, COL_APPTS, id);
    const current = JSON.parse(doc.data);
    await db.updateDocument(DB_ID, COL_APPTS, id, { data: JSON.stringify({ ...current, status }) });
    return json({ ok: true });
  } catch(e: any) { return json({ ok: false, error: e.message }, 500); }
};
