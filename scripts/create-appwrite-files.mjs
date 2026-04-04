// Cria todos os arquivos necessários para integração com Appwrite
import fs from 'node:fs';

// ── src/lib/appwrite.ts ──────────────────────────────────
fs.writeFileSync('src/lib/appwrite.ts', `import { Client, Databases, Storage, ID } from 'node-appwrite';

const ENDPOINT = import.meta.env.APPWRITE_ENDPOINT ?? '';
const PROJECT  = import.meta.env.APPWRITE_PROJECT_ID ?? '';
const API_KEY  = import.meta.env.APPWRITE_API_KEY ?? '';

export const DB_ID        = import.meta.env.APPWRITE_DB_ID ?? '';
export const COL_CONTENT  = import.meta.env.APPWRITE_COLLECTION_CONTENT ?? 'site_content';
export const COL_PRODUCTS = import.meta.env.APPWRITE_COLLECTION_PRODUCTS ?? 'products';
export const BUCKET_MEDIA = import.meta.env.APPWRITE_BUCKET_MEDIA ?? 'media';

export function getClient() {
  return new Client().setEndpoint(ENDPOINT).setProject(PROJECT).setKey(API_KEY);
}
export const getDatabases = () => new Databases(getClient());
export const getStorage   = () => new Storage(getClient());
export { ID };
`);
console.log('✅ src/lib/appwrite.ts');

// ── src/pages/api/admin/content.ts ───────────────────────
fs.writeFileSync('src/pages/api/admin/content.ts', `import type { APIRoute } from 'astro';
import { getDatabases, DB_ID, COL_CONTENT, COL_PRODUCTS, ID } from '../../../lib/appwrite';
import { Query } from 'node-appwrite';

export const prerender = false;

const ADMIN_TOKEN = import.meta.env.ADMIN_TOKEN ?? 'nonaca2025';
const ALLOWED     = ['pages.json', 'products.json'];

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}
function isAuthorized(cookies: any) {
  return cookies.get('nonaca_admin_session')?.value === ADMIN_TOKEN;
}

// ── GET ── lê conteúdo do Appwrite
export const GET: APIRoute = async ({ url, cookies }) => {
  if (!isAuthorized(cookies)) return json({ ok: false, error: 'Não autorizado' }, 401);
  const file = url.searchParams.get('file') ?? 'pages.json';
  if (!ALLOWED.includes(file)) return json({ ok: false, error: 'Arquivo inválido' }, 400);
  try {
    const db = getDatabases();
    if (file === 'pages.json') {
      const res = await db.listDocuments(DB_ID, COL_CONTENT, [Query.equal('key', 'pages')]);
      const doc = res.documents[0];
      return json(doc ? JSON.parse(doc.data) : {});
    } else {
      const res = await db.listDocuments(DB_ID, COL_PRODUCTS, [Query.limit(100)]);
      const products = res.documents.map((d: any) => JSON.parse(d.data));
      return json(products);
    }
  } catch(e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};

// ── POST ── salva conteúdo no Appwrite
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthorized(cookies)) return json({ ok: false, error: 'Não autorizado' }, 401);
  try {
    const body = await request.json();
    const db = getDatabases();

    if (body.file === 'pages.json') {
      // Salva seção de páginas
      const section  = body.section;    // ex: 'home', 'contato'
      const newData  = body.data;

      // Busca documento atual
      const res = await db.listDocuments(DB_ID, COL_CONTENT, [Query.equal('key', 'pages')]);
      const doc = res.documents[0];

      let current: any = doc ? JSON.parse(doc.data) : {};
      if (section) current[section] = newData;
      else current = newData;

      if (doc) {
        await db.updateDocument(DB_ID, COL_CONTENT, doc.$id, { data: JSON.stringify(current) });
      } else {
        await db.createDocument(DB_ID, COL_CONTENT, ID.unique(), { key: 'pages', data: JSON.stringify(current) });
      }
      return json({ ok: true });
    }

    if (body.file === 'products.json') {
      const newProducts: any[] = body.data;

      // Apaga todos e recria (mais simples que diff)
      const existing = await db.listDocuments(DB_ID, COL_PRODUCTS, [Query.limit(100)]);
      await Promise.all(existing.documents.map((d: any) => db.deleteDocument(DB_ID, COL_PRODUCTS, d.$id)));
      await Promise.all(newProducts.map((p: any) =>
        db.createDocument(DB_ID, COL_PRODUCTS, ID.unique(), { slug: p.slug, data: JSON.stringify(p) })
      ));
      return json({ ok: true });
    }

    return json({ ok: false, error: 'Arquivo não suportado' }, 400);
  } catch(e: any) {
    console.error('[content POST]', e);
    return json({ ok: false, error: e.message }, 500);
  }
};
`);
console.log('✅ src/pages/api/admin/content.ts');

// ── src/pages/api/admin/media.ts ─────────────────────────
fs.writeFileSync('src/pages/api/admin/media.ts', `import type { APIRoute } from 'astro';
import { getStorage, BUCKET_MEDIA, ID } from '../../../lib/appwrite';

export const prerender = false;

const ADMIN_TOKEN = import.meta.env.ADMIN_TOKEN ?? 'nonaca2025';
function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}
function isAuthorized(cookies: any) {
  return cookies.get('nonaca_admin_session')?.value === ADMIN_TOKEN;
}

const APPWRITE_ENDPOINT = import.meta.env.APPWRITE_ENDPOINT ?? '';
const APPWRITE_PROJECT  = import.meta.env.APPWRITE_PROJECT_ID ?? '';

function getPublicUrl(fileId: string) {
  return \`\${APPWRITE_ENDPOINT}/storage/buckets/\${BUCKET_MEDIA}/files/\${fileId}/view?project=\${APPWRITE_PROJECT}\`;
}

// ── GET ── lista arquivos do bucket
export const GET: APIRoute = async ({ cookies }) => {
  if (!isAuthorized(cookies)) return json({ ok: false, error: 'Não autorizado' }, 401);
  try {
    const s = getStorage();
    const res = await s.listFiles(BUCKET_MEDIA);
    const media = res.files.map((f: any) => ({
      name: f.name,
      id:   f.$id,
      url:  getPublicUrl(f.$id),
    }));
    return json({ ok: true, media });
  } catch(e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};

// ── POST ── faz upload de imagem
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!isAuthorized(cookies)) return json({ ok: false, error: 'Não autorizado' }, 401);
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return json({ ok: false, error: 'Nenhum arquivo enviado' }, 400);

    const s = getStorage();
    const result = await s.createFile(BUCKET_MEDIA, ID.unique(), file);
    return json({ ok: true, file: { id: result.$id, name: result.name, url: getPublicUrl(result.$id) } });
  } catch(e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};

// ── DELETE ── remove arquivo do bucket
export const DELETE: APIRoute = async ({ request, cookies }) => {
  if (!isAuthorized(cookies)) return json({ ok: false, error: 'Não autorizado' }, 401);
  try {
    const { id } = await request.json();
    if (!id) return json({ ok: false, error: 'ID inválido' }, 400);
    const s = getStorage();
    await s.deleteFile(BUCKET_MEDIA, id);
    return json({ ok: true });
  } catch(e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};
`);
console.log('✅ src/pages/api/admin/media.ts');

console.log('\n🎉 Todos os arquivos criados! Agora edite admin/index.astro frontmatter.');
