import type { APIRoute } from 'astro';

export const prerender = true; // Gerar de forma estática na build para melhor performance se desejado, ou dinâmico. Como o sitemap é gerado na build, prerender = true para robots.txt garante excelente tempo de carregamento e compatibilidade estática perfeita na raiz!

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site ? site.toString() : 'https://geraldoterapeuta.com.br';
  const sitemapUrl = new URL('sitemap-index.xml', siteUrl).href;

  const robotsTxt = `
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

# Bloqueia rastreadores de inteligência artificial agressivos para proteger os conteúdos autorais
User-agent: GPTBot
Disallow: /
User-agent: ChatGPT-User
Disallow: /
User-agent: Google-Extended
Disallow: /
User-agent: Anthropic-ai
Disallow: /
User-agent: Claude-Web
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: PerplexityBot
Disallow: /
User-agent: Omgilibot
Disallow: /
User-agent: FacebookBot
Disallow: /

Sitemap: ${sitemapUrl}
`.trim();

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, must-revalidate'
    }
  });
};
