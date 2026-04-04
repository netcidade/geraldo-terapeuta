import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
    const runtime = (locals as any).runtime;
    const env = runtime?.env ?? {};

    return new Response(JSON.stringify({
        hasRuntime: !!runtime,
        hasEnv: !!runtime?.env,
        keys: Object.keys(env),
        APPWRITE_ENDPOINT: env.APPWRITE_ENDPOINT ?? 'NÃO ENCONTRADO',
        ADMIN_TOKEN_EXISTS: !!env.ADMIN_TOKEN,
        APPWRITE_API_KEY_EXISTS: !!env.APPWRITE_API_KEY,
    }, null, 2), {
        headers: { 'Content-Type': 'application/json' },
    });
};