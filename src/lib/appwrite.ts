import { Client, Databases, Storage, ID } from 'node-appwrite';

export { ID };

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
  // 1. Valores padrão e do Vite (Local)
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
  
  // 2. Extração Exploratória (Astro 6 / Cloudflare)
  // No Astro 6, os bindings estão no Astro.locals.runtime (dev) ou passados via parâmetro (prod)
  const runtime = runtimeEnv?.runtime ?? runtimeEnv ?? {};
  
  const keys = [
    'APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY', 
    'APPWRITE_DB_ID', 'APPWRITE_COLLECTION_CONTENT', 'APPWRITE_COLLECTION_PRODUCTS',
    'APPWRITE_COLLECTION_BLOG', 'APPWRITE_COLLECTION_APPTS', 'APPWRITE_BUCKET_MEDIA',
    'ADMIN_TOKEN', 'SITE_URL'
  ];

  const cloudflareEnv: Record<string, string> = {};
  for (const key of keys) {
    // Tenta primeiro no objeto de runtime (Astro 6 padrão)
    if (runtime && typeof runtime === 'object' && runtime[key]) {
      cloudflareEnv[key] = runtime[key];
    } 
    // Tenta direto no objeto passado (Acesso direto)
    else if (runtimeEnv && runtimeEnv[key]) {
      cloudflareEnv[key] = runtimeEnv[key];
    }
  }
  
  return { ...viteEnv, ...cloudflareEnv };
}

// env vem do locals.runtime.env de cada request
export function getClient(env: any) {
  const merged = mergeEnv(env);
  const endpoint = merged.APPWRITE_ENDPOINT ?? '';
  const project = merged.APPWRITE_PROJECT_ID ?? '';
  const apiKey = merged.APPWRITE_API_KEY ?? '';
  return new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
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
    DB_ID: merged.APPWRITE_DB_ID ?? '',
    COL_CONTENT: merged.APPWRITE_COLLECTION_CONTENT ?? 'site_content',
    COL_PRODUCTS: merged.APPWRITE_COLLECTION_PRODUCTS ?? 'products',
    COL_BLOG: merged.APPWRITE_COLLECTION_BLOG ?? 'blog',
    COL_APPTS: merged.APPWRITE_COLLECTION_APPTS ?? 'appointments', // Novo: Coleção de agendamentos
    BUCKET_MEDIA: merged.APPWRITE_BUCKET_MEDIA ?? 'media',
    ADMIN_TOKEN: merged.ADMIN_TOKEN ?? 'geraldo2025',
    SITE_URL: merged.SITE_URL ?? 'https://geraldoterapeuta.com.br',
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
