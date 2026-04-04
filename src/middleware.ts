import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, DEFAULT_ADMIN_TOKEN, getEnvIds } from './lib/appwrite';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    // Usamos context.locals diretamente (que agora o appwrite.ts sabe lidar)
    const { ADMIN_TOKEN: token } = getEnvIds(context.locals);
    const ADMIN_TOKEN = token || import.meta.env.ADMIN_TOKEN || DEFAULT_ADMIN_TOKEN;
    
    const session = context.cookies.get(SESSION_COOKIE);
    if (!session || session.value !== ADMIN_TOKEN) {
      return context.redirect('/admin/login');
    }
  }

  return next();
});