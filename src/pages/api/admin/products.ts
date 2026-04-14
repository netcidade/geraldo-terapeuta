import type { APIRoute } from 'astro';
import { getDatabases, getEnv, getIds, ID } from '../../../lib/appwrite';

export const prerender = false;

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

function isAuth(cookies: any, env: any) {
  return cookies.get('geraldo_admin_session')?.value === (env.ADMIN_TOKEN ?? 'geraldo2025');
}

// POST - Criar ou Atualizar Especialidade
export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const env = getEnv(locals);
  if (!isAuth(cookies, env)) return json({ ok: false, error: 'Não autorizado' }, 401);
  
  try {
    const body = await request.json();
    const db = getDatabases(env);
    const { DB_ID, COL_PRODUCTS } = getIds(env);
    
    const payload = {
      slug: body.slug,
      data: JSON.stringify(body),
    };

    if (body.id) {
      await db.updateDocument(DB_ID, COL_PRODUCTS, body.id, payload);
    } else {
      await db.createDocument(DB_ID, COL_PRODUCTS, ID.unique(), payload);
    }
    
    return json({ ok: true });
  } catch(e: any) { 
    return json({ ok: false, error: e.message }, 500); 
  }
};

// DELETE - Excluir Especialidade
export const DELETE: APIRoute = async ({ request, cookies, locals }) => {
  const env = getEnv(locals);
  if (!isAuth(cookies, env)) return json({ ok: false, error: 'Não autorizado' }, 401);
  
  try {
    const { id } = await request.json();
    const db = getDatabases(env);
    const { DB_ID, COL_PRODUCTS } = getIds(env);
    
    await db.deleteDocument(DB_ID, COL_PRODUCTS, id);
    
    return json({ ok: true });
  } catch(e: any) { 
    return json({ ok: false, error: e.message }, 500); 
  }
};
