import type { APIRoute } from 'astro';
import { getDatabases, getEnvIds, ID, Query } from '../../../lib/appwrite';

export const prerender = false;

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}

import { getAdminToken, SESSION_COOKIE } from '../../../lib/appwrite';

function isAuthorized(cookies: any, env: any) {
  const ADMIN_TOKEN = getAdminToken(env);
  return cookies.get(SESSION_COOKIE)?.value === ADMIN_TOKEN;
}

export const GET: APIRoute = async ({ url, cookies, locals }) => {
  const env = locals;
  if (!isAuthorized(cookies, env)) return json({ ok: false, error: 'Não autorizado' }, 401);

  try {
    const db = getDatabases(env);
    const { DB_ID, COL_CONTENT } = getEnvIds(env);

    const res = await db.listDocuments(DB_ID, COL_CONTENT, [Query.equal('key', 'pages')]);
    const doc = res.documents[0];
    return json(doc ? JSON.parse(doc.data) : {});
  } catch (e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const env = locals;
  if (!isAuthorized(cookies, env)) return json({ ok: false, error: 'Não autorizado' }, 401);

  try {
    const body = await request.json();
    const db = getDatabases(env);
    const { DB_ID, COL_CONTENT } = getEnvIds(env);

    if (body.file === 'pages.json') {
      const res = await db.listDocuments(DB_ID, COL_CONTENT, [Query.equal('key', 'pages')]);
      const doc = res.documents[0];
      let current: any = doc ? JSON.parse(doc.data) : {};
      
      if (body.section) current[body.section] = body.data;
      else current = body.data;

      if (doc) {
        await db.updateDocument(DB_ID, COL_CONTENT, doc.$id, { data: JSON.stringify(current) });
      } else {
        await db.createDocument(DB_ID, COL_CONTENT, ID.unique(), { key: 'pages', data: JSON.stringify(current) });
      }
      return json({ ok: true });
    }

    return json({ ok: false, error: 'Arquivo não suportado' }, 400);
  } catch (e: any) {
    console.error('[content POST]', e);
    return json({ ok: false, error: e.message }, 500);
  }
};