import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, DEFAULT_ADMIN_TOKEN } from './lib/appwrite';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const env = (context.locals as any).runtime?.env ?? {};
    const ADMIN_TOKEN = env.ADMIN_TOKEN ?? import.meta.env.ADMIN_TOKEN ?? DEFAULT_ADMIN_TOKEN;
    const session = context.cookies.get(SESSION_COOKIE);
    if (!session || session.value !== ADMIN_TOKEN) {
      return context.redirect('/admin/login');
    }
  }

  return next();
});