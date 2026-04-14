import { Client, Databases, Storage, ID, Query } from 'node-appwrite';

export { ID, Query };

// Constantes exportadas que dependem do env do request
export const COL_CONTENT = 'site_content';
export const COL_PRODUCTS = 'products';
export const COL_BLOG = 'blog';
export const BUCKET_MEDIA = 'media';
export const SESSION_COOKIE = 'geraldo_admin_session';
export const DEFAULT_ADMIN_TOKEN = 'geraldo2025';

/**
 * Mescla o env do Cloudflare runtime (producao/wrangler dev)
 * com o import.meta.env do Vite (npm run dev local).
 * O runtime tem prioridade quando disponivel.
 */
export function mergeEnv(runtimeEnv: any): any {
  // 1. Valores do Vite (Local/Build time) - Fallback
  const viteEnv: Record<string, string> = {
    APPWRITE_ENDPOINT: import.meta.env.PUBLIC_APPWRITE_ENDPOINT ?? import.meta.env.VITE_APPWRITE_ENDPOINT ?? import.meta.env.APPWRITE_ENDPOINT ?? '',
    APPWRITE_PROJECT_ID: import.meta.env.PUBLIC_APPWRITE_PROJECT_ID ?? import.meta.env.VITE_APPWRITE_PROJECT_ID ?? import.meta.env.APPWRITE_PROJECT_ID ?? '',
    APPWRITE_API_KEY: import.meta.env.APPWRITE_API_KEY ?? import.meta.env.VITE_APPWRITE_API_KEY ?? '',
    APPWRITE_DB_ID: import.meta.env.PUBLIC_APPWRITE_DATABASE_ID ?? import.meta.env.APPWRITE_DB_ID ?? '',
    APPWRITE_COLLECTION_CONTENT: import.meta.env.APPWRITE_COLLECTION_CONTENT ?? 'site_content',
    APPWRITE_COLLECTION_PRODUCTS: import.meta.env.APPWRITE_COLLECTION_PRODUCTS ?? 'products',
    APPWRITE_COLLECTION_BLOG: import.meta.env.APPWRITE_COLLECTION_BLOG ?? 'blog',
    APPWRITE_COLLECTION_APPTS: import.meta.env.APPWRITE_COLLECTION_APPTS ?? 'appointments',
    APPWRITE_BUCKET_MEDIA: import.meta.env.APPWRITE_BUCKET_MEDIA ?? 'media',
    ADMIN_TOKEN: import.meta.env.ADMIN_TOKEN ?? 'geraldo2025',
    SITE_URL: import.meta.env.SITE_URL ?? 'https://geraldoterapeuta.com.br',
  };
  
  /**
   * 2. Extração do Cloudflare Runtime (Cloudflare Pages / Workers)
   * No Astro com Cloudflare, as variáveis estão geralmente em:
   * Astro.locals.runtime.env ou Astro.locals.runtime.env
   */
  const cloudflareEnv: Record<string, string> = {};
  
  try {
    // Escolhemos a fonte mais provável para as variáveis de ambiente no Cloudflare
    const potentialEnv = 
      runtimeEnv?.runtime?.env || 
      runtimeEnv?.env || 
      runtimeEnv?.runtime || 
      {};

    const keys = [
      'APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY', 
      'APPWRITE_DB_ID', 'APPWRITE_COLLECTION_CONTENT', 'APPWRITE_COLLECTION_PRODUCTS',
      'APPWRITE_COLLECTION_BLOG', 'APPWRITE_COLLECTION_APPTS', 'APPWRITE_BUCKET_MEDIA',
      'ADMIN_TOKEN', 'SITE_URL'
    ];

    for (const key of keys) {
      const val = potentialEnv[key];
      if (val && typeof val === 'string') {
        cloudflareEnv[key] = val;
      }
    }
  } catch (err) {
    console.error('[mergeEnv Error]', err);
  }
  
  // 3. Mesclagem Final
  // Variáveis em tempo de execução (Cloudflare) SEMPRE ganham dos valores de Build
  const final = { ...viteEnv, ...cloudflareEnv };
  
  return final;
}

// env vem do locals.runtime.env de cada request
export function getClient(env: any) {
  const merged = mergeEnv(env);
  const endpoint = merged.APPWRITE_ENDPOINT || '';
  const project = merged.APPWRITE_PROJECT_ID || '';
  const apiKey = merged.APPWRITE_API_KEY || '';
  
  const client = new Client();
  
  if (endpoint) client.setEndpoint(endpoint);
  if (project) client.setProject(project);
  if (apiKey) client.setKey(apiKey);
  
  return client;
}

export function getDatabases(env: any) {
  return new Databases(getClient(env));
}

export function getStorage(env: any) {
  return new Storage(getClient(env));
}

export function getEnvIds(env: any) {
  const merged = mergeEnv(env);
  return {
    DB_ID: merged.APPWRITE_DB_ID || '',
    COL_CONTENT: merged.APPWRITE_COLLECTION_CONTENT || 'site_content',
    COL_PRODUCTS: merged.APPWRITE_COLLECTION_PRODUCTS || 'products',
    COL_BLOG: merged.APPWRITE_COLLECTION_BLOG || 'blog',
    COL_APPTS: merged.APPWRITE_COLLECTION_APPTS || 'appointments',
    BUCKET_MEDIA: merged.APPWRITE_BUCKET_MEDIA || 'media',
    ADMIN_TOKEN: merged.ADMIN_TOKEN || 'geraldo2025',
    SITE_URL: merged.SITE_URL || 'https://geraldoterapeuta.com.br',
  };
}

// Aliases para compatibilidade com componentes legados
export const getEnv = mergeEnv;
export const getIds = getEnvIds;

/**
 * Busca posts do blog
 */
export async function getBlogPosts(env: any, limit: number = 10) {
  const { DB_ID, COL_BLOG } = getEnvIds(env);
  const db = getDatabases(env);
  try {
    const response = await db.listDocuments(DB_ID, COL_BLOG);
    return response.documents;
  } catch (e) {
    console.error('Erro ao buscar blog posts:', e);
    return [];
  }
}

/**
 * Busca um único post do blog por slug
 */
export async function getBlogPost(env: any, slug: string) {
  const { DB_ID, COL_BLOG } = getEnvIds(env);
  const db = getDatabases(env);
  try {
    const { Query } = await import('node-appwrite');
    const response = await db.listDocuments(DB_ID, COL_BLOG, [
      Query.equal('slug', slug)
    ]);
    return response.documents[0] || null;
  } catch (e) {
    console.error('Erro ao buscar blog post:', e);
    return null;
  }
}

export function getAdminToken(env: any): string {
  return mergeEnv(env).ADMIN_TOKEN ?? DEFAULT_ADMIN_TOKEN;
}

/**
 * Envolve uma Promise com um timeout de segurança.
 * Útil para evitar que o site trave em caso de lentidão na rede com o Appwrite.
 */
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
