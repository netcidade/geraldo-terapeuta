# Nonaca — Site Oficial

Site institucional da **Nonaca Sistema de Identificação** construído com:

- **Astro 4** — framework SSG/SSR
- **React 18** — componentes interativos (islands)
- **Tailwind CSS v3** — estilização
- **Admin Panel** — painel de administração integrado

---

## 🚀 Início rápido

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/nonaca-site.git
cd nonaca-site

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env e defina sua ADMIN_PASSWORD

# 4. Rode em desenvolvimento
npm run dev
```

Acesse: `http://localhost:4321`

---

## 📁 Estrutura do projeto

```
nonaca/
├── src/
│   ├── components/
│   │   └── layout/        # Header, Footer, WhatsAppFAB
│   ├── content/
│   │   ├── pages.json     # Conteúdo editável das páginas
│   │   └── products.json  # Dados dos produtos
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro    # Home
│   │   ├── [slug].astro   # Páginas de produto (dinâmicas)
│   │   ├── quem-somos.astro
│   │   ├── admin/
│   │   │   ├── index.astro  # Painel admin
│   │   │   └── login.astro  # Login
│   │   └── api/admin/     # API routes
│   ├── styles/
│   │   └── global.css
│   └── middleware.ts      # Proteção de rotas admin
├── public/
│   └── uploads/           # Imagens enviadas pelo admin
├── .env.example
├── astro.config.mjs
└── tailwind.config.mjs
```

---

## 🔐 Painel Admin

Acesse `/admin` no seu site.

**Credenciais padrão:**
- URL: `seusite.com/admin`
- Senha: definida em `ADMIN_PASSWORD` no `.env`

**Funcionalidades do admin:**
- ✅ Editar textos com editor HTML rico (WYSIWYG + código)
- ✅ Trocar imagens dos produtos
- ✅ Editar hero/banner da home
- ✅ Gerenciar informações de contato
- ✅ SEO por página (title + meta description)
- ✅ Galeria de mídias
- ✅ Proteção por senha via cookie

---

## 🌐 Deploy

### Vercel (recomendado)
```bash
npm i -g vercel
vercel
```

Configure as variáveis de ambiente no dashboard da Vercel:
- `ADMIN_PASSWORD` = sua senha segura
- `ADMIN_TOKEN` = mesmo valor ou token único

### Netlify
```bash
npm run build
# Suba a pasta dist/ para o Netlify
```

---

## 📝 Editando conteúdo

### Via painel admin (recomendado)
Acesse `/admin` e use a interface visual.

### Via arquivos JSON (direto)
- `src/content/pages.json` — textos das páginas
- `src/content/products.json` — dados dos produtos

Os campos suportam HTML completo: `<strong>`, `<em>`, `<ul>`, `<li>`, `<h2>`, `<a>`, `<br>`, etc.

---

## 🛠️ Comandos

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Pré-visualizar o build |

---

## 📞 Nonaca

- 🌐 [nonaca.com.br](https://nonaca.com.br)
- 📍 Rua Eduardo Benjamin Hosken, 200 — Londrina/PR
- 📞 (43) 3026-1326 / (43) 3323-3692
- 💬 WhatsApp: (43) 98817-9234
