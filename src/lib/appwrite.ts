import { Client, Databases, Storage, ID, Query } from 'node-appwrite';

export { ID, Query };

// Constantes
export const COL_CONTENT = 'site_content';
export const COL_PRODUCTS = 'products';
export const COL_BLOG = 'blog';
export const COL_TESTIMONIALS = 'depoimentos';
export const BUCKET_MEDIA = 'media';
export const SESSION_COOKIE = 'geraldo_admin_session';
export const DEFAULT_ADMIN_TOKEN = 'geraldo2025';

/**
 * PADRÃO ASTRO 6 / CLOUDFLARE
 * Tentamos importar o ambiente oficial do Cloudflare. 
 * Em local dev, o Astro preenche isso via platformProxy.
 */
let cloudflareEnv: any = {};
try {
  // @ts-ignore
  const workers = await import('cloudflare:workers');
  cloudflareEnv = workers.env || {};
} catch (e) {
  // Ambiente sem suporte a workers (ex: build estático puro ou local sem proxy)
}

/**
 * Mescla as variáveis de forma limpa.
 */
export function mergeEnv(_runtimeEnv?: any): any {
  // No Astro 6, ignoramos o runtimeEnv e usamos o cloudflareEnv importado acima
  const viteEnv = {
    APPWRITE_ENDPOINT: import.meta.env.VITE_APPWRITE_ENDPOINT ?? import.meta.env.APPWRITE_ENDPOINT ?? '',
    APPWRITE_PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID ?? import.meta.env.APPWRITE_PROJECT_ID ?? '',
    APPWRITE_API_KEY: import.meta.env.VITE_APPWRITE_API_KEY ?? import.meta.env.APPWRITE_API_KEY ?? '',
    APPWRITE_DB_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID ?? import.meta.env.APPWRITE_DB_ID ?? '',
    APPWRITE_COLLECTION_CONTENT: import.meta.env.APPWRITE_COLLECTION_CONTENT ?? 'site_content',
    APPWRITE_COLLECTION_PRODUCTS: import.meta.env.APPWRITE_COLLECTION_PRODUCTS ?? 'products',
    APPWRITE_COLLECTION_BLOG: import.meta.env.APPWRITE_COLLECTION_BLOG ?? 'blog',
    APPWRITE_COLLECTION_TESTIMONIALS: import.meta.env.APPWRITE_COLLECTION_TESTIMONIALS ?? 'depoimentos',
    APPWRITE_COLLECTION_APPTS: import.meta.env.APPWRITE_COLLECTION_APPTS ?? 'appointments',
    APPWRITE_BUCKET_MEDIA: import.meta.env.APPWRITE_BUCKET_MEDIA ?? 'media',
    ADMIN_TOKEN: import.meta.env.ADMIN_TOKEN ?? 'geraldo2025',
    SITE_URL: import.meta.env.SITE_URL ?? 'https://geraldoterapeuta.com.br',
  };

  // As variáveis do Cloudflare SEMPRE ganham
  return { ...viteEnv, ...cloudflareEnv };
}

export function getClient(env?: any) {
  const merged = mergeEnv(env);
  const client = new Client();
  
  if (merged.APPWRITE_ENDPOINT) client.setEndpoint(merged.APPWRITE_ENDPOINT);
  if (merged.APPWRITE_PROJECT_ID) client.setProject(merged.APPWRITE_PROJECT_ID);
  if (merged.APPWRITE_API_KEY) client.setKey(merged.APPWRITE_API_KEY);
  
  return client;
}

export function getDatabases(env?: any) {
  return new Databases(getClient(env));
}

export function getStorage(env?: any) {
  return new Storage(getClient(env));
}

export function getEnvIds(env?: any) {
  const merged = mergeEnv(env);
  return {
    DB_ID: merged.APPWRITE_DB_ID || '',
    COL_CONTENT: merged.APPWRITE_COLLECTION_CONTENT || 'site_content',
    COL_PRODUCTS: merged.APPWRITE_COLLECTION_PRODUCTS || 'products',
    COL_BLOG: merged.APPWRITE_COLLECTION_BLOG || 'blog',
    COL_TESTIMONIALS: merged.APPWRITE_COLLECTION_TESTIMONIALS || 'depoimentos',
    COL_APPTS: merged.APPWRITE_COLLECTION_APPTS || 'appointments',
    BUCKET_MEDIA: merged.APPWRITE_BUCKET_MEDIA || 'media',
    ADMIN_TOKEN: merged.ADMIN_TOKEN || 'geraldo2025',
    SITE_URL: merged.SITE_URL || 'https://geraldoterapeuta.com.br',
  };
}

export const getEnv = mergeEnv;
export const getIds = getEnvIds;

export function getAdminToken(env: any): string {
  return mergeEnv(env).ADMIN_TOKEN ?? DEFAULT_ADMIN_TOKEN;
}

/**
 * Busca posts do blog. 
 * Note: Mantivemos o parâmetro 'env' para compatibilidade, mas ele é ignorado no Astro 6.
 */
export async function getBlogPosts(env: any, limit: number = 20) {
  const { DB_ID, COL_BLOG } = getEnvIds(env);
  const db = getDatabases(env);
  try {
    const response = await db.listDocuments(DB_ID, COL_BLOG, [
      Query.limit(limit),
      Query.orderDesc('$createdAt')
    ]);
    return response.documents;
  } catch (e) {
    console.error('Erro ao buscar blog posts:', e);
    return [];
  }
}

/**
 * Busca um único post do blog por slug.
 */
export async function getBlogPost(env: any, slug: string) {
  const { DB_ID, COL_BLOG } = getEnvIds(env);
  const db = getDatabases(env);
  try {
    const response = await db.listDocuments(DB_ID, COL_BLOG, [
      Query.equal('slug', slug)
    ]);
    return response.documents[0] || null;
  } catch (e) {
    console.error('Erro ao buscar blog post:', e);
    return null;
  }
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 2000): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('UND_ERR_CONNECT_TIMEOUT'));
    }, timeoutMs);
  });
  
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    return result;
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}
