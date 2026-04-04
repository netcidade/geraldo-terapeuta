import type { APIRoute } from 'astro';
import { getDatabases, getEnvIds, ID } from '../../../lib/appwrite';
import { Query } from 'node-appwrite';

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

  const file = url.searchParams.get('file') ?? 'pages.json';
  if (!['pages.json', 'products.json', 'blog.json'].includes(file)) return json({ ok: false, error: 'Arquivo inválido' }, 400);

  try {
    const db = getDatabases(env);
    const { DB_ID, COL_CONTENT, COL_PRODUCTS, COL_BLOG } = getEnvIds(env);

    if (file === 'pages.json') {
      const res = await db.listDocuments(DB_ID, COL_CONTENT, [Query.equal('key', 'pages')]);
      const doc = res.documents[0];
      return json(doc ? JSON.parse(doc.data) : {});
    } else if (file === 'blog.json') {
      const res = await db.listDocuments(DB_ID, COL_BLOG, [Query.limit(100)]);
      return json(res.documents.map((d: any) => JSON.parse(d.data)));
    } else {
      const res = await db.listDocuments(DB_ID, COL_PRODUCTS, [Query.limit(100)]);
      return json(res.documents.map((d: any) => JSON.parse(d.data)));
    }
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
    const { DB_ID, COL_CONTENT, COL_PRODUCTS, COL_BLOG } = getEnvIds(env);

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

    if (body.file === 'products.json') {
      const newProducts: any[] = body.data;
      const existing = await db.listDocuments(DB_ID, COL_PRODUCTS, [Query.limit(100)]);
      await Promise.all(existing.documents.map((d: any) => db.deleteDocument(DB_ID, COL_PRODUCTS, d.$id)));
      await Promise.all(newProducts.map((p: any) =>
        db.createDocument(DB_ID, COL_PRODUCTS, ID.unique(), { slug: p.slug, data: JSON.stringify(p) })
      ));
      return json({ ok: true });
    }

    if (body.file === 'blog.json') {
      const newPosts: any[] = body.data;
      const existing = await db.listDocuments(DB_ID, COL_BLOG, [Query.limit(100)]);
      await Promise.all(existing.documents.map((d: any) => db.deleteDocument(DB_ID, COL_BLOG, d.$id)));
      await Promise.all(newPosts.map((p: any) =>
        db.createDocument(DB_ID, COL_BLOG, ID.unique(), { slug: p.slug, data: JSON.stringify(p) })
      ));
      return json({ ok: true });
    }

    return json({ ok: false, error: 'Arquivo não suportado' }, 400);
  } catch (e: any) {
    console.error('[content POST]', e);
    return json({ ok: false, error: e.message }, 500);
  }
};