import type { APIRoute } from 'astro';
import { getStorage, getEnvIds, ID } from '../../../lib/appwrite';

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

function getPublicUrl(fileId: string, env: any) {
  const endpoint = env.APPWRITE_ENDPOINT ?? '';
  const project = env.APPWRITE_PROJECT_ID ?? '';
  const bucket = env.APPWRITE_BUCKET_MEDIA ?? 'media';
  return `${endpoint}/storage/buckets/${bucket}/files/${fileId}/view?project=${project}`;
}

export const GET: APIRoute = async ({ cookies, locals }) => {
  const env = locals;
  if (!isAuthorized(cookies, env)) return json({ ok: false, error: 'Não autorizado' }, 401);
  try {
    const { BUCKET_MEDIA } = getEnvIds(env);
    const s = getStorage(env);
    const res = await s.listFiles(BUCKET_MEDIA);
    const media = res.files.map((f: any) => ({
      name: f.name,
      id: f.$id,
      url: getPublicUrl(f.$id, env),
    }));
    return json({ ok: true, media });
  } catch (e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const env = locals;
  if (!isAuthorized(cookies, env)) return json({ ok: false, error: 'Não autorizado' }, 401);
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return json({ ok: false, error: 'Nenhum arquivo enviado' }, 400);

    // Garante que o tipo seja reconhecido corretamente pelo Appwrite
    // Alguns sistemas podem não passar o MIME type corretamente no objeto File nativo
    const type = file.type || (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') ? 'image/jpeg' : 'image/png');
    const blob = new Blob([await file.arrayBuffer()], { type });
    
    // TESTE DE OURO: Renomeando o arquivo para terminar com o MIME type (ex: foto.image/jpeg)
    // Se isso funcionar, confirma que o bucket está mal configurado.
    const fakeName = file.name + "." + type;
    const fixedFile = new File([blob], fakeName, { type });

    const { BUCKET_MEDIA } = getEnvIds(env);
    const s = getStorage(env);

    try {
      // Na versão 23+ do node-appwrite, passamos o objeto File nativo diretamente no Node.js
      const result = await s.createFile(BUCKET_MEDIA, ID.unique(), fixedFile);
      return json({ ok: true, file: { id: result.$id, name: result.name, url: getPublicUrl(result.$id, env) } });
    } catch (createError: any) {
      // Erro ao criar? Vamos tentar descobrir as permissões do bucket
      console.error("Erro no createFile:", createError);
      try {
        const bucket = await s.getBucket(BUCKET_MEDIA);
        const allowed = bucket.allowedFileExtensions || ["Qualquer uma"];
        return json({ 
          ok: false, 
          error: `${createError.message}. Extensões permitidas no Appwrite: ${allowed.join(', ')}` 
        }, 400);
      } catch (bucketError) {
        return json({ ok: false, error: createError.message }, 400);
      }
    }
  } catch (e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};

export const DELETE: APIRoute = async ({ request, cookies, locals }) => {
  const env = locals;
  if (!isAuthorized(cookies, env)) return json({ ok: false, error: 'Não autorizado' }, 401);
  try {
    const { id } = await request.json();
    if (!id) return json({ ok: false, error: 'ID inválido' }, 400);
    const { BUCKET_MEDIA } = getEnvIds(env);
    const s = getStorage(env);
    await s.deleteFile(BUCKET_MEDIA, id);
    return json({ ok: true });
  } catch (e: any) {
    return json({ ok: false, error: e.message }, 500);
  }
};